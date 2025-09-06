# app.py
import os, re, secrets, string, datetime as dt
from functools import wraps

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)

# ───────── Boot ─────────
load_dotenv()
app = Flask(__name__)
app.url_map.strict_slashes = False

# JWT
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "change-me")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = dt.timedelta(days=30)
jwt = JWTManager(app)

# Mongo
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017/")
MONGODB_DB  = os.getenv("MONGODB_DB", "us_app")
client = MongoClient(MONGODB_URI)   # lazy connect
db = client[MONGODB_DB]

# Collections
users_col       = db["users"]
couples_col     = db["couples"]
reminders_col   = db["reminders"]
restaurants_col = db["restaurants"]
activities_col  = db["activities"]
wishlist_col    = db["wishlist_items"]
photos_col      = db["photos"]
notes_col       = db["notes"]

# CORS (laisser flask-cors gérer, pas d'after_request)
origins = [o.strip() for o in os.getenv(
    "CORS_ORIGINS",
    "https://dancing-chaja-15f8a5.netlify.app,http://localhost:3000"
).split(",") if o.strip()]
if os.getenv("ALLOW_NETLIFY_PREVIEWS", "false").lower() in ("1","true","yes"):
    origins.append(re.compile(r"^https://.*\.netlify\.app$"))

CORS(
    app,
    resources={r"/api/*": {
        "origins": origins,
        "methods": ["GET","POST","PUT","DELETE","OPTIONS"],
        "allow_headers": ["Content-Type","Authorization","X-Requested-With"],
        "supports_credentials": False
    }},
    vary_header=True, intercept_exceptions=True, always_send=True
)

@app.route("/api/<path:_any>", methods=["OPTIONS"])
def cors_preflight(_any):
    return ("", 204)

# ───────── Helpers ─────────
def oid(v):
    try: return ObjectId(v)
    except: return None

def serialize(doc):
    if not doc: return None
    d = dict(doc)
    if "_id" in d: d["_id"] = str(d["_id"])
    if "couple_id" in d and isinstance(d["couple_id"], ObjectId):
        d["couple_id"] = str(d["couple_id"])
    return d

def iso_to_dt(val):
    if not val: return None
    try:
        s = str(val)
        if s.endswith("Z"): s = s[:-1] + "+00:00"
        return dt.datetime.fromisoformat(s)
    except: return None

def new_invite_code(n=6):  # 6 chars to align with frontend input constraint
    alphabet = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(n))

def ensure_indexes():
    try:
        users_col.create_index("email", unique=True)
        users_col.create_index("couple_id")
        couples_col.create_index("invite_code", unique=True)

        for col in (reminders_col, restaurants_col, activities_col, wishlist_col, photos_col, notes_col):
            col.create_index("couple_id")
            for fld in ("created_at","added_at","uploaded_at"):
                try: col.create_index([(fld, -1)])
                except: pass
    except Exception as e:
        print("WARN ensure_indexes:", e)

def current_user():
    email = get_jwt_identity()
    return users_col.find_one({"email": email})

def require_couple(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        u = current_user()
        cid = u.get("couple_id") if u else None
        if not cid:
            return {"error": "not_in_couple"}, 409
        return fn(u, cid, *args, **kwargs)
    return wrapper

# ───────── Health ─────────
@app.get("/")
def root():
    return {"status": "ok", "docs": ["/health", "/api/health"]}

@app.get("/health")
def health_root():
    return {"status": "ok", "scope": "root"}

@app.get("/api/health")
@app.get("/api/health/")
def health_api():
    ensure_indexes()
    return {"status": "ok", "scope": "api", "time": dt.datetime.utcnow().isoformat()+"Z"}

# ───────── Auth ─────────
@app.post("/api/register")
def register():
    data = request.get_json() or {}
    name  = (data.get("name") or "").strip()
    email = (data.get("email") or "").lower().strip()
    pwd   = data.get("password") or ""
    if not (name and email and pwd):
        return {"error":"missing_fields"}, 400
    if users_col.find_one({"email": email}):
        return {"error":"email_exists"}, 400

    hashed = generate_password_hash(pwd)
    user = {
        "name": name,
        "email": email,
        "password": hashed,
        "avatar_url": data.get("avatar_url",""),
        "joined_at": dt.datetime.utcnow(),
        "couple_id": None
    }
    res = users_col.insert_one(user)
    token = create_access_token(identity=email)
    return {
        "access_token": token,
        "user": {"id": str(res.inserted_id), "name": name, "email": email, "avatar_url": user["avatar_url"]}
    }, 201

@app.post("/api/login")
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").lower().strip()
    pwd   = data.get("password") or ""
    user  = users_col.find_one({"email": email})
    if not user or not check_password_hash(user["password"], pwd):
        return {"error":"invalid_credentials"}, 401
    token = create_access_token(identity=email)
    return {
        "access_token": token,
        "user": {"id": str(user["_id"]), "name": user["name"], "email": user["email"], "avatar_url": user.get("avatar_url","")}
    }

@app.get("/api/users")
@jwt_required()
def get_users():
    users = list(users_col.find({}, {"password":0}).sort("joined_at", 1))
    return jsonify([serialize(u) for u in users])

# ───────── Couple: create / invite / join / me ─────────
@app.post("/api/couple/create")
@jwt_required()
def couple_create():
    u = current_user()
    if u.get("couple_id"):
        return {"error":"already_in_couple"}, 400
    code = new_invite_code()
    couple = {"invite_code": code, "members": [u["_id"]], "name": None, "created_at": dt.datetime.utcnow()}
    res = couples_col.insert_one(couple)
    users_col.update_one({"_id": u["_id"]}, {"$set": {"couple_id": res.inserted_id}})
    return {"couple_id": str(res.inserted_id), "invite_code": code}

@app.post("/api/couple/invite/refresh")
@jwt_required()
def couple_invite_refresh():
    u = current_user()
    cid = u.get("couple_id")
    if not cid: return {"error":"no_couple"}, 400
    code = new_invite_code()
    couples_col.update_one({"_id": cid}, {"$set": {"invite_code": code}})
    return {"invite_code": code}

@app.post("/api/couple/join")
@jwt_required()
def couple_join():
    u = current_user()
    if u.get("couple_id"):
        return {"error":"already_in_couple"}, 400
    data = request.get_json() or {}
    code = (data.get("invite_code") or "").upper().strip()
    c = couples_col.find_one({"invite_code": code})
    if not c: return {"error":"invalid_code"}, 404
    if len(c["members"]) >= 2:   # limite stricte à 2 membres
        return {"error":"couple_full"}, 400
    couples_col.update_one({"_id": c["_id"]}, {"$addToSet": {"members": u["_id"]}})
    users_col.update_one({"_id": u["_id"]}, {"$set": {"couple_id": c["_id"]}})
    return {"ok": True, "couple_id": str(c["_id"])}

@app.get("/api/couple/me")
@jwt_required()
def couple_me():
    u = current_user()
    cid = u.get("couple_id")
    if not cid:
        return {"in_couple": False}
    c = couples_col.find_one({"_id": cid})
    members = list(users_col.find({"_id": {"$in": c["members"]}}, {"password":0}))
    return {
        "in_couple": True,
        "couple_id": str(cid),
        "invite_code": c.get("invite_code"),
        "members": [{"id": str(m["_id"]), "name": m["name"], "email": m["email"], "avatar_url": m.get("avatar_url","")} for m in members]
    }

# ───────── Reminders ─────────
@app.get("/api/reminders")
@jwt_required()
@require_couple
def reminders_list(u, cid):
    items = list(reminders_col.find({"couple_id": cid}).sort("created_at",-1))
    return jsonify([serialize(x) for x in items])

@app.post("/api/reminders")
@jwt_required()
@require_couple
def reminders_create(u, cid):
    data = request.get_json() or {}
    item = {
        "title": data["title"],
        "description": data.get("description",""),
        "created_by": str(u["_id"]),
        "assigned_to": data.get("assigned_to"),
        "priority": data.get("priority","normal"),
        "due_date": iso_to_dt(data.get("due_date")),
        "status": "pending",
        "created_at": dt.datetime.utcnow(),
        "couple_id": cid
    }
    res = reminders_col.insert_one(item); item["_id"]=str(res.inserted_id)
    return jsonify(serialize(item)), 201

@app.put("/api/reminders/<rid>")
@jwt_required()
@require_couple
def reminders_update(u, cid, rid):
    data = request.get_json() or {}
    if "due_date" in data: data["due_date"] = iso_to_dt(data.get("due_date"))
    reminders_col.update_one({"_id": oid(rid), "couple_id": cid}, {"$set": data})
    return {"msg":"updated"}

@app.delete("/api/reminders/<rid>")
@jwt_required()
@require_couple
def reminders_delete(u, cid, rid):
    reminders_col.delete_one({"_id": oid(rid), "couple_id": cid})
    return {"msg":"deleted"}

# ───────── Restaurants ─────────
@app.get("/api/restaurants")
@jwt_required()
@require_couple
def restaurants_list(u, cid):
    items = list(restaurants_col.find({"couple_id": cid}).sort("added_at",-1))
    return jsonify([serialize(x) for x in items])

@app.post("/api/restaurants")
@jwt_required()
@require_couple
def restaurants_create(u, cid):
    data = request.get_json() or {}
    item = {
        "name": data["name"],
        "address": data.get("address",""),
        "map_url": data.get("map_url",""),
        "image_url": data.get("image_url",""),
        "status": data.get("status","to_try"),
        "notes": data.get("notes",""),
        "added_by": str(u["_id"]),
        "added_at": dt.datetime.utcnow(),
        "couple_id": cid
    }
    res = restaurants_col.insert_one(item); item["_id"]=str(res.inserted_id)
    return jsonify(serialize(item)), 201

@app.put("/api/restaurants/<rid>")
@jwt_required()
@require_couple
def restaurants_update(u, cid, rid):
    data = request.get_json() or {}
    fields = {k: v for k,v in data.items() if k in ["name","address","map_url","image_url","status","notes"]}
    restaurants_col.update_one({"_id": oid(rid), "couple_id": cid}, {"$set": fields})
    return {"msg":"updated"}

@app.delete("/api/restaurants/<rid>")
@jwt_required()
@require_couple
def restaurants_delete(u, cid, rid):
    restaurants_col.delete_one({"_id": oid(rid), "couple_id": cid})
    return {"msg":"deleted"}

# ───────── Activities ─────────
@app.get("/api/activities")
@jwt_required()
@require_couple
def activities_list(u, cid):
    items = list(activities_col.find({"couple_id": cid}).sort("added_at",-1))
    return jsonify([serialize(x) for x in items])

@app.post("/api/activities")
@jwt_required()
@require_couple
def activities_create(u, cid):
    data = request.get_json() or {}
    item = {
        "title": data["title"],
        "category": data.get("category","other"),
        "status": data.get("status","planned"),
        "notes": data.get("notes",""),
        "image_url": data.get("image_url",""),
        "added_by": str(u["_id"]),
        "added_at": dt.datetime.utcnow(),
        "couple_id": cid
    }
    res = activities_col.insert_one(item); item["_id"]=str(res.inserted_id)
    return jsonify(serialize(item)), 201

@app.put("/api/activities/<aid>")
@jwt_required()
@require_couple
def activities_update(u, cid, aid):
    data = request.get_json() or {}
    fields = {k: v for k,v in data.items() if k in ["title","category","status","notes","image_url"]}
    activities_col.update_one({"_id": oid(aid), "couple_id": cid}, {"$set": fields})
    return {"msg":"updated"}

@app.delete("/api/activities/<aid>")
@jwt_required()
@require_couple
def activities_delete(u, cid, aid):
    activities_col.delete_one({"_id": oid(aid), "couple_id": cid})
    return {"msg":"deleted"}

# ───────── Wishlist ─────────
@app.get("/api/wishlist")
@jwt_required()
@require_couple
def wishlist_list(u, cid):
    items = list(wishlist_col.find({"couple_id": cid}).sort("added_at",-1))
    return jsonify([serialize(x) for x in items])

@app.post("/api/wishlist")
@jwt_required()
@require_couple
def wishlist_create(u, cid):
    data = request.get_json() or {}
    item = {
        "title": data["title"],
        "description": data.get("description",""),
        "image_url": data.get("image_url",""),
        "link_url": data.get("link_url",""),
        "for_user": data.get("for_user"),
        "added_by": str(u["_id"]),
        "status": data.get("status","idea"),
        "added_at": dt.datetime.utcnow(),
        "couple_id": cid
    }
    res = wishlist_col.insert_one(item); item["_id"]=str(res.inserted_id)
    return jsonify(serialize(item)), 201

@app.put("/api/wishlist/<wid>")
@jwt_required()
@require_couple
def wishlist_update(u, cid, wid):
    data = request.get_json() or {}
    fields = {k: v for k,v in data.items() if k in ["title","description","image_url","link_url","for_user","status"]}
    wishlist_col.update_one({"_id": oid(wid), "couple_id": cid}, {"$set": fields})
    return {"msg":"updated"}

@app.delete("/api/wishlist/<wid>")
@jwt_required()
@require_couple
def wishlist_delete(u, cid, wid):
    wishlist_col.delete_one({"_id": oid(wid), "couple_id": cid})
    return {"msg":"deleted"}

# ───────── Photos ─────────
@app.get("/api/photos")
@jwt_required()
@require_couple
def photos_list(u, cid):
    items = list(photos_col.find({"couple_id": cid}).sort("uploaded_at",-1))
    return jsonify([serialize(x) for x in items])

@app.post("/api/photos")
@jwt_required()
@require_couple
def photos_create(u, cid):
    data = request.get_json() or {}
    item = {
        "url": data["url"],
        "caption": data.get("caption",""),
        "album_id": data.get("album_id"),
        "uploaded_by": str(u["_id"]),
        "uploaded_at": dt.datetime.utcnow(),
        "couple_id": cid
    }
    res = photos_col.insert_one(item); item["_id"]=str(res.inserted_id)
    return jsonify(serialize(item)), 201

# ───────── Notes ─────────
@app.get("/api/notes")
@jwt_required()
@require_couple
def notes_list(u, cid):
    items = list(notes_col.find({"couple_id": cid}).sort("created_at",-1))
    return jsonify([serialize(x) for x in items])

@app.post("/api/notes")
@jwt_required()
@require_couple
def notes_create(u, cid):
    data = request.get_json() or {}
    item = {
        "content": data["content"],
        "pinned": bool(data.get("pinned", False)),
        "created_by": str(u["_id"]),
        "created_at": dt.datetime.utcnow(),
        "couple_id": cid
    }
    res = notes_col.insert_one(item); item["_id"]=str(res.inserted_id)
    return jsonify(serialize(item)), 201

@app.put("/api/notes/<nid>")
@jwt_required()
@require_couple
def notes_update(u, cid, nid):
    data = request.get_json() or {}
    fields = {k: v for k,v in data.items() if k in ["content","pinned"]}
    notes_col.update_one({"_id": oid(nid), "couple_id": cid}, {"$set": fields})
    return {"msg":"updated"}

@app.delete("/api/notes/<nid>")
@jwt_required()
@require_couple
def notes_delete(u, cid, nid):
    notes_col.delete_one({"_id": oid(nid), "couple_id": cid})
    return {"msg":"deleted"}

# ───────── Entrypoint ─────────
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=True)
