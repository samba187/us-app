from flask import Flask, request, jsonify
from flask_cors import CORS
import re
from flask_pymongo import PyMongo
from bson import ObjectId
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import bcrypt
import jwt
from functools import wraps

# Charger les variables d'environnement
load_dotenv()

app = Flask(__name__)

# --- CORS avancé inspiré ancienne version ---
# Fallback origins inclut nouveau domaine Netlify + localhost
_fallback_origins = "https://dreamy-kitten-9d113d.netlify.app,http://localhost:3000"
raw_origins = os.getenv("CORS_ORIGINS", _fallback_origins)
origins_list = [o.strip() for o in raw_origins.split(',') if o.strip()]

# Optionnel: autoriser prévisualisations Netlify si variable set
if os.getenv("ALLOW_NETLIFY_PREVIEWS", "false").lower() in ("1", "true", "yes"):
    # Flask-CORS accepte des objets regex dans origins si fournis directement
    origins_list.append(re.compile(r"^https://.*\.netlify\.app$"))

CORS(
    app,
    resources={r"/api/*": {
        "origins": origins_list,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
        "supports_credentials": False
    }},
    vary_header=True,
    intercept_exceptions=True,
    always_send=True
)

@app.route('/api/<path:_any>', methods=['OPTIONS'])
def cors_preflight(_any):
    return ('', 204)

# Configuration MongoDB
app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb+srv://dbadmin:<db_password>@cluster0.bnefbon.mongodb.net/us_app")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")

mongo = PyMongo(app)

# Collections helpers
users_col = lambda: mongo.db.users
couples_col = lambda: mongo.db.couples
push_subs_col = lambda: mongo.db.push_subscriptions

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

def serialize_many(cursor):
    return [serialize_doc(d) for d in cursor]

# -------------------- HEALTH --------------------
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'version': os.getenv('COMMIT_SHA', 'dev'),
        'origins': raw_origins or ''
    })

# -------------------- USER / COUPLE INFO --------------------
@app.route('/api/couple/me', methods=['GET'])
@token_required
def couple_me(current_user_id):
    couple = couples_col().find_one({'users': current_user_id})
    return jsonify(serialize_doc(couple) if couple else None)

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
    }, app.config['JWT_SECRET_KEY'])
    
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
        }, app.config['JWT_SECRET_KEY'])
        
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
    
    return jsonify(serialize_doc(reminder)), 201

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
    # Récupérer les couples de l'utilisateur
    user_couples = list(mongo.db.couples.find({'users': current_user_id}))
    couple_ids = [str(couple['_id']) for couple in user_couples]
    
    # Récupérer wishlist pour utilisateur et ses couples
    query = {
        '$or': [
            {'added_by': current_user_id},
            {'recipient_id': {'$in': couple_ids}},
            {'recipient_id': current_user_id}
        ]
    }
    
    wishlist = list(mongo.db.wishlist_items.find(query).sort('added_at', -1))
    
    # Enrichir avec les données d'images
    for item in wishlist:
        if 'images' in item and item['images']:
            images_data = []
            for img_id in item['images']:
                if isinstance(img_id, str):
                    img_doc = mongo.db.photos.find_one({'_id': ObjectId(img_id)})
                    if img_doc:
                        images_data.append(serialize_doc(img_doc))
                elif isinstance(img_id, ObjectId):
                    img_doc = mongo.db.photos.find_one({'_id': img_id})
                    if img_doc:
                        images_data.append(serialize_doc(img_doc))
            item['images'] = images_data
    
    return jsonify([serialize_doc(item) for item in wishlist])

@app.route('/api/wishlist', methods=['POST'])
@token_required
def create_wishlist_item(current_user_id):
    data = request.get_json()
    
    item = {
        'title': data['title'],
        'description': data.get('description', ''),
        'image_url': data.get('image_url', ''),
        'link_url': data.get('link_url', ''),
        'recipient_id': data.get('recipient_id', ''),
        'added_by': current_user_id,
        'status': data.get('status', 'idea'),
        'images': data.get('images', []),
        'added_at': datetime.utcnow()
    }
    
    result = mongo.db.wishlist_items.insert_one(item)
    item['_id'] = str(result.inserted_id)
    
    # Broadcast push notification (excluding author)
    try:
        # TODO: Implémenter broadcast_push quand nécessaire
        print(f"Push notification: Nouvel élément wishlist '{item['title']}'")
    except Exception as e:
        print(f"Erreur push notification: {e}")
    
    return jsonify(serialize_doc(item)), 201

# Routes pour les couples
@app.route('/api/couples', methods=['GET'])
@token_required
def get_couples(current_user_id):
    couples = list(mongo.db.couples.find({'users': current_user_id}))
    return jsonify([serialize_doc(couple) for couple in couples])

# -------------------- PUSH NOTIFICATIONS --------------------
@app.route('/api/push/public-key', methods=['GET'])
def push_public_key():
    public_key = os.getenv('VAPID_PUBLIC_KEY')
    if not public_key:
        return jsonify({'error': 'VAPID public key missing'}), 404
    return jsonify({'publicKey': public_key})

@app.route('/api/push/subscribe', methods=['POST'])
@token_required
def push_subscribe(current_user_id):
    data = request.get_json() or {}
    endpoint = data.get('endpoint')
    if not endpoint:
        return jsonify({'error': 'Missing endpoint'}), 400
    sub = {
        'user_id': current_user_id,
        'endpoint': endpoint,
        'keys': data.get('keys', {}),
        'created_at': datetime.utcnow()
    }
    push_subs_col().update_one({'endpoint': endpoint}, {'$set': sub}, upsert=True)
    return jsonify({'status': 'subscribed'})

@app.route('/api/push/test', methods=['POST'])
@token_required
def push_test(current_user_id):
    # Placeholder simple (sans pywebpush si non installé)
    count = push_subs_col().count_documents({'user_id': current_user_id})
    return jsonify({'message': 'Test push simulé', 'subscriptions': count})

# Routes pour les photos
@app.route('/api/photos', methods=['GET'])
@token_required
def get_photos(current_user_id):
    photos = list(mongo.db.photos.find().sort('uploaded_at', -1))
    return jsonify([serialize_doc(photo) for photo in photos])

@app.route('/api/photos', methods=['POST'])
@token_required
def create_photo(current_user_id):
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

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
