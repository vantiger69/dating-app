from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from models import db, User
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
import os
from sqlalchemy.exc import SQLAlchemyError
from io import BytesIO
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta

# Load environment variables from .env
load_dotenv()

# Initialize the Flask app
app = Flask(__name__)

@app.route('/')
def router():
    return jsonify({"message":"Welcome to the backend"})

# Load configuration from config.py
app.config.from_object('config.Config')

# Enable CORS for the app
CORS(app)

# Initialize the Flask-Migrate extension
migrate = Migrate(app, db)

# Configure SQLite database URI
##app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
##app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Load the secret key for the app
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
if not app.config['SECRET_KEY']:
    raise ValueError("SECRET_KEY is not set in the environment variables")
else:
    print("SECRET_KEY loaded successfully.")

# JWT secret key
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default_secret_key')
print("JWT_SECRET_KEY:", app.config['JWT_SECRET_KEY'])

app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=30)
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


# Fetch all users
@app.route('/api/users', methods=['GET'])
def get_users():
    try:
        users = User.query.all()
        users_data = []
        for user in users:
            user_data = {
                'id': user.id,
                'name': user.name,
                'age': user.age,
                'bio': user.bio
            }
            users_data.append(user_data)
        return jsonify(users_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Fetch a specific user by ID
@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        user_data = {
            'id': user.id,
            'name': user.name,
            'age': user.age,
            'bio': user.bio
        }
        return jsonify(user_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500





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
    

@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.get_json()
    # Logic to update the user in the database using `user_id`
    # For example, update the user in a database and return a response
    updated_user = {
        'id': user_id,
        'name': data.get('name'),
        'age': data.get('age'),
        'bio': data.get('bio')
    }
    return jsonify(updated_user), 200




if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
