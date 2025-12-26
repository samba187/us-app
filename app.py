"""Full-feature backend (couple-based) restored, integrating advanced CORS and new Netlify domain."""

import os, re, secrets, string, datetime as dt
from uuid import uuid4
from functools import wraps

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
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

# Mongo (support multiple env var names)
MONGODB_URI = os.getenv("MONGODB_URI") or os.getenv("MONGO_URI") or "mongodb://127.0.0.1:27017/"
MONGODB_DB  = os.getenv("MONGODB_DB", "us_app")
client = MongoClient(MONGODB_URI)
db = client[MONGODB_DB]

# Collections
users_col       = db["users"]
couples_col     = db["couples"]
reminders_col   = db["reminders"]
restaurants_col = db["restaurants"]
activities_col  = db["activities"]
wishlist_col    = db["wishlist_items"]
photos_col      = db["photos"]
albums_col      = db["albums"]
memories_col    = db["memories"]
comments_col    = db["comments"]
reactions_col   = db["reactions"]
settings_col    = db["settings"]
notes_col       = db["notes"]
push_subs_col   = db["push_subscriptions"]

# CORS advanced (new Netlify domain + optional previews)
_fallback_origins = "https://dreamy-kitten-9d113d.netlify.app,http://localhost:3000"
raw_origins = os.getenv("CORS_ORIGINS", _fallback_origins)
origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
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

def new_invite_code(n=6):
    alphabet = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(n))

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_file(f):
    ext = os.path.splitext(f.filename or '')[1][:8]
    name = f"{uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, name)
    f.save(path)
    return f"/uploads/{name}"

def ensure_indexes():
    try:
        users_col.create_index("email", unique=True)
        users_col.create_index("couple_id")
        couples_col.create_index("invite_code", unique=True)
        for col in (reminders_col, restaurants_col, activities_col, wishlist_col, photos_col, notes_col, push_subs_col):
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
    db_ok = True
    db_error = None
    try:
        # simple ping
        client.admin.command('ping')
    except Exception as e:
        db_ok = False
        db_error = str(e)
    ensure_indexes()
    return {
        "status": "ok" if db_ok else "degraded",
        "scope": "api",
        "time": dt.datetime.utcnow().isoformat()+"Z",
        "db_ok": db_ok,
        "db_error": db_error,
        "origins": origins,
        "vapid_public_present": bool(VAPID_PUBLIC_KEY),
        "preview_regex_enabled": any(hasattr(o, 'match') for o in origins),
    }

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
    user = {"name": name, "email": email, "password": hashed, "avatar_url": data.get("avatar_url",""), "joined_at": dt.datetime.utcnow(), "couple_id": None}
    res = users_col.insert_one(user)
    token = create_access_token(identity=email)
    return {"access_token": token, "user": {"id": str(res.inserted_id), "name": name, "email": email, "avatar_url": user["avatar_url"]}}, 201

@app.post("/api/login")
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").lower().strip()
    pwd   = data.get("password") or ""
    user  = users_col.find_one({"email": email})
    if not user or not check_password_hash(user["password"], pwd):
        return {"error":"invalid_credentials"}, 401
    token = create_access_token(identity=email)
    return {"access_token": token, "user": {"id": str(user["_id"]), "name": user["name"], "email": user["email"], "avatar_url": user.get("avatar_url","")}}

@app.get("/api/users")
@jwt_required()
def get_users():
    users = list(users_col.find({}, {"password":0}).sort("joined_at", 1))
    return jsonify([serialize(u) for u in users])

@app.get("/api/me")
@jwt_required()
def me_get():
    u = current_user()
    if not u: return {"error": "unauth"}, 401
    return jsonify(serialize(u))

@app.put("/api/me")
@jwt_required()
def me_update():
    u = current_user()
    if not u: return {"error": "unauth"}, 401
    data = request.form if request.form else (request.get_json() or {})
    
    fields = {}
    if "name" in data: fields["name"] = data["name"]
    if "avatar_url" in data: fields["avatar_url"] = data["avatar_url"]
    
    # Handle direct file upload in PUT if present
    if request.files and 'file' in request.files:
        f = request.files['file']
        if f:
            url = save_file(f)
            fields['avatar_url'] = url

    if fields:
        users_col.update_one({"_id": u["_id"]}, {"$set": fields})
        u = users_col.find_one({"_id": u["_id"]})
        
    return jsonify(serialize(u))


# ───────── Couple Management ─────────
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
    if len(c["members"]) >= 2:
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
    return {"in_couple": True, "couple_id": str(cid), "invite_code": c.get("invite_code"), "members": [{"id": str(m["_id"]), "name": m["name"], "email": m["email"], "avatar_url": m.get("avatar_url","")} for m in members]}

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
    item = {"title": data["title"], "description": data.get("description",""), "created_by": str(u["_id"]), "assigned_to": data.get("assigned_to"), "priority": data.get("priority","normal"), "due_date": iso_to_dt(data.get("due_date")), "status": "pending", "created_at": dt.datetime.utcnow(), "couple_id": cid}
    res = reminders_col.insert_one(item); item["_id"]=str(res.inserted_id)
    try:
        payload = {'type': 'reminder_created','title': 'Nouveau rappel','body': f"{item['title']} (prio: {item['priority']})",'url': '/reminders'}
        broadcast_push(cid, u['email'], payload)
    except Exception as e:
        if DEBUG_PUSH: print('[PUSH][REMINDER][ERROR]', e)
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

@app.get('/api/restaurants/<rid>')
@jwt_required()
@require_couple
def restaurants_get(u, cid, rid):
    doc = restaurants_col.find_one({"_id": oid(rid), "couple_id": cid})
    if not doc: return {"error":"not_found"}, 404
    return jsonify(serialize(doc))

@app.post("/api/restaurants")
@jwt_required()
@require_couple
def restaurants_create(u, cid):
    data = request.get_json() or {}
    item = {"name": data["name"], "address": data.get("address",""), "map_url": data.get("map_url",""), "image_url": data.get("image_url",""), "images": data.get("images", []), "status": data.get("status","to_try"), "notes": data.get("notes",""), "added_by": str(u["_id"]), "added_at": dt.datetime.utcnow(), "couple_id": cid}
    res = restaurants_col.insert_one(item); item["_id"]=str(res.inserted_id)
    return jsonify(serialize(item)), 201

@app.put("/api/restaurants/<rid>")
@jwt_required()
@require_couple
def restaurants_update(u, cid, rid):
    data = request.get_json() or {}
    fields = {k: v for k,v in data.items() if k in ["name","address","map_url","image_url","status","notes","images"]}
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

@app.get('/api/activities/<aid>')
@jwt_required()
@require_couple
def activities_get(u, cid, aid):
    doc = activities_col.find_one({"_id": oid(aid), "couple_id": cid})
    if not doc: return {"error":"not_found"}, 404
    return jsonify(serialize(doc))

@app.post("/api/activities")
@jwt_required()
@require_couple
def activities_create(u, cid):
    data = request.get_json() or {}
    item = {"title": data["title"], "category": data.get("category","other"), "status": data.get("status","planned"), "notes": data.get("notes",""), "images": data.get("images", []), "image_url": data.get("image_url",""), "added_by": str(u["_id"]), "added_at": dt.datetime.utcnow(), "couple_id": cid}
    res = activities_col.insert_one(item); item["_id"]=str(res.inserted_id)
    return jsonify(serialize(item)), 201

@app.put("/api/activities/<aid>")
@jwt_required()
@require_couple
def activities_update(u, cid, aid):
    data = request.get_json() or {}
    fields = {k: v for k,v in data.items() if k in ["title","category","status","notes","image_url","images"]}
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
    # Include legacy items that may lack couple_id but were added by members
    member_ids = []
    try:
        c = couples_col.find_one({"_id": cid}, {"members":1})
        if c:
            member_ids = c.get("members", [])
    except Exception:
        pass
    query = {"$or": [
        {"couple_id": cid},
        {"couple_id": {"$exists": False}, "added_by": {"$in": [str(m) for m in member_ids]}}
    ]}
    items = list(wishlist_col.find(query).sort("added_at", -1))
    # Expand image id references if they look like photo objectids and photos exist
    enriched = []
    for it in items:
        images = it.get("images") or []
        expanded_images = []
        for img in images:
            if isinstance(img, dict):
                expanded_images.append(img)
                continue
            # treat as id referencing photos collection
            try:
                ph = photos_col.find_one({"_id": oid(img)})
                if ph:
                    expanded_images.append({"_id": str(ph["_id"]), "url": ph.get("url"), "filename": os.path.basename(ph.get("url",""))})
                else:
                    expanded_images.append(img)
            except Exception:
                expanded_images.append(img)
        it["images"] = expanded_images
        enriched.append(serialize(it))
    return jsonify(enriched)

@app.post("/api/wishlist")
@jwt_required()
@require_couple
def wishlist_create(u, cid):
    data = request.get_json() or {}
    recipient_id = data.get("recipient_id") or data.get("for_user")
    item = {"title": data["title"], "description": data.get("description",""), "image_url": data.get("image_url",""), "images": data.get("images", []), "link_url": data.get("link_url",""), "for_user": recipient_id, "recipient_id": recipient_id, "added_by": str(u["_id"]), "status": data.get("status","idea"), "added_at": dt.datetime.utcnow(), "couple_id": cid}
    res = wishlist_col.insert_one(item); item["_id"]=str(res.inserted_id)
    try:
        payload = {'type': 'wishlist_created','title': 'Wishlist','body': f"Nouvel item: {item['title']}",'url': '/wishlist'}
        broadcast_push(cid, u['email'], payload)
    except Exception as e:
        if DEBUG_PUSH: print('[PUSH][WISHLIST][ERROR]', e)
    return jsonify(serialize(item)), 201

@app.put("/api/wishlist/<wid>")
@jwt_required()
@require_couple
def wishlist_update(u, cid, wid):
    data = request.get_json() or {}
    # Accept recipient_id alias
    if 'recipient_id' in data and 'for_user' not in data:
        data['for_user'] = data['recipient_id']
    fields = {k: v for k,v in data.items() if k in ["title","description","image_url","link_url","for_user","recipient_id","status","images"]}
    wishlist_col.update_one({"_id": oid(wid), "couple_id": cid}, {"$set": fields})
    return {"msg":"updated"}

# ───────── Couples (list) ─────────
@app.get('/api/couples')
@jwt_required()
def couples_list():
    u = current_user()
    if not u:
        return {"error": "unauth"}, 401
    cid = u.get('couple_id')
    if not cid:
        return jsonify([])
    c = couples_col.find_one({'_id': cid})
    if not c:
        return jsonify([])
    # Provide a simple representation with name or members names joined
    members = list(users_col.find({'_id': {'$in': c.get('members', [])}}, {"password":0}))
    display_name = c.get('name') or (' & '.join([m.get('name') for m in members if m.get('name')])) or 'Couple'
    return jsonify([{"_id": str(c['_id']), "name": display_name, "invite_code": c.get('invite_code')}])

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
    if request.content_type and 'multipart/form-data' in request.content_type:
        files = request.files.getlist('files')
        caption = request.form.get('caption','')
        album_id = request.form.get('album_id') or None
        created = []
        for f in files:
            try:
                url = save_file(f)
                item = {"url": url, "caption": caption, "album_id": album_id, "uploaded_by": str(u["_id"]), "uploaded_at": dt.datetime.utcnow(), "couple_id": cid}
                res = photos_col.insert_one(item); item["_id"]=str(res.inserted_id)
                created.append(serialize(item))
            except Exception as e:
                print('upload error', e)
        return jsonify(created), 201
    data = request.get_json() or {}
    if not data.get('url'): return {"error":"missing_url"}, 400
    item = {"url": data["url"], "caption": data.get("caption",""), "album_id": data.get("album_id"), "uploaded_by": str(u["_id"]), "uploaded_at": dt.datetime.utcnow(), "couple_id": cid}
    res = photos_col.insert_one(item); item["_id"]=str(res.inserted_id)
    return jsonify(serialize(item)), 201

@app.put("/api/photos/<pid>")
@jwt_required()
@require_couple
def photos_update(u, cid, pid):
    data = request.get_json() or {}
    fields = {k: v for k,v in data.items() if k in ["caption","album_id"]}
    photos_col.update_one({"_id": oid(pid), "couple_id": cid}, {"$set": fields})
    return {"msg":"updated"}

@app.delete("/api/photos/<pid>")
@jwt_required()
@require_couple
def photos_delete(u, cid, pid):
    doc = photos_col.find_one({"_id": oid(pid), "couple_id": cid})
    if not doc: return {"error": "not_found"}, 404
    photos_col.delete_one({"_id": oid(pid), "couple_id": cid})
    try:
        url = doc.get('url') or ''
        if url.startswith('/uploads/'):
            fname = url.split('/uploads/',1)[1]
            fpath = os.path.join(UPLOAD_DIR, fname)
            if os.path.isfile(fpath): os.remove(fpath)
    except Exception as e:
        print('file delete err', e)
    return {"msg":"deleted"}

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
    item = {"content": data["content"], "pinned": bool(data.get("pinned", False)), "created_by": str(u["_id"]), "created_at": dt.datetime.utcnow(), "couple_id": cid}
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

# ───────── Upload generic ─────────
@app.post('/api/upload')
@jwt_required()
@require_couple
def upload_files(u, cid):
    if 'files' not in request.files:
        return {'error': 'no_files'}, 400
    urls = []
    for f in request.files.getlist('files'):
        try:
            url = save_file(f)
            urls.append(url)
        except Exception as e:
            print('upload err', e)
    return {'files': urls}

@app.get('/uploads/<path:fname>')
def serve_upload(fname):
    return send_from_directory(UPLOAD_DIR, fname)

# ───────── Web Push ─────────
try:
    from pywebpush import webpush, WebPushException  # type: ignore
except Exception:
    webpush = None
    WebPushException = Exception

VAPID_PUBLIC_KEY  = os.getenv("VAPID_PUBLIC_KEY", "")
VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY", "")
VAPID_SUBJECT     = os.getenv("VAPID_SUBJECT", "mailto:admin@example.com")
DEBUG_PUSH        = os.getenv("DEBUG_PUSH", "0") in ("1","true","True")

def send_push(subscription, payload: dict):
    if not (webpush and VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY):
        return False, 'missing_webpush_or_keys'
    try:
        data_str = jsonify(payload).get_data(as_text=True)
        if DEBUG_PUSH:
            print('[PUSH][SEND]', subscription.get('endpoint','')[:55], payload.get('title'))
        webpush(
            subscription_info=subscription,
            data=data_str,
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_public_key=VAPID_PUBLIC_KEY,
            vapid_claims={"sub": VAPID_SUBJECT}
        )
        return True, None
    except WebPushException as ex:
        if DEBUG_PUSH:
            print('[PUSH][ERROR]', ex)
        return False, str(ex)

@app.get('/api/push/public-key')
def push_public_key():
    return {"publicKey": VAPID_PUBLIC_KEY}

@app.post('/api/push/subscribe')
@jwt_required()
def push_subscribe():
    data = request.get_json() or {}
    if 'endpoint' not in data or 'keys' not in data:
        return {"error":"invalid_subscription"}, 400
    u = current_user()
    if not u: return {"error":"unauth"}, 401
    push_subs_col.update_one(
        {"user_email": u['email'], "endpoint": data['endpoint']},
        {"$set": {"user_email": u['email'], "endpoint": data['endpoint'], "subscription": data, "updated_at": dt.datetime.utcnow(), "couple_id": u.get('couple_id')}},
        upsert=True
    )
    return {"ok": True}, 201

@app.post('/api/push/test')
@jwt_required()
def push_test():
    u = current_user()
    if not u: return {"error":"unauth"}, 401
    sub = push_subs_col.find_one({"user_email": u['email']})
    if not sub:
        return {"error":"no_subscription"}, 404
    payload = {"type":"test","title":"Test Push","body":"Ça marche !"}
    ok, err = send_push(sub['subscription'], payload)
    if not ok:
        return {"error":"send_failed","detail": err}, 500
    return {"sent": True}

def broadcast_push(couple_id, author_email, payload: dict, exclude_author=True):
    if not (webpush and VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY):
        return
    query = {"couple_id": couple_id}
    subs = list(push_subs_col.find(query))
    for s in subs:
        if exclude_author and s.get('user_email') == author_email:
            continue
        ok, err = send_push(s.get('subscription', {}), payload)
        if not ok and err and ('410' in err or 'expired' in err.lower()):
            push_subs_col.delete_one({'_id': s['_id']})

# ───────── Albums ─────────
@app.get("/api/albums")
@jwt_required()
@require_couple
def albums_list(u, cid):
    items = list(albums_col.find({"couple_id": cid}).sort("created_at", -1))
    return jsonify([serialize(x) for x in items])

@app.post("/api/albums")
@jwt_required()
@require_couple
def albums_create(u, cid):
    data = request.get_json() or {}
    if not data.get("title"):
        return {"error": "missing_title"}, 400
    item = {
        "title": data["title"],
        "description": data.get("description", ""),
        "created_by": str(u["_id"]),
        "created_at": dt.datetime.utcnow(),
        "couple_id": cid
    }
    res = albums_col.insert_one(item)
    item["_id"] = str(res.inserted_id)
    return jsonify(serialize(item)), 201

@app.delete("/api/albums/<aid>")
@jwt_required()
@require_couple
def albums_delete(u, cid, aid):
    albums_col.delete_one({"_id": oid(aid), "couple_id": cid})
    # Detach photos from this album
    photos_col.update_many({"album_id": aid, "couple_id": cid}, {"$set": {"album_id": None}})
    return {"msg": "deleted"}

# ───────── Memories ─────────
@app.get("/api/memories")
@jwt_required()
@require_couple
def memories_list(u, cid):
    items = list(memories_col.find({"couple_id": cid}).sort("date", -1))
    return jsonify([serialize(x) for x in items])

@app.post("/api/memories")
@jwt_required()
@require_couple
def memories_create(u, cid):
    data = request.get_json() or {}
    if not data.get("title"): return {"error": "missing_title"}, 400
    
    item = {
        "title": data["title"],
        "content": data.get("content", ""),
        "date": iso_to_dt(data.get("date")) or dt.datetime.utcnow(),
        "photo_url": data.get("photo_url", ""),
        "created_by": str(u["_id"]),
        "created_at": dt.datetime.utcnow(),
        "couple_id": cid
    }
    res = memories_col.insert_one(item)
    item["_id"] = str(res.inserted_id)
    return jsonify(serialize(item)), 201

@app.put("/api/memories/<mid>")
@jwt_required()
@require_couple
def memories_update(u, cid, mid):
    data = request.get_json() or {}
    fields = {}
    if "title" in data: fields["title"] = data["title"]
    if "content" in data: fields["content"] = data["content"]
    if "date" in data: fields["date"] = iso_to_dt(data["date"])
    if "photo_url" in data: fields["photo_url"] = data["photo_url"]
    
    if fields:
        memories_col.update_one({"_id": oid(mid), "couple_id": cid}, {"$set": fields})
    return {"msg": "updated"}

@app.delete("/api/memories/<mid>")
@jwt_required()
@require_couple
def memories_delete(u, cid, mid):
    memories_col.delete_one({"_id": oid(mid), "couple_id": cid})
    return {"msg": "deleted"}

# ───────── Comments ─────────
@app.get("/api/comments")
@jwt_required()
@require_couple
def comments_list(u, cid):
    tt = request.args.get("target_type")
    tid = request.args.get("target_id")
    if not (tt and tid): return jsonify([])
    items = list(comments_col.find({"couple_id": cid, "target_type": tt, "target_id": tid}).sort("created_at", 1))
    return jsonify([serialize(x) for x in items])

@app.post("/api/comments")
@jwt_required()
@require_couple
def comments_create(u, cid):
    data = request.get_json() or {}
    if not (data.get("target_type") and data.get("target_id") and data.get("content")):
        return {"error": "missing_fields"}, 400
    
    item = {
        "target_type": data["target_type"],
        "target_id": data["target_id"],
        "content": data["content"],
        "created_by": str(u["_id"]),
        "created_at": dt.datetime.utcnow(),
        "couple_id": cid
    }
    res = comments_col.insert_one(item)
    item["_id"] = str(res.inserted_id)
    return jsonify(serialize(item)), 201

@app.delete("/api/comments/<comment_id>")
@jwt_required()
@require_couple
def comments_delete(u, cid, comment_id):
    comments_col.delete_one({"_id": oid(comment_id), "couple_id": cid})
    return {"msg": "deleted"}

# ───────── Reactions ─────────
@app.get("/api/reactions")
@jwt_required()
@require_couple
def reactions_list(u, cid):
    tt = request.args.get("target_type")
    tid = request.args.get("target_id")
    if not (tt and tid): return jsonify([])
    items = list(reactions_col.find({"couple_id": cid, "target_type": tt, "target_id": tid}))
    return jsonify([serialize(x) for x in items])

@app.post("/api/reactions")
@jwt_required()
@require_couple
def reactions_toggle(u, cid):
    data = request.get_json() or {}
    if not (data.get("target_type") and data.get("target_id") and data.get("emoji")):
        return {"error": "missing_fields"}, 400
    
    query = {
        "couple_id": cid,
        "target_type": data["target_type"],
        "target_id": data["target_id"],
        "emoji": data["emoji"],
        "created_by": str(u["_id"])
    }
    
    existing = reactions_col.find_one(query)
    if existing:
        reactions_col.delete_one({"_id": existing["_id"]})
        return {"action": "removed"}
    else:
        item = query.copy()
        item["created_at"] = dt.datetime.utcnow()
        reactions_col.insert_one(item)
        return {"action": "added"}

# ───────── Settings ─────────
@app.get("/api/settings")
@jwt_required()
def settings_get():
    u = current_user()
    if not u: return {"error": "unauth"}, 401
    
    s = settings_col.find_one({"user_id": str(u["_id"])})
    if not s:
        # Return defaults
        return jsonify({
            "theme": "dark",
            "notifications_enabled": True,
            "language": "fr"
        })
    return jsonify(serialize(s))

@app.put("/api/settings")
@jwt_required()
def settings_update():
    u = current_user()
    if not u: return {"error": "unauth"}, 401
    
    data = request.get_json() or {}
    fields = {}
    if "theme" in data: fields["theme"] = data["theme"]
    if "notifications_enabled" in data: fields["notifications_enabled"] = bool(data["notifications_enabled"])
    if "language" in data: fields["language"] = data["language"]
    
    if fields:
        settings_col.update_one(
            {"user_id": str(u["_id"])},
            {"$set": fields, "$setOnInsert": {"user_id": str(u["_id"])}},
            upsert=True
        )
    return {"msg": "updated"}

# ───────── Entrypoint ─────────
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=False)
