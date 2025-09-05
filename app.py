import os
from datetime import datetime, timedelta
from functools import wraps
from bson import ObjectId

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from dotenv import load_dotenv
import bcrypt
import jwt

load_dotenv()

app = Flask(__name__)

# === Config ===
app.config["MONGO_URI"] = os.getenv("MONGO_URI")  # ex: mongodb+srv://user:pwd@cluster/db?retryWrites=true&w=majority
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "change-me")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")

# CORS: autorise précisément ton front (Netlify) + localhost
CORS(app, resources={
    r"/api/*": {
        "origins": [FRONTEND_ORIGIN, "http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
        "supports_credentials": False  # ne pas mettre True avec plusieurs origines
    }
})

mongo = PyMongo(app)

# --- Utils ---
def serialize_doc(doc):
    if doc is None:
        return None
    d = dict(doc)
    d["_id"] = str(d["_id"])
    return d

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"message": "Token manquant"}), 401
        token = auth[7:]
        try:
            data = jwt.decode(token, app.config["JWT_SECRET_KEY"], algorithms=["HS256"])
            current_user_id = data["user_id"]
        except Exception:
            return jsonify({"message": "Token invalide"}), 401
        return f(current_user_id, *args, **kwargs)
    return decorated

# --- Health ---
@app.get("/api/health")
def health():
    return {"status": "ok", "time": datetime.utcnow().isoformat() + "Z"}

# ========== AUTH ==========
@app.post("/api/register")
def register():
    data = request.get_json(force=True)
    email = (data.get("email") or "").strip().lower()
    name = (data.get("name") or "").strip()
    password = data.get("password") or ""
    if not (email and name and password):
        return jsonify({"message": "Champs manquants"}), 400

    if mongo.db.users.find_one({"email": email}):
        return jsonify({"message": "Email déjà utilisé"}), 400

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    user = {
        "name": name,
        "email": email,
        "password": hashed,          # bytes stockés
        "avatar_url": data.get("avatar_url", ""),
        "joined_at": datetime.utcnow()
    }
    res = mongo.db.users.insert_one(user)
    uid = str(res.inserted_id)

    token = jwt.encode({"user_id": uid, "exp": datetime.utcnow() + timedelta(days=30)},
                       app.config["JWT_SECRET_KEY"], algorithm="HS256")

    return jsonify({
        "token": token,
        "user": {"id": uid, "name": name, "email": email, "avatar_url": user["avatar_url"]}
    }), 201

@app.post("/api/login")
def login():
    data = request.get_json(force=True)
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    user = mongo.db.users.find_one({"email": email})
    if not user or not bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        return jsonify({"message": "Email ou mot de passe incorrect"}), 401

    uid = str(user["_id"])
    token = jwt.encode({"user_id": uid, "exp": datetime.utcnow() + timedelta(days=30)},
                       app.config["JWT_SECRET_KEY"], algorithm="HS256")
    return jsonify({
        "token": token,
        "user": {"id": uid, "name": user["name"], "email": user["email"], "avatar_url": user.get("avatar_url", "")}
    })

@app.get("/api/users")
@token_required
def get_users(current_user_id):
    users = list(mongo.db.users.find({}, {"password": 0}).sort("joined_at", 1))
    return jsonify([serialize_doc(u) for u in users])

# ========== REMINDERS ==========
@app.get("/api/reminders")
@token_required
def get_reminders(current_user_id):
    reminders = list(mongo.db.reminders.find().sort("created_at", -1))
    for r in reminders:
        if r.get("created_by"):
            try:
                creator = mongo.db.users.find_one({"_id": ObjectId(r["created_by"])})
                r["created_by_name"] = creator["name"] if creator else "Inconnu"
            except Exception:
                r["created_by_name"] = "Inconnu"
        if r.get("assigned_to"):
            try:
                assignee = mongo.db.users.find_one({"_id": ObjectId(r["assigned_to"])})
                r["assigned_to_name"] = assignee["name"] if assignee else "Inconnu"
            except Exception:
                r["assigned_to_name"] = "Inconnu"
    return jsonify([serialize_doc(r) for r in reminders])

@app.post("/api/reminders")
@token_required
def create_reminder(current_user_id):
    data = request.get_json(force=True)
    due_raw = data.get("due_date")
    due_date = None
    if due_raw:
        try:
            # accepte "YYYY-MM-DDTHH:MM:SS" ou "....Z"
            due_date = datetime.fromisoformat(due_raw.replace("Z", "+00:00"))
        except Exception:
            pass

    reminder = {
        "title": data["title"],
        "description": data.get("description", ""),
        "created_by": current_user_id,
        "assigned_to": data.get("assigned_to"),  # string de l'id utilisateur
        "priority": data.get("priority", "normal"),
        "due_date": due_date,
        "status": "pending",
        "created_at": datetime.utcnow()
    }
    res = mongo.db.reminders.insert_one(reminder)
    reminder["_id"] = str(res.inserted_id)
    return jsonify(serialize_doc(reminder)), 201

@app.put("/api/reminders/<rid>")
@token_required
def update_reminder(current_user_id, rid):
    data = request.get_json(force=True)
    fields = {k: v for k, v in data.items() if k in {"status", "title", "description", "priority", "assigned_to"}}
    if "due_date" in data:
        try:
            fields["due_date"] = datetime.fromisoformat(str(data["due_date"]).replace("Z", "+00:00"))
        except Exception:
            fields["due_date"] = None
    mongo.db.reminders.update_one({"_id": ObjectId(rid)}, {"$set": fields})
    return jsonify({"message": "Rappel mis à jour"})

# ========== RESTAURANTS ==========
@app.get("/api/restaurants")
@token_required
def get_restaurants(current_user_id):
    items = list(mongo.db.restaurants.find().sort("added_at", -1))
    return jsonify([serialize_doc(x) for x in items])

@app.post("/api/restaurants")
@token_required
def create_restaurant(current_user_id):
    data = request.get_json(force=True)
    item = {
        "name": data["name"],
        "address": data.get("address", ""),
        "map_url": data.get("map_url", ""),
        "image_url": data.get("image_url", ""),
        "status": data.get("status", "to_try"),
        "notes": data.get("notes", ""),
        "added_by": current_user_id,
        "added_at": datetime.utcnow()
    }
    res = mongo.db.restaurants.insert_one(item)
    item["_id"] = str(res.inserted_id)
    return jsonify(serialize_doc(item)), 201

# ========== ACTIVITIES ==========
@app.get("/api/activities")
@token_required
def get_activities(current_user_id):
    items = list(mongo.db.activities.find().sort("added_at", -1))
    return jsonify([serialize_doc(x) for x in items])

@app.post("/api/activities")
@token_required
def create_activity(current_user_id):
    data = request.get_json(force=True)
    item = {
        "title": data["title"],
        "category": data.get("category", "other"),
        "status": data.get("status", "planned"),
        "notes": data.get("notes", ""),
        "image_url": data.get("image_url", ""),
        "added_by": current_user_id,
        "added_at": datetime.utcnow()
    }
    res = mongo.db.activities.insert_one(item)
    item["_id"] = str(res.inserted_id)
    return jsonify(serialize_doc(item)), 201

# ========== WISHLIST ==========
@app.get("/api/wishlist")
@token_required
def get_wishlist(current_user_id):
    items = list(mongo.db.wishlist_items.find().sort("added_at", -1))
    return jsonify([serialize_doc(x) for x in items])

@app.post("/api/wishlist")
@token_required
def create_wishlist_item(current_user_id):
    data = request.get_json(force=True)
    item = {
        "title": data["title"],
        "description": data.get("description", ""),
        "image_url": data.get("image_url", ""),
        "link_url": data.get("link_url", ""),
        "for_user": data.get("for_user"),  # id user string
        "added_by": current_user_id,
        "status": data.get("status", "idea"),
        "added_at": datetime.utcnow()
    }
    res = mongo.db.wishlist_items.insert_one(item)
    item["_id"] = str(res.inserted_id)
    return jsonify(serialize_doc(item)), 201

# ========== PHOTOS ==========
@app.get("/api/photos")
@token_required
def get_photos(current_user_id):
    items = list(mongo.db.photos.find().sort("uploaded_at", -1))
    return jsonify([serialize_doc(x) for x in items])

@app.post("/api/photos")
@token_required
def create_photo(current_user_id):
    data = request.get_json(force=True)
    item = {
        "url": data["url"],
        "caption": data.get("caption", ""),
        "album_id": data.get("album_id"),  # optionnel
        "uploaded_by": current_user_id,
        "uploaded_at": datetime.utcnow()
    }
    res = mongo.db.photos.insert_one(item)
    item["_id"] = str(res.inserted_id)
    return jsonify(serialize_doc(item)), 201

# ========== NOTES ==========
@app.get("/api/notes")
@token_required
def get_notes(current_user_id):
    items = list(mongo.db.notes.find().sort("created_at", -1))
    return jsonify([serialize_doc(x) for x in items])

@app.post("/api/notes")
@token_required
def create_note(current_user_id):
    data = request.get_json(force=True)
    item = {
        "content": data["content"],
        "pinned": bool(data.get("pinned", False)),
        "created_by": current_user_id,
        "created_at": datetime.utcnow()
    }
    res = mongo.db.notes.insert_one(item)
    item["_id"] = str(res.inserted_id)
    return jsonify(serialize_doc(item)), 201

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
