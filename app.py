import os
import re
import datetime
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)

# Charge .env EN LOCAL uniquement (sur Heroku: Config Vars)
load_dotenv()

app = Flask(__name__)

# --- JWT ---
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "change-me")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = datetime.timedelta(days=30)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# --- MongoDB ---
MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://127.0.0.1:27017/")
MONGODB_DB  = os.environ.get("MONGODB_DB", "couple_base")
client = MongoClient(MONGODB_URI)
db = client[MONGODB_DB]

users_col       = db["users"]
reminders_col   = db["reminders"]
restaurants_col = db["restaurants"]
activities_col  = db["activities"]
wishlist_col    = db["wishlist_items"]
photos_col      = db["photos"]
notes_col       = db["notes"]

# Indexes utiles (ne pas bloquer le boot si erreur)
try:
    users_col.create_index("email", unique=True)
    reminders_col.create_index([("created_at", -1)])
    restaurants_col.create_index([("added_at", -1)])
    activities_col.create_index([("added_at", -1)])
    wishlist_col.create_index([("added_at", -1)])
    photos_col.create_index([("uploaded_at", -1)])
    notes_col.create_index([("created_at", -1)])
except Exception:
    pass

# --- CORS ---
# ORIGINS (liste CSV) ex:
#   CORS_ORIGINS="https://dancing-chaja-15f8a5.netlify.app,http://localhost:3000"
env_origins = os.environ.get("CORS_ORIGINS")
if env_origins:
    ORIGINS = [o.strip() for o in env_origins.split(",") if o.strip()]
else:
    ORIGINS = ["https://dancing-chaja-15f8a5.netlify.app", "http://localhost:3000"]

# Autoriser toutes les previews Netlify si besoin
ALLOW_NETLIFY_PREVIEWS = os.environ.get("ALLOW_NETLIFY_PREVIEWS", "false").lower() in ("1", "true", "yes")
if ALLOW_NETLIFY_PREVIEWS:
    ORIGINS.append(re.compile(r"^https://.*\.netlify\.app$"))

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": ORIGINS,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
            "expose_headers": ["Content-Type", "Authorization"],
            "supports_credentials": False
        }
    },
    vary_header=True,
    intercept_exceptions=True,
    always_send=True
)

# Route catch-all pour le préflight OPTIONS (ne pas ajouter de headers à la main)
@app.route("/api/<path:_any>", methods=["OPTIONS"])
def cors_preflight(_any):
    return ("", 204)

# ---------- Helpers ----------
def oid(s: str):
    try:
        return ObjectId(s)
    except Exception:
        return None

def serialize(doc):
    if not doc:
        return None
    d = dict(doc)
    if "_id" in d:
        d["_id"] = str(d["_id"])
    return d

def iso_to_dt(val):
    # accepte "YYYY-MM-DDTHH:MM:SS(.mmm)?Z?" ou None
    if not val:
        return None
    try:
        s = str(val)
        if s.endswith("Z"):
            s = s[:-1] + "+00:00"
        return datetime.datetime.fromisoformat(s)
    except Exception:
        return None

# ---------- Root & Health ----------
@app.get("/")
def root():
    return jsonify({"status": "ok", "app": "Base de couple API", "docs": "/api/health"})

@app.get("/api/health")
def health():
    return jsonify({"status": "healthy", "time": datetime.datetime.utcnow().isoformat() + "Z"})

# ---------- Auth ----------
@app.post("/api/register")
def register():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not (name and email and password):
        return jsonify({"error": "Missing fields"}), 400

    if users_col.find_one({"email": email}):
        return jsonify({"error": "Email already exists"}), 400

    hashed = bcrypt.generate_password_hash(password).decode("utf-8")
    user = {
        "name": name,
        "email": email,
        "password": hashed,
        "avatar_url": data.get("avatar_url", ""),
        "joined_at": datetime.datetime.utcnow()
    }
    res = users_col.insert_one(user)
    uid = str(res.inserted_id)

    token = create_access_token(identity=email)
    return jsonify({
        "access_token": token,
        "user": {"id": uid, "name": name, "email": email, "avatar_url": user["avatar_url"]}
    }), 201

@app.post("/api/login")
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = users_col.find_one({"email": email})
    if not user or not bcrypt.check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(identity=email)
    return jsonify({
        "access_token": token,
        "user": {"id": str(user["_id"]), "name": user["name"], "email": user["email"], "avatar_url": user.get("avatar_url", "")}
    })

@app.get("/api/users")
@jwt_required()
def get_users():
    # Espace couple : retourne tous les users (sans password)
    users = list(users_col.find({}, {"password": 0}).sort("joined_at", 1))
    return jsonify([serialize(u) for u in users])

# ---------- Reminders ----------
@app.get("/api/reminders")
@jwt_required()
def list_reminders():
    items = list(reminders_col.find().sort("created_at", -1))
    # enrichir noms
    for r in items:
        if r.get("created_by"):
            u = users_col.find_one({"_id": oid(r["created_by"])})
            r["created_by_name"] = (u or {}).get("name", "Inconnu")
        if r.get("assigned_to"):
            u = users_col.find_one({"_id": oid(r["assigned_to"])})
            r["assigned_to_name"] = (u or {}).get("name", "Inconnu")
    return jsonify([serialize(x) for x in items])

@app.post("/api/reminders")
@jwt_required()
def create_reminder():
    current_email = get_jwt_identity()
    current_user = users_col.find_one({"email": current_email})
    if not current_user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json() or {}
    due_date = iso_to_dt(data.get("due_date"))
    item = {
        "title": data["title"],
        "description": data.get("description", ""),
        "created_by": str(current_user["_id"]),
        "assigned_to": data.get("assigned_to"),  # string user id
        "priority": data.get("priority", "normal"),   # urgent / important / normal
        "due_date": due_date,
        "status": "pending",  # pending / done
        "created_at": datetime.datetime.utcnow()
    }
    res = reminders_col.insert_one(item)
    item["_id"] = str(res.inserted_id)
    return jsonify(serialize(item)), 201

@app.put("/api/reminders/<rid>")
@jwt_required()
def update_reminder(rid):
    data = request.get_json() or {}
    fields = {}
    for k in ["title", "description", "priority", "status", "assigned_to"]:
        if k in data:
            fields[k] = data[k]
    if "due_date" in data:
        fields["due_date"] = iso_to_dt(data.get("due_date"))

    reminders_col.update_one({"_id": oid(rid)}, {"$set": fields})
    return jsonify({"message": "Rappel mis à jour"})

@app.delete("/api/reminders/<rid>")
@jwt_required()
def delete_reminder(rid):
    reminders_col.delete_one({"_id": oid(rid)})
    return jsonify({"message": "Rappel supprimé"})

# ---------- Restaurants ----------
@app.get("/api/restaurants")
@jwt_required()
def list_restaurants():
    items = list(restaurants_col.find().sort("added_at", -1))
    return jsonify([serialize(x) for x in items])

@app.post("/api/restaurants")
@jwt_required()
def create_restaurant():
    current_email = get_jwt_identity()
    user = users_col.find_one({"email": current_email})
    data = request.get_json() or {}
    item = {
        "name": data["name"],
        "address": data.get("address", ""),
        "map_url": data.get("map_url", ""),
        "image_url": data.get("image_url", ""),
        "status": data.get("status", "to_try"),  # to_try / tried / favorite
        "notes": data.get("notes", ""),
        "added_by": str(user["_id"]) if user else None,
        "added_at": datetime.datetime.utcnow()
    }
    res = restaurants_col.insert_one(item)
    item["_id"] = str(res.inserted_id)
    return jsonify(serialize(item)), 201

@app.put("/api/restaurants/<rid>")
@jwt_required()
def update_restaurant(rid):
    data = request.get_json() or {}
    fields = {k: v for k, v in data.items() if k in ["name","address","map_url","image_url","status","notes"]}
    restaurants_col.update_one({"_id": oid(rid)}, {"$set": fields})
    return jsonify({"message": "Restaurant mis à jour"})

# ---------- Activités ----------
@app.get("/api/activities")
@jwt_required()
def list_activities():
    items = list(activities_col.find().sort("added_at", -1))
    return jsonify([serialize(x) for x in items])

@app.post("/api/activities")
@jwt_required()
def create_activity():
    current_email = get_jwt_identity()
    user = users_col.find_one({"email": current_email})
    data = request.get_json() or {}
    item = {
        "title": data["title"],
        "category": data.get("category", "other"),  # fun/romantic/sport/culture/travel/other
        "status": data.get("status", "planned"),    # planned/done/wishlist
        "notes": data.get("notes", ""),
        "image_url": data.get("image_url", ""),
        "added_by": str(user["_id"]) if user else None,
        "added_at": datetime.datetime.utcnow()
    }
    res = activities_col.insert_one(item)
    item["_id"] = str(res.inserted_id)
    return jsonify(serialize(item)), 201

@app.put("/api/activities/<aid>")
@jwt_required()
def update_activity(aid):
    data = request.get_json() or {}
    fields = {k: v for k, v in data.items() if k in ["title","category","status","notes","image_url"]}
    activities_col.update_one({"_id": oid(aid)}, {"$set": fields})
    return jsonify({"message": "Activité mise à jour"})

# ---------- Wishlist ----------
@app.get("/api/wishlist")
@jwt_required()
def list_wishlist():
    items = list(wishlist_col.find().sort("added_at", -1))
    return jsonify([serialize(x) for x in items])

@app.post("/api/wishlist")
@jwt_required()
def create_wishlist_item():
    current_email = get_jwt_identity()
    user = users_col.find_one({"email": current_email})
    data = request.get_json() or {}
    item = {
        "title": data["title"],
        "description": data.get("description", ""),
        "image_url": data.get("image_url", ""),
        "link_url": data.get("link_url", ""),
        "for_user": data.get("for_user"),  # id user (string)
        "added_by": str(user["_id"]) if user else None,
        "status": data.get("status", "idea"),  # idea/bought/gifted
        "added_at": datetime.datetime.utcnow()
    }
    res = wishlist_col.insert_one(item)
    item["_id"] = str(res.inserted_id)
    return jsonify(serialize(item)), 201

@app.put("/api/wishlist/<wid>")
@jwt_required()
def update_wishlist_item(wid):
    data = request.get_json() or {}
    fields = {k: v for k, v in data.items() if k in ["title","description","image_url","link_url","for_user","status"]}
    wishlist_col.update_one({"_id": oid(wid)}, {"$set": fields})
    return jsonify({"message": "Wishlist mise à jour"})

# ---------- Photos ----------
@app.get("/api/photos")
@jwt_required()
def list_photos():
    items = list(photos_col.find().sort("uploaded_at", -1))
    return jsonify([serialize(x) for x in items])

@app.post("/api/photos")
@jwt_required()
def create_photo():
    current_email = get_jwt_identity()
    user = users_col.find_one({"email": current_email})
    data = request.get_json() or {}
    item = {
        "url": data["url"],
        "caption": data.get("caption", ""),
        "album_id": data.get("album_id"),
        "uploaded_by": str(user["_id"]) if user else None,
        "uploaded_at": datetime.datetime.utcnow()
    }
    res = photos_col.insert_one(item)
    item["_id"] = str(res.inserted_id)
    return jsonify(serialize(item)), 201

# ---------- Notes ----------
@app.get("/api/notes")
@jwt_required()
def list_notes():
    items = list(notes_col.find().sort("created_at", -1))
    return jsonify([serialize(x) for x in items])

@app.post("/api/notes")
@jwt_required()
def create_note():
    current_email = get_jwt_identity()
    user = users_col.find_one({"email": current_email})
    data = request.get_json() or {}
    item = {
        "content": data["content"],
        "pinned": bool(data.get("pinned", False)),
        "created_by": str(user["_id"]) if user else None,
        "created_at": datetime.datetime.utcnow()
    }
    res = notes_col.insert_one(item)
    item["_id"] = str(res.inserted_id)
    return jsonify(serialize(item)), 201

@app.put("/api/notes/<nid>")
@jwt_required()
def update_note(nid):
    data = request.get_json() or {}
    fields = {k: v for k, v in data.items() if k in ["content","pinned"]}
    notes_col.update_one({"_id": oid(nid)}, {"$set": fields})
    return jsonify({"message": "Note mise à jour"})

@app.delete("/api/notes/<nid>")
@jwt_required()
def delete_note(nid):
    notes_col.delete_one({"_id": oid(nid)})
    return jsonify({"message": "Note supprimée"})

# --- Lancement local (Heroku utilise Gunicorn) ---
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
