from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import re
from datetime import datetime

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://localhost:root@localhost/waitlist_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class WaitlistEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<WaitlistEntry {self.email}>'

with app.app_context():
    db.create_all()

def is_valid_email(email):
    """Basic email validation using regex"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@app.route('/api/waitlist', methods=['POST'])
def join_waitlist():
    data = request.get_json()
    
    if not data or 'name' not in data or 'email' not in data:
        return jsonify({'error': 'Name and email are required'}), 400
    
    name = data['name'].strip()
    email = data['email'].strip().lower()
    
    if not is_valid_email(email):
        return jsonify({'error': 'Invalid email format'}), 400
    if WaitlistEntry.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    try:
        entry = WaitlistEntry(
            name=name,
            email=email,
            ip_address=request.remote_addr,
            referral_source=request.headers.get('Referer')
        )
        db.session.add(entry)
        db.session.commit()
        return jsonify({
            'message': 'Successfully joined waitlist',
            'position': WaitlistEntry.query.count()  # Return waitlist position
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Server error. Please try again.'}), 500

@app.route('/api/waitlist/count', methods=['GET'])
def get_waitlist_count():
    try:
        count = WaitlistEntry.query.count()
        return jsonify({'count': count}), 200
    except Exception as e:
        return jsonify({'error': 'Server error'}), 500

if __name__ == '__main__':
    app.run(debug=True)