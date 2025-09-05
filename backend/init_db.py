"""
Script d'initialisation de la base de données
Crée les collections et les index nécessaires
"""

from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

def init_database():
    """Initialise la base de données avec les collections et index"""
    
    # Connexion à MongoDB
    mongo_uri = os.getenv('MONGO_URI', 'mongodb+srv://dbadmin:<db_password>@cluster0.bnefbon.mongodb.net/us_app')
    client = MongoClient(mongo_uri)
    db = client.us_app
    
    print("🔧 Initialisation de la base de données US...")
    
    # Créer les collections avec validation
    collections_config = {
        'users': {
            'validator': {
                '$jsonSchema': {
                    'bsonType': 'object',
                    'required': ['name', 'email', 'password'],
                    'properties': {
                        'name': {'bsonType': 'string'},
                        'email': {'bsonType': 'string', 'pattern': '^.+@.+$'},
                        'password': {'bsonType': 'string'},
                        'avatar_url': {'bsonType': 'string'},
                        'joined_at': {'bsonType': 'date'}
                    }
                }
            }
        },
        'reminders': {
            'validator': {
                '$jsonSchema': {
                    'bsonType': 'object',
                    'required': ['title', 'created_by'],
                    'properties': {
                        'title': {'bsonType': 'string'},
                        'description': {'bsonType': 'string'},
                        'created_by': {'bsonType': 'string'},
                        'assigned_to': {'bsonType': 'string'},
                        'priority': {'enum': ['normal', 'important', 'urgent']},
                        'status': {'enum': ['pending', 'done']},
                        'due_date': {'bsonType': 'date'},
                        'created_at': {'bsonType': 'date'}
                    }
                }
            }
        },
        'restaurants': {
            'validator': {
                '$jsonSchema': {
                    'bsonType': 'object',
                    'required': ['name', 'added_by'],
                    'properties': {
                        'name': {'bsonType': 'string'},
                        'address': {'bsonType': 'string'},
                        'status': {'enum': ['to_try', 'tried', 'favorite']},
                        'notes': {'bsonType': 'string'},
                        'added_by': {'bsonType': 'string'},
                        'added_at': {'bsonType': 'date'}
                    }
                }
            }
        },
        'activities': {
            'validator': {
                '$jsonSchema': {
                    'bsonType': 'object',
                    'required': ['title', 'added_by'],
                    'properties': {
                        'title': {'bsonType': 'string'},
                        'category': {'enum': ['fun', 'romantic', 'sport', 'culture', 'travel', 'other']},
                        'status': {'enum': ['planned', 'done', 'wishlist']},
                        'notes': {'bsonType': 'string'},
                        'added_by': {'bsonType': 'string'},
                        'added_at': {'bsonType': 'date'}
                    }
                }
            }
        },
        'wishlist_items': {
            'validator': {
                '$jsonSchema': {
                    'bsonType': 'object',
                    'required': ['title', 'for_user', 'added_by'],
                    'properties': {
                        'title': {'bsonType': 'string'},
                        'description': {'bsonType': 'string'},
                        'for_user': {'bsonType': 'string'},
                        'added_by': {'bsonType': 'string'},
                        'status': {'enum': ['idea', 'bought', 'gifted']},
                        'added_at': {'bsonType': 'date'}
                    }
                }
            }
        },
        'photos': {},
        'albums': {},
        'notes': {
            'validator': {
                '$jsonSchema': {
                    'bsonType': 'object',
                    'required': ['content', 'created_by'],
                    'properties': {
                        'content': {'bsonType': 'string'},
                        'pinned': {'bsonType': 'bool'},
                        'created_by': {'bsonType': 'string'},
                        'created_at': {'bsonType': 'date'}
                    }
                }
            }
        },
        'memories': {},
        'comments': {},
        'reactions': {},
        'settings': {}
    }
    
    # Créer les collections
    for collection_name, config in collections_config.items():
        if collection_name not in db.list_collection_names():
            if config:
                db.create_collection(collection_name, **config)
            else:
                db.create_collection(collection_name)
            print(f"✅ Collection '{collection_name}' créée")
        else:
            print(f"ℹ️  Collection '{collection_name}' existe déjà")
    
    # Créer les index pour les performances
    indexes = {
        'users': [
            ('email', 1),  # Index unique sur email
        ],
        'reminders': [
            ('created_by', 1),
            ('assigned_to', 1),
            ('status', 1),
            ('priority', 1),
            ('due_date', 1),
            ('created_at', -1)
        ],
        'restaurants': [
            ('added_by', 1),
            ('status', 1),
            ('added_at', -1)
        ],
        'activities': [
            ('added_by', 1),
            ('category', 1),
            ('status', 1),
            ('added_at', -1)
        ],
        'wishlist_items': [
            ('for_user', 1),
            ('added_by', 1),
            ('status', 1),
            ('added_at', -1)
        ],
        'photos': [
            ('uploaded_by', 1),
            ('album_id', 1),
            ('uploaded_at', -1)
        ],
        'notes': [
            ('created_by', 1),
            ('pinned', -1),
            ('created_at', -1)
        ]
    }
    
    for collection_name, collection_indexes in indexes.items():
        collection = db[collection_name]
        for index in collection_indexes:
            if isinstance(index, tuple):
                field, order = index
                try:
                    collection.create_index([(field, order)])
                    print(f"✅ Index créé sur {collection_name}.{field}")
                except Exception as e:
                    print(f"⚠️  Index {collection_name}.{field} existe déjà")
    
    # Index unique sur email des utilisateurs
    try:
        db.users.create_index([('email', 1)], unique=True)
        print("✅ Index unique créé sur users.email")
    except Exception as e:
        print("ℹ️  Index unique sur users.email existe déjà")
    
    print("\n🎉 Base de données initialisée avec succès !")
    print("📊 Collections créées :")
    for collection in db.list_collection_names():
        count = db[collection].count_documents({})
        print(f"   - {collection}: {count} documents")
    
    client.close()

if __name__ == '__main__':
    init_database()
