import os, re, datetime as dt, secrets, string
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

# ───── Config de base ─────
load_dotenv()
app = Flask(__name__)
app.url_map.strict_slashes = False

# JWT
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "secret")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = dt.timedelta(days=30)
jwt = JWTManager(app)

# Mongo
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017/")
MONGODB_DB  = os.getenv("MONGODB_DB", "us_app")
client = MongoClient(MONGODB_URI)
db = client[MONGODB_DB]

users_col       = db["users"]
couples_col      = db["couples"]
reminders_col   = db["reminders"]
restaurants_col = db["restaurants"]
activities_col  = db["activities"]
wishlist_col    = db["wishlist_items"]
photos_col      = db["photos"]
notes_col       = db["notes"]

# Helpers
def oid(s: str):
    try: return ObjectId(s)
    except: return None

def serialize(doc):
    if not doc: return None
    d = dict(doc)
    if "_id" in d: d["_id"] = str(d["_id"])
    return d

def iso_to_dt(val):
    if not val: return None
    try:
        s = str(val)
        if s.endswith("Z"): s = s[:-1] + "+00:00"
        return dt.datetime.fromisoformat(s)
    except: return None

def generate_couple_code():
    """Generate a 6-character alphanumeric code for couple invitation"""
    return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))

def get_current_user():
    """Get current user from JWT token"""
    return users_col.find_one({"email": get_jwt_identity()})

def get_user_couple_id(user_id):
    """Get couple_id for a user"""
    user = users_col.find_one({"_id": oid(user_id)})
    return user.get("couple_id") if user else None

# CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
if os.getenv("ALLOW_NETLIFY_PREVIEWS", "false").lower() in ("1","true"):
    origins.append(re.compile(r"^https://.*\.netlify\.app$"))

CORS(app, resources={r"/api/*": {
    "origins": origins,
    "methods": ["GET","POST","PUT","DELETE","OPTIONS"],
    "allow_headers": ["Content-Type","Authorization"]
}}, vary_header=True, always_send=True)

@app.route("/api/<path:_any>", methods=["OPTIONS"])
def cors_preflight(_any): return ("", 204)

# ───── Health ─────
@app.get("/")
def root(): return {"status": "ok", "docs": ["/health","/api/health"]}

@app.get("/health")
def health_root(): return {"status":"ok","scope":"root"}

@app.get("/api/health")
def health_api(): return {"status":"ok","scope":"api","time":dt.datetime.utcnow().isoformat()}

# ───── Auth ─────
@app.post("/api/register")
def register():
    data = request.get_json() or {}
    if not all(k in data for k in ("name","email","password")):
        return {"error":"missing fields"},400
    if users_col.find_one({"email": data["email"].lower()}):
        return {"error":"email exists"},400
    hashed = generate_password_hash(data["password"])
    user = {"name":data["name"],"email":data["email"].lower(),
            "password":hashed,"avatar_url":data.get("avatar_url",""),
            "couple_id":None,"joined_at": dt.datetime.utcnow()}
    res = users_col.insert_one(user)
    token = create_access_token(identity=user["email"])
    return {"access_token":token,"user":{"id":str(res.inserted_id),
            "name":user["name"],"email":user["email"],"avatar_url":user["avatar_url"],
            "couple_id":user["couple_id"]}},201

@app.post("/api/login")
def login():
    data = request.get_json() or {}
    user = users_col.find_one({"email": data.get("email","").lower()})
    if not user or not check_password_hash(user["password"], data.get("password","")):
        return {"error":"invalid credentials"},401
    token = create_access_token(identity=user["email"])
    return {"access_token":token,"user":{"id":str(user["_id"]),
            "name":user["name"],"email":user["email"],"avatar_url":user.get("avatar_url",""),
            "couple_id":user.get("couple_id")}}

@app.get("/api/users")
@jwt_required()
def get_users():
    user = get_current_user()
    if not user or not user.get("couple_id"):
        return jsonify([])
    couple_users = users_col.find({"couple_id": user["couple_id"]}, {"password": 0}).sort("joined_at", 1)
    return jsonify([serialize(u) for u in couple_users])

# ───── Couple Management ─────
@app.get("/api/couple/status")
@jwt_required()
def couple_status():
    user = get_current_user()
    if not user:
        return {"error": "user not found"}, 404
    
    couple_id = user.get("couple_id")
    if not couple_id:
        return {"status": "single", "couple_id": None, "partner": None}
    
    couple = couples_col.find_one({"_id": oid(couple_id)})
    if not couple:
        return {"status": "single", "couple_id": None, "partner": None}
    
    # Find partner
    partner = users_col.find_one({
        "couple_id": couple_id,
        "_id": {"$ne": user["_id"]}
    }, {"password": 0})
    
    return {
        "status": "coupled",
        "couple_id": couple_id,
        "code": couple.get("code"),
        "partner": serialize(partner) if partner else None,
        "created_at": couple.get("created_at")
    }

@app.post("/api/couple/create")
@jwt_required()
def create_couple():
    user = get_current_user()
    if not user:
        return {"error": "user not found"}, 404
    
    if user.get("couple_id"):
        return {"error": "already in a couple"}, 400
    
    # Generate unique code
    while True:
        code = generate_couple_code()
        if not couples_col.find_one({"code": code}):
            break
    
    couple = {
        "code": code,
        "created_by": str(user["_id"]),
        "created_at": dt.datetime.utcnow()
    }
    result = couples_col.insert_one(couple)
    couple_id = str(result.inserted_id)
    
    # Update user with couple_id
    users_col.update_one({"_id": user["_id"]}, {"$set": {"couple_id": couple_id}})
    
    return {"code": code, "couple_id": couple_id}, 201

@app.post("/api/couple/join")
@jwt_required()
def join_couple():
    data = request.get_json() or {}
    code = data.get("code", "").upper().strip()
    
    if not code:
        return {"error": "code required"}, 400
    
    user = get_current_user()
    if not user:
        return {"error": "user not found"}, 404
    
    if user.get("couple_id"):
        return {"error": "already in a couple"}, 400
    
    couple = couples_col.find_one({"code": code})
    if not couple:
        return {"error": "invalid code"}, 404
    
    couple_id = str(couple["_id"])
    
    # Check if couple is full (max 2 people)
    couple_members = users_col.count_documents({"couple_id": couple_id})
    if couple_members >= 2:
        return {"error": "couple is full"}, 400
    
    # Join the couple
    users_col.update_one({"_id": user["_id"]}, {"$set": {"couple_id": couple_id}})
    
    return {"message": "joined couple", "couple_id": couple_id}

# ───── Reminders ─────
@app.get("/api/reminders")
@jwt_required()
def list_reminders():
    user = get_current_user()
    if not user or not user.get("couple_id"):
        return jsonify([])
    couple_id = user["couple_id"]
    return jsonify([serialize(r) for r in reminders_col.find({"couple_id": couple_id}).sort("created_at",-1)])

@app.post("/api/reminders")
@jwt_required()
def create_reminder():
    user = get_current_user()
    if not user or not user.get("couple_id"):
        return {"error": "must be in a couple to create reminders"}, 400
    
    data = request.get_json() or {}
    item = {"title":data["title"],"description":data.get("description",""),
            "created_by": str(user["_id"]),
            "assigned_to": data.get("assigned_to"),
            "priority": data.get("priority","normal"),
            "due_date": iso_to_dt(data.get("due_date")),
            "status":"pending","created_at":dt.datetime.utcnow(),
            "couple_id": user["couple_id"]}
    res = reminders_col.insert_one(item); item["_id"]=str(res.inserted_id)
    return jsonify(serialize(item)),201

@app.put("/api/reminders/<rid>")
@jwt_required()
def update_reminder(rid):
    data = request.get_json() or {}
    reminders_col.update_one({"_id": oid(rid)},{"$set":data})
    return {"msg":"updated"}

@app.delete("/api/reminders/<rid>")
@jwt_required()
def delete_reminder(rid):
    reminders_col.delete_one({"_id": oid(rid)})
    return {"msg":"deleted"}

# ───── Restaurants ─────
@app.get("/api/restaurants")
@jwt_required()
def list_restaurants():
    user = get_current_user()
    if not user or not user.get("couple_id"):
        return jsonify([])
    couple_id = user["couple_id"]
    return jsonify([serialize(r) for r in restaurants_col.find({"couple_id": couple_id}).sort("added_at",-1)])

@app.post("/api/restaurants")
@jwt_required()
def create_restaurant():
    user = get_current_user()
    if not user or not user.get("couple_id"):
        return {"error": "must be in a couple to create restaurants"}, 400
    
    data = request.get_json() or {}
    item = {"name":data["name"],"address":data.get("address",""),
            "map_url":data.get("map_url",""),"image_url":data.get("image_url",""),
            "status":data.get("status","to_try"),"notes":data.get("notes",""),
            "added_by": str(user["_id"]),"added_at":dt.datetime.utcnow(),
            "couple_id": user["couple_id"]}
    res=restaurants_col.insert_one(item); item["_id"]=str(res.inserted_id)
    return jsonify(serialize(item)),201

# ───── Activities ─────
@app.get("/api/activities")
@jwt_required()
def list_activities():
    user = get_current_user()
    if not user or not user.get("couple_id"):
        return jsonify([])
    couple_id = user["couple_id"]
    return jsonify([serialize(a) for a in activities_col.find({"couple_id": couple_id}).sort("added_at",-1)])

@app.post("/api/activities")
@jwt_required()
def create_activity():
    user = get_current_user()
    if not user or not user.get("couple_id"):
        return {"error": "must be in a couple to create activities"}, 400
    
    data = request.get_json() or {}
    item = {"title":data["title"],"category":data.get("category","other"),
            "status":data.get("status","planned"),"notes":data.get("notes",""),
            "image_url":data.get("image_url",""),
            "added_by": str(user["_id"]),"added_at":dt.datetime.utcnow(),
            "couple_id": user["couple_id"]}
    res=activities_col.insert_one(item); item["_id"]=str(res.inserted_id)
    return jsonify(serialize(item)),201

# ───── Wishlist ─────
@app.get("/api/wishlist")
@jwt_required()
def list_wishlist():
    user = get_current_user()
    if not user or not user.get("couple_id"):
        return jsonify([])
    couple_id = user["couple_id"]
    return jsonify([serialize(w) for w in wishlist_col.find({"couple_id": couple_id}).sort("added_at",-1)])

@app.post("/api/wishlist")
@jwt_required()
def create_wishlist_item():
    user = get_current_user()
    if not user or not user.get("couple_id"):
        return {"error": "must be in a couple to create wishlist items"}, 400
    
    data = request.get_json() or {}
    item = {"title":data["title"],"description":data.get("description",""),
            "image_url":data.get("image_url",""),"link_url":data.get("link_url",""),
            "for_user":data.get("for_user"),"added_by": str(user["_id"]),
            "status":data.get("status","idea"),"added_at":dt.datetime.utcnow(),
            "couple_id": user["couple_id"]}
    res=wishlist_col.insert_one(item); item["_id"]=str(res.inserted_id)
    return jsonify(serialize(item)),201

# ───── Photos ─────
@app.get("/api/photos")
@jwt_required()
def list_photos():
    user = get_current_user()
    if not user or not user.get("couple_id"):
        return jsonify([])
    couple_id = user["couple_id"]
    return jsonify([serialize(p) for p in photos_col.find({"couple_id": couple_id}).sort("uploaded_at",-1)])

@app.post("/api/photos")
@jwt_required()
def create_photo():
    user = get_current_user()
    if not user or not user.get("couple_id"):
        return {"error": "must be in a couple to create photos"}, 400
    
    data = request.get_json() or {}
    item = {"url":data["url"],"caption":data.get("caption",""),
            "album_id":data.get("album_id"),
            "uploaded_by": str(user["_id"]),"uploaded_at":dt.datetime.utcnow(),
            "couple_id": user["couple_id"]}
    res=photos_col.insert_one(item); item["_id"]=str(res.inserted_id)
    return jsonify(serialize(item)),201

# ───── Notes ─────
@app.get("/api/notes")
@jwt_required()
def list_notes():
    user = get_current_user()
    if not user or not user.get("couple_id"):
        return jsonify([])
    couple_id = user["couple_id"]
    return jsonify([serialize(n) for n in notes_col.find({"couple_id": couple_id}).sort("created_at",-1)])

@app.post("/api/notes")
@jwt_required()
def create_note():
    user = get_current_user()
    if not user or not user.get("couple_id"):
        return {"error": "must be in a couple to create notes"}, 400
    
    data = request.get_json() or {}
    item = {"content":data["content"],"pinned":bool(data.get("pinned",False)),
            "created_by": str(user["_id"]),"created_at":dt.datetime.utcnow(),
            "couple_id": user["couple_id"]}
    res=notes_col.insert_one(item); item["_id"]=str(res.inserted_id)
    return jsonify(serialize(item)),201

@app.put("/api/notes/<nid>")
@jwt_required()
def update_note(nid):
    data = request.get_json() or {}
    notes_col.update_one({"_id": oid(nid)},{"$set":data})
    return {"msg":"updated"}

@app.delete("/api/notes/<nid>")
@jwt_required()
def delete_note(nid):
    notes_col.delete_one({"_id": oid(nid)})
    return {"msg":"deleted"}

# ───── Entrypoint ─────
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT",5000)), debug=True)
