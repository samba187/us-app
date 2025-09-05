import os, re, datetime as dt
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
            "joined_at": dt.datetime.utcnow()}
    res = users_col.insert_one(user)
    token = create_access_token(identity=user["email"])
    return {"access_token":token,"user":{"id":str(res.inserted_id),
            "name":user["name"],"email":user["email"],"avatar_url":user["avatar_url"]}},201

@app.post("/api/login")
def login():
    data = request.get_json() or {}
    user = users_col.find_one({"email": data.get("email","").lower()})
    if not user or not check_password_hash(user["password"], data.get("password","")):
        return {"error":"invalid credentials"},401
    token = create_access_token(identity=user["email"])
    return {"access_token":token,"user":{"id":str(user["_id"]),
            "name":user["name"],"email":user["email"],"avatar_url":user.get("avatar_url","")}}

@app.get("/api/users")
@jwt_required()
def get_users():
    return jsonify([serialize(u) for u in users_col.find({},{"password":0}).sort("joined_at",1)])

# ───── Reminders ─────
@app.get("/api/reminders")
@jwt_required()
def list_reminders():
    return jsonify([serialize(r) for r in reminders_col.find().sort("created_at",-1)])

@app.post("/api/reminders")
@jwt_required()
def create_reminder():
    cur = users_col.find_one({"email": get_jwt_identity()})
    data = request.get_json() or {}
    item = {"title":data["title"],"description":data.get("description",""),
            "created_by": str(cur["_id"]) if cur else None,
            "assigned_to": data.get("assigned_to"),
            "priority": data.get("priority","normal"),
            "due_date": iso_to_dt(data.get("due_date")),
            "status":"pending","created_at":dt.datetime.utcnow()}
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
    return jsonify([serialize(r) for r in restaurants_col.find().sort("added_at",-1)])

@app.post("/api/restaurants")
@jwt_required()
def create_restaurant():
    cur = users_col.find_one({"email": get_jwt_identity()})
    data = request.get_json() or {}
    item = {"name":data["name"],"address":data.get("address",""),
            "map_url":data.get("map_url",""),"image_url":data.get("image_url",""),
            "status":data.get("status","to_try"),"notes":data.get("notes",""),
            "added_by": str(cur["_id"]) if cur else None,
            "added_at":dt.datetime.utcnow()}
    res=restaurants_col.insert_one(item); item["_id"]=str(res.inserted_id)
    return jsonify(serialize(item)),201

# ───── Activities ─────
@app.get("/api/activities")
@jwt_required()
def list_activities():
    return jsonify([serialize(a) for a in activities_col.find().sort("added_at",-1)])

@app.post("/api/activities")
@jwt_required()
def create_activity():
    cur = users_col.find_one({"email": get_jwt_identity()})
    data = request.get_json() or {}
    item = {"title":data["title"],"category":data.get("category","other"),
            "status":data.get("status","planned"),"notes":data.get("notes",""),
            "image_url":data.get("image_url",""),
            "added_by": str(cur["_id"]) if cur else None,
            "added_at":dt.datetime.utcnow()}
    res=activities_col.insert_one(item); item["_id"]=str(res.inserted_id)
    return jsonify(serialize(item)),201

# ───── Wishlist ─────
@app.get("/api/wishlist")
@jwt_required()
def list_wishlist():
    return jsonify([serialize(w) for w in wishlist_col.find().sort("added_at",-1)])

@app.post("/api/wishlist")
@jwt_required()
def create_wishlist_item():
    cur = users_col.find_one({"email": get_jwt_identity()})
    data = request.get_json() or {}
    item = {"title":data["title"],"description":data.get("description",""),
            "image_url":data.get("image_url",""),"link_url":data.get("link_url",""),
            "for_user":data.get("for_user"),"added_by": str(cur["_id"]) if cur else None,
            "status":data.get("status","idea"),"added_at":dt.datetime.utcnow()}
    res=wishlist_col.insert_one(item); item["_id"]=str(res.inserted_id)
    return jsonify(serialize(item)),201

# ───── Photos ─────
@app.get("/api/photos")
@jwt_required()
def list_photos():
    return jsonify([serialize(p) for p in photos_col.find().sort("uploaded_at",-1)])

@app.post("/api/photos")
@jwt_required()
def create_photo():
    cur = users_col.find_one({"email": get_jwt_identity()})
    data = request.get_json() or {}
    item = {"url":data["url"],"caption":data.get("caption",""),
            "album_id":data.get("album_id"),
            "uploaded_by": str(cur["_id"]) if cur else None,
            "uploaded_at":dt.datetime.utcnow()}
    res=photos_col.insert_one(item); item["_id"]=str(res.inserted_id)
    return jsonify(serialize(item)),201

# ───── Notes ─────
@app.get("/api/notes")
@jwt_required()
def list_notes():
    return jsonify([serialize(n) for n in notes_col.find().sort("created_at",-1)])

@app.post("/api/notes")
@jwt_required()
def create_note():
    cur = users_col.find_one({"email": get_jwt_identity()})
    data = request.get_json() or {}
    item = {"content":data["content"],"pinned":bool(data.get("pinned",False)),
            "created_by": str(cur["_id"]) if cur else None,
            "created_at":dt.datetime.utcnow()}
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
