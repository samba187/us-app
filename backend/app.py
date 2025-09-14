from flask import Flask, request, jsonify, make_response, send_from_directory
from flask_cors import CORS
from flask_pymongo import PyMongo
from bson import ObjectId
from datetime import datetime, timedelta
import os
import uuid
from dotenv import load_dotenv
import bcrypt
import jwt
import secrets
import string
from pywebpush import webpush, WebPushException
from functools import wraps
from werkzeug.utils import secure_filename

# Charger les variables d'environnement
load_dotenv()

app = Flask(__name__)

# Dossier d'upload simple (stockage local)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(os.path.dirname(BASE_DIR), 'uploads')  # remonte d'un niveau pour partager avec projet root
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_DIR
ALLOWED_IMAGE_EXT = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}

# CORS solide: autorise toutes origines pour l'API, sans credentials
CORS(app,
    resources={r"/api/*": {"origins": "*"}},
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    supports_credentials=False)

# Middleware pour ajouter les headers CORS à toutes les réponses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Préflight global (OPTIONS)
@app.before_request
def handle_preflight():
    if request.method == 'OPTIONS':
        resp = make_response('', 204)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,X-Requested-With'
        resp.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
        return resp

# Configuration MongoDB / JWT (fallback multi noms)
_mongo_uri = (
    os.getenv("MONGO_URI") or
    os.getenv("MONGODB_URI") or
    os.getenv("MONGO_URI_ATLAS") or
    os.getenv("MONGODB_ATLAS_URI")
)
app.config["MONGO_URI"] = _mongo_uri
app.config['DEBUG_PUSH'] = os.getenv('DEBUG_PUSH', '0') == '1'
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "change-me")
app.config["VAPID_PUBLIC_KEY"] = os.getenv("VAPID_PUBLIC_KEY", "")
app.config["VAPID_PRIVATE_KEY"] = os.getenv("VAPID_PRIVATE_KEY", "")
app.config["VAPID_SUBJECT"] = os.getenv("VAPID_SUBJECT", "mailto:admin@example.com")

mongo = PyMongo(app)

# Middleware d'authentification
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token manquant!'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=["HS256"])
            current_user_id = data['user_id']
        except:
            return jsonify({'message': 'Token invalide!'}), 401
        
        return f(current_user_id, *args, **kwargs)
    return decorated

# Helper function pour JSON
def serialize_doc(doc):
    if doc is None:
        return None
    doc['_id'] = str(doc['_id'])
    return doc

def send_push(subscription, payload):
    if not app.config['VAPID_PUBLIC_KEY'] or not app.config['VAPID_PRIVATE_KEY']:
        return False, 'VAPID keys missing'
    try:
        if app.config['DEBUG_PUSH']:
            print('[PUSH][SEND] endpoint=', subscription.get('endpoint','')[:60], 'payload=', payload[:120])
        webpush(
            subscription_info=subscription,
            data=payload,
            vapid_private_key=app.config['VAPID_PRIVATE_KEY'],
            vapid_public_key=app.config['VAPID_PUBLIC_KEY'],
            vapid_claims={"sub": app.config['VAPID_SUBJECT']}
        )
        return True, None
    except WebPushException as ex:
        if app.config['DEBUG_PUSH']:
            print('[PUSH][ERROR]', ex)
        return False, str(ex)

# Routes d'authentification
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Vérifier que l'utilisateur n'existe pas déjà
    if mongo.db.users.find_one({'email': data['email']}):
        return jsonify({'message': 'Email déjà utilisé'}), 400
    
    # Hasher le mot de passe
    hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
    
    # Créer l'utilisateur
    user = {
        'name': data['name'],
        'email': data['email'],
        'password': hashed_password,
        'avatar_url': data.get('avatar_url', ''),
        'joined_at': datetime.utcnow()
    }
    
    result = mongo.db.users.insert_one(user)
    
    # Créer le token JWT
    token = jwt.encode({
        'user_id': str(result.inserted_id),
        'exp': datetime.utcnow() + timedelta(days=30)
    }, app.config['JWT_SECRET_KEY'], algorithm='HS256')
    
    return jsonify({
        'token': token,
        'user': {
            'id': str(result.inserted_id),
            'name': user['name'],
            'email': user['email'],
            'avatar_url': user['avatar_url']
        }
    })

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    user = mongo.db.users.find_one({'email': data['email']})
    
    if user and bcrypt.checkpw(data['password'].encode('utf-8'), user['password']):
        token = jwt.encode({
            'user_id': str(user['_id']),
            'exp': datetime.utcnow() + timedelta(days=30)
        }, app.config['JWT_SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'token': token,
            'user': {
                'id': str(user['_id']),
                'name': user['name'],
                'email': user['email'],
                'avatar_url': user.get('avatar_url', '')
            }
        })
    
    return jsonify({'message': 'Email ou mot de passe incorrect'}), 401

# Route pour récupérer les utilisateurs du couple
@app.route('/api/users', methods=['GET'])
@token_required
def get_users(current_user_id):
    users = list(mongo.db.users.find({}, {'password': 0}).sort('joined_at', 1))
    return jsonify([serialize_doc(user) for user in users])

# Routes pour les rappels
@app.route('/api/reminders', methods=['GET'])
@token_required
def get_reminders(current_user_id):
    # Récupérer TOUS les rappels (partage couple)
    reminders = list(mongo.db.reminders.find().sort('created_at', -1))
    
    # Enrichir avec les infos utilisateur
    for reminder in reminders:
        if reminder.get('created_by'):
            creator = mongo.db.users.find_one({'_id': ObjectId(reminder['created_by'])})
            reminder['created_by_name'] = creator['name'] if creator else 'Inconnu'
        if reminder.get('assigned_to'):
            assignee = mongo.db.users.find_one({'_id': ObjectId(reminder['assigned_to'])})
            reminder['assigned_to_name'] = assignee['name'] if assignee else 'Inconnu'
    
    return jsonify([serialize_doc(reminder) for reminder in reminders])

@app.route('/api/reminders', methods=['POST'])
@token_required
def create_reminder(current_user_id):
    data = request.get_json()
    
    reminder = {
        'title': data['title'],
        'description': data.get('description', ''),
        'created_by': current_user_id,
        'assigned_to': data.get('assigned_to'),
        'priority': data.get('priority', 'normal'),
        'due_date': datetime.fromisoformat(data['due_date']) if data.get('due_date') else None,
        'status': 'pending',
        'created_at': datetime.utcnow()
    }
    
    result = mongo.db.reminders.insert_one(reminder)
    reminder['_id'] = str(result.inserted_id)
    
    reminder_doc = serialize_doc(reminder)

    # Envoyer push aux autres utilisateurs (simple diffusion)
    try:
        subs = list(mongo.db.push_subscriptions.find())
        payload = jsonify({
            'type': 'reminder_created',
            'title': 'Nouveau rappel',
            'body': f"{reminder['title']} (prio: {reminder['priority']})",
            'priority': reminder['priority'],
            'url': '/reminders'
        }).get_data(as_text=True)
        for sub in subs:
            # Ne pas notifier le créateur si souhaité (ici on notifie tout le monde sauf créateur)
            if sub.get('user_id') == current_user_id:
                continue
            success, err = send_push(sub['subscription'], payload)
            if not success:
                # Nettoyer si subscription invalide
                if '410' in (err or '') or 'expired' in (err or ''):
                    mongo.db.push_subscriptions.delete_one({'_id': sub['_id']})
    except Exception as e:
        pass

    return jsonify(reminder_doc), 201

@app.route('/api/reminders/<reminder_id>', methods=['PUT'])
@token_required
def update_reminder(current_user_id, reminder_id):
    data = request.get_json()
    
    update_data = {}
    if 'status' in data:
        update_data['status'] = data['status']
    if 'title' in data:
        update_data['title'] = data['title']
    if 'description' in data:
        update_data['description'] = data['description']
    
    mongo.db.reminders.update_one(
        {'_id': ObjectId(reminder_id)},
        {'$set': update_data}
    )
    
    return jsonify({'message': 'Rappel mis à jour'})

# Routes pour les restaurants
@app.route('/api/restaurants', methods=['GET'])
@token_required
def get_restaurants(current_user_id):
    restaurants = list(mongo.db.restaurants.find().sort('added_at', -1))
    return jsonify([serialize_doc(restaurant) for restaurant in restaurants])

@app.route('/api/restaurants', methods=['POST'])
@token_required
def create_restaurant(current_user_id):
    data = request.get_json()
    
    restaurant = {
        'name': data['name'],
        'address': data.get('address', ''),
        'map_url': data.get('map_url', ''),
        'image_url': data.get('image_url', ''),
        'status': data.get('status', 'to_try'),
        'notes': data.get('notes', ''),
        'added_by': current_user_id,
        'added_at': datetime.utcnow()
    }
    
    result = mongo.db.restaurants.insert_one(restaurant)
    restaurant['_id'] = str(result.inserted_id)
    
    return jsonify(serialize_doc(restaurant)), 201

# Routes pour les activités
@app.route('/api/activities', methods=['GET'])
@token_required
def get_activities(current_user_id):
    activities = list(mongo.db.activities.find().sort('added_at', -1))
    return jsonify([serialize_doc(activity) for activity in activities])

@app.route('/api/activities', methods=['POST'])
@token_required
def create_activity(current_user_id):
    data = request.get_json()
    
    activity = {
        'title': data['title'],
        'category': data.get('category', 'other'),
        'status': data.get('status', 'planned'),
        'notes': data.get('notes', ''),
        'image_url': data.get('image_url', ''),
        'added_by': current_user_id,
        'added_at': datetime.utcnow()
    }
    
    result = mongo.db.activities.insert_one(activity)
    activity['_id'] = str(result.inserted_id)
    
    return jsonify(serialize_doc(activity)), 201

# Routes pour la wishlist
@app.route('/api/wishlist', methods=['GET'])
@token_required
def get_wishlist(current_user_id):
    wishlist = list(mongo.db.wishlist_items.find().sort('added_at', -1))
    return jsonify([serialize_doc(item) for item in wishlist])

@app.route('/api/wishlist', methods=['POST'])
@token_required
def create_wishlist_item(current_user_id):
    data = request.get_json()
    
    item = {
        'title': data['title'],
        'description': data.get('description', ''),
        'image_url': data.get('image_url', ''),
        'images': data.get('images', []),
        'link_url': data.get('link_url', ''),
        'for_user': data.get('for_user'),
        'added_by': current_user_id,
        'status': 'idea',
        'added_at': datetime.utcnow()
    }
    
    result = mongo.db.wishlist_items.insert_one(item)
    item['_id'] = str(result.inserted_id)

    # Push notification wishlist
    try:
        subs = list(mongo.db.push_subscriptions.find())
        payload = jsonify({
            'type': 'wishlist_created',
            'title': 'Wishlist',
            'body': f"Nouvel item: {item['title']}",
            'url': '/wishlist'
        }).get_data(as_text=True)
        for sub in subs:
            if sub.get('user_id') == current_user_id:
                continue
            send_push(sub['subscription'], payload)
    except Exception:
        pass
    return jsonify(serialize_doc(item)), 201

@app.route('/api/wishlist/<item_id>', methods=['PUT'])
@token_required
def update_wishlist_item(current_user_id, item_id):
    data = request.get_json()
    update = {}
    for field in ['title', 'description', 'image_url', 'link_url', 'status', 'for_user', 'images']:
        if field in data:
            update[field] = data[field]
    if not update:
        return jsonify({'message': 'Rien à mettre à jour'}), 400
    mongo.db.wishlist_items.update_one({'_id': ObjectId(item_id)}, {'$set': update})
    doc = mongo.db.wishlist_items.find_one({'_id': ObjectId(item_id)})
    return jsonify(serialize_doc(doc)), 200

# Routes pour les photos
@app.route('/api/photos', methods=['GET'])
@token_required
def get_photos(current_user_id):
    photos = list(mongo.db.photos.find().sort('uploaded_at', -1))
    return jsonify([serialize_doc(photo) for photo in photos])

@app.route('/api/photos', methods=['POST'])
@token_required
def create_photo(current_user_id):
    # Support JSON (ancien) OU multipart (nouvel upload d'images)
    if request.content_type and request.content_type.startswith('multipart/form-data'):
        files = request.files.getlist('files')
        saved = []
        for f in files:
            filename = secure_filename(f.filename)
            if not filename:
                continue
            ext = os.path.splitext(filename)[1].lower()
            if ext not in ALLOWED_IMAGE_EXT:
                continue
            new_name = f"{uuid.uuid4().hex}{ext}"
            path = os.path.join(UPLOAD_DIR, new_name)
            f.save(path)
            doc = {
                'url': f'/uploads/{new_name}',
                'caption': '',
                'album_id': None,
                'uploaded_by': current_user_id,
                'uploaded_at': datetime.utcnow()
            }
            result = mongo.db.photos.insert_one(doc)
            doc['_id'] = str(result.inserted_id)
            saved.append(doc)
        return jsonify(saved), 201
    # JSON classique
    data = request.get_json()
    photo = {
        'url': data['url'],
        'caption': data.get('caption', ''),
        'album_id': data.get('album_id'),
        'uploaded_by': current_user_id,
        'uploaded_at': datetime.utcnow()
    }
    result = mongo.db.photos.insert_one(photo)
    photo['_id'] = str(result.inserted_id)
    return jsonify(serialize_doc(photo)), 201

# Routes pour les notes
@app.route('/api/notes', methods=['GET'])
@token_required
def get_notes(current_user_id):
    notes = list(mongo.db.notes.find().sort('created_at', -1))
    return jsonify([serialize_doc(note) for note in notes])

@app.route('/api/notes', methods=['POST'])
@token_required
def create_note(current_user_id):
    data = request.get_json()
    
    note = {
        'content': data['content'],
        'pinned': data.get('pinned', False),
        'created_by': current_user_id,
        'created_at': datetime.utcnow()
    }
    
    result = mongo.db.notes.insert_one(note)
    note['_id'] = str(result.inserted_id)
    
    return jsonify(serialize_doc(note)), 201

# ---- PUSH NOTIFICATIONS ----
@app.route('/api/push/public-key', methods=['GET'])
def get_public_key():
    return jsonify({'publicKey': app.config['VAPID_PUBLIC_KEY']}), 200

@app.route('/uploads/<path:filename>', methods=['GET'])
def serve_upload(filename):
    # Sécurité: ne pas permettre de remonter dans l'arborescence
    return send_from_directory(UPLOAD_DIR, filename, as_attachment=False)

@app.route('/api/push/subscribe', methods=['POST'])
@token_required
def subscribe_push(current_user_id):
    data = request.get_json()
    if 'endpoint' not in data or 'keys' not in data:
        return jsonify({'message': 'Invalid subscription'}), 400
    # Upsert par user + endpoint
    if app.config['DEBUG_PUSH']:
        print('[PUSH][SUBSCRIBE] user', current_user_id, 'endpoint', data.get('endpoint','')[:60])
    mongo.db.push_subscriptions.update_one(
        {'user_id': current_user_id, 'endpoint': data['endpoint']},
        {'$set': {'user_id': current_user_id, 'endpoint': data['endpoint'], 'subscription': data, 'updated_at': datetime.utcnow()}},
        upsert=True
    )
    return jsonify({'message': 'Subscribed'}), 201

@app.route('/api/push/test', methods=['POST'])
@token_required
def test_push(current_user_id):
    sub = mongo.db.push_subscriptions.find_one({'user_id': current_user_id})
    if not sub:
        return jsonify({'message': 'No subscription'}), 404
    payload = jsonify({'type': 'test', 'title': 'Test Push', 'body': 'Ça marche !'}).get_data(as_text=True)
    success, err = send_push(sub['subscription'], payload)
    if not success:
        return jsonify({'message': 'Failed', 'error': err}), 500
    return jsonify({'message': 'Sent'}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

# ---- HEALTH ----
@app.route('/api/health', methods=['GET'])
def health():
    db_ok = True
    try:
        mongo.db.command('ping')
    except Exception as e:
        db_ok = False
    return jsonify({
        'status': 'ok',
        'db': db_ok,
        'vapid_public_set': bool(app.config['VAPID_PUBLIC_KEY']),
        'push_subscriptions': mongo.db.push_subscriptions.count_documents({}),
        'debug_push': app.config['DEBUG_PUSH']
    }), 200
