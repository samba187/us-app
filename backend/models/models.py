from datetime import datetime
from bson import ObjectId

class BaseModel:
    """Classe de base pour tous les modèles"""
    
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
        
        if not hasattr(self, '_id'):
            self._id = ObjectId()
        if not hasattr(self, 'created_at'):
            self.created_at = datetime.utcnow()
    
    def to_dict(self):
        """Convertit l'objet en dictionnaire"""
        data = {}
        for key, value in self.__dict__.items():
            if isinstance(value, ObjectId):
                data[key] = str(value)
            elif isinstance(value, datetime):
                data[key] = value.isoformat()
            else:
                data[key] = value
        return data

class User(BaseModel):
    """Modèle utilisateur"""
    
    def __init__(self, name, email, password, avatar_url='', **kwargs):
        super().__init__(**kwargs)
        self.name = name
        self.email = email
        self.password = password  # Sera hashé
        self.avatar_url = avatar_url
        self.joined_at = datetime.utcnow()

class Reminder(BaseModel):
    """Modèle rappel"""
    
    PRIORITIES = ['normal', 'important', 'urgent']
    STATUSES = ['pending', 'done']
    
    def __init__(self, title, created_by, description='', assigned_to=None, 
                 priority='normal', due_date=None, status='pending', **kwargs):
        super().__init__(**kwargs)
        self.title = title
        self.description = description
        self.created_by = created_by
        self.assigned_to = assigned_to
        self.priority = priority if priority in self.PRIORITIES else 'normal'
        self.due_date = due_date
        self.status = status if status in self.STATUSES else 'pending'

class Restaurant(BaseModel):
    """Modèle restaurant"""
    
    STATUSES = ['to_try', 'tried', 'favorite']
    
    def __init__(self, name, added_by, address='', map_url='', image_url='', 
                 status='to_try', notes='', **kwargs):
        super().__init__(**kwargs)
        self.name = name
        self.address = address
        self.map_url = map_url
        self.image_url = image_url
        self.status = status if status in self.STATUSES else 'to_try'
        self.notes = notes
        self.added_by = added_by
        self.added_at = datetime.utcnow()

class Activity(BaseModel):
    """Modèle activité"""
    
    CATEGORIES = ['fun', 'romantic', 'sport', 'culture', 'travel', 'other']
    STATUSES = ['planned', 'done', 'wishlist']
    
    def __init__(self, title, added_by, category='other', status='planned', 
                 notes='', image_url='', **kwargs):
        super().__init__(**kwargs)
        self.title = title
        self.category = category if category in self.CATEGORIES else 'other'
        self.status = status if status in self.STATUSES else 'planned'
        self.notes = notes
        self.image_url = image_url
        self.added_by = added_by
        self.added_at = datetime.utcnow()

class WishlistItem(BaseModel):
    """Modèle élément wishlist (support multi-images)"""
    
    STATUSES = ['idea', 'bought', 'gifted']
    
    def __init__(self, title, for_user, added_by, description='', image_url='', 
                 link_url='', images=None, status='idea', **kwargs):
        super().__init__(**kwargs)
        self.title = title
        self.description = description
        self.image_url = image_url  # image principale / cover
        self.images = images or []  # liste d'URLs supplémentaires
        self.link_url = link_url
        self.for_user = for_user
        self.added_by = added_by
        self.status = status if status in self.STATUSES else 'idea'
        self.added_at = datetime.utcnow()

class Photo(BaseModel):
    """Modèle photo"""
    
    def __init__(self, url, uploaded_by, caption='', album_id=None, **kwargs):
        super().__init__(**kwargs)
        self.url = url
        self.caption = caption
        self.album_id = album_id
        self.uploaded_by = uploaded_by
        self.uploaded_at = datetime.utcnow()

class Album(BaseModel):
    """Modèle album photo"""
    
    def __init__(self, title, created_by, **kwargs):
        super().__init__(**kwargs)
        self.title = title
        self.created_by = created_by

class Note(BaseModel):
    """Modèle note"""
    
    def __init__(self, content, created_by, pinned=False, **kwargs):
        super().__init__(**kwargs)
        self.content = content
        self.pinned = pinned
        self.created_by = created_by

class Memory(BaseModel):
    """Modèle souvenir/événement"""
    
    def __init__(self, title, content, created_by, date=None, photo_url='', **kwargs):
        super().__init__(**kwargs)
        self.title = title
        self.content = content
        self.date = date or datetime.utcnow()
        self.photo_url = photo_url
        self.created_by = created_by

class Comment(BaseModel):
    """Modèle commentaire"""
    
    TARGET_TYPES = ['reminder', 'wishlist', 'activity', 'restaurant', 'photo', 'note']
    
    def __init__(self, target_type, target_id, content, created_by, **kwargs):
        super().__init__(**kwargs)
        self.target_type = target_type if target_type in self.TARGET_TYPES else 'note'
        self.target_id = target_id
        self.content = content
        self.created_by = created_by

class Reaction(BaseModel):
    """Modèle réaction/emoji"""
    
    TARGET_TYPES = ['reminder', 'wishlist', 'activity', 'restaurant', 'photo', 'note']
    
    def __init__(self, target_type, target_id, emoji, created_by, **kwargs):
        super().__init__(**kwargs)
        self.target_type = target_type if target_type in self.TARGET_TYPES else 'note'
        self.target_id = target_id
        self.emoji = emoji
        self.created_by = created_by

class Settings(BaseModel):
    """Modèle paramètres utilisateur"""
    
    def __init__(self, user_id, theme='light', notifications_enabled=True, 
                 language='fr', **kwargs):
        super().__init__(**kwargs)
        self.user_id = user_id
        self.theme = theme
        self.notifications_enabled = notifications_enabled
        self.language = language
