from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from models import db, User
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
import os
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.utils import secure_filename
from io import BytesIO
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta

# Load environment variables from .env
load_dotenv()

# Initialize the Flask app
app = Flask(__name__)

# Load configuration from config.py
app.config.from_object('config.Config')

# Enable CORS for the app
CORS(app)

# Initialize the Flask-Migrate extension
migrate = Migrate(app, db)

# Configure SQLite database URI
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////home/van/Documents/my-app/backend/database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Load the secret key for the app
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
if not app.config['SECRET_KEY']:
    raise ValueError("SECRET_KEY is not set in the environment variables")
else:
    print("SECRET_KEY loaded successfully.")

# JWT secret key
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default_secret_key')
print("JWT_SECRET_KEY:", app.config['JWT_SECRET_KEY'])

app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(seconds=30)
jwt = JWTManager(app)

# Initialize extensions
db.init_app(app)
bcrypt = Bcrypt(app)

# Create the database tables
if app.config['ENV'] == 'development':
    with app.app_context():
        try:
            db.create_all()
            print("Database tables created successfully.")
        except SQLAlchemyError as e:
            print("Error creating database tables:", e)

# Directory to store profile images
UPLOAD_FOLDER = './uploads/profile_images'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Allowable extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Endpoint to get users (example)
users = [
    {"id": 1, "name": "Alice", "age": 25, "bio": "Loves music."},
    {"id": 2, "name": "Bob", "age": 30, "bio": "Avid traveler."},
    {"id": 3, "name": "Charlie", "age": 22, "bio": "Food enthusiast."}
]
@app.route('/api/users', methods=['GET'])
def get_users():
    return jsonify(users)

# Signup Route
@app.route('/api/signup', methods=['POST'])
def sign_up():
    data = request.get_json()

    required_fields = ['name', 'email', 'age', 'bio', 'password']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({'error': f'Missing fields: {", ".join(missing_fields)}'}), 400

    try:
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error': 'Email is already taken'}), 400
        
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')

        new_user = User(
            name=data['name'],
            email=data['email'],
            age=data['age'],
            bio=data['bio'],
            password=hashed_password
        )

        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            'message': 'Signup successful',
            'user': {
                'id': new_user.id,
                'name': new_user.name,
                'email': new_user.email
            }
        }), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error', 'details': str(e)}), 500

# Login Route
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not all(field in data for field in ['email', 'password']):
        return jsonify({'error': 'Please fill in all fields'}), 400

    try:
        user = User.query.filter_by(email=data['email']).first()
        if user and bcrypt.check_password_hash(user.password, data['password']):
            access_token = create_access_token(identity={'id': user.id, 'email': user.email})
            return jsonify({
                'message': 'Login successful',
                'access_token': access_token,
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'email': user.email
                }
            }), 200
        
        return jsonify({'error': 'Invalid email or password'}), 401

    except SQLAlchemyError as e:
        return jsonify({'error': 'Database error', 'details': str(e)}), 500

# Endpoint to update user profile with profile image
@app.route('/api/users/<int:user_id>/upload_photo', methods=['POST'])
def upload_profile_photo(user_id):
    if 'photo' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['photo']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        user.photo = filename
        db.session.commit()

        return jsonify({'message': 'Profile photo uploaded successfully', 'photo_url': f'/api/users/{user_id}/photo'}), 200

    return jsonify({'error': 'Invalid file type'}), 400

# Endpoint to retrieve profile image
@app.route('/api/users/<int:user_id>/photo', methods=['GET'])
def get_profile_photo(user_id):
    user = User.query.get(user_id)
    if not user or not user.photo:
        return jsonify({'error': 'No photo available for this user'}), 404

    return send_file(os.path.join(app.config['UPLOAD_FOLDER'], user.photo))

# Endpoint to delete profile image
@app.route('/api/users/<int:user_id>/delete_photo', methods=['DELETE'])
def delete_profile_photo(user_id):
    user = User.query.get(user_id)
    if not user or not user.photo:
        return jsonify({'error': 'No photo to delete'}), 404

    try:
        os.remove(os.path.join(app.config['UPLOAD_FOLDER'], user.photo))
        user.photo = None
        db.session.commit()
        return jsonify({'message': 'Profile photo deleted successfully'}), 200
    except OSError as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
