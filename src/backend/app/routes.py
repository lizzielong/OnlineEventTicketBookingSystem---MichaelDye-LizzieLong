from flask import Blueprint, jsonify, request, current_app, render_template, send_from_directory, session
import os
from .models import db, User, Event, Booking
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

bp = Blueprint("main", __name__)

# Get the absolute path to your frontend folder
FRONTEND_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'frontend')

# ===== AUTHENTICATION HELPER FUNCTIONS =====

def login_required(f):
    """Decorator to require login for routes"""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"error": "Login required"}), 401
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    """Decorator to require admin privileges"""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session or session.get('user_type') != 'admin':
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated_function

# ===== FRONTEND ROUTES =====

@bp.get("/")
def serve_index():
    """Serve the main landing page"""
    return send_from_directory(FRONTEND_PATH, 'login.html')

@bp.get("/<path:page>")
def serve_frontend_pages(page):
    """Serve all other HTML pages"""
    # If the request is for an HTML page, serve it
    if page.endswith('.html') or '.' not in page:
        # Handle both "login" and "login.html" requests
        if '.' not in page:
            page += '.html'
        
        # Check if the file exists
        file_path = os.path.join(FRONTEND_PATH, page)
        if os.path.exists(file_path):
            return send_from_directory(FRONTEND_PATH, page)
        else:
            # If the HTML file doesn't exist, fall back to index.html
            # This allows for client-side routing if you add it later
            return send_from_directory(FRONTEND_PATH, 'index.html')
    
    # For all other files (CSS, JS, images), serve them directly
    return send_from_directory(FRONTEND_PATH, page)

# ===== STATIC ASSETS =====

@bp.get("/js/<path:filename>")
def serve_js(filename):
    """Serve JavaScript files"""
    return send_from_directory(os.path.join(FRONTEND_PATH, 'js'), filename)

@bp.get("/style/<path:filename>")
def serve_css(filename):
    """Serve CSS files"""
    return send_from_directory(os.path.join(FRONTEND_PATH, 'style'), filename)

@bp.get("/images/<path:filename>")
def serve_images(filename):
    """Serve image files"""
    return send_from_directory(os.path.join(FRONTEND_PATH, 'images'), filename)

# ===== HEALTH ROUTES =====

@bp.get("/health")
def health() -> tuple[dict, int]:
    return jsonify({"status": "ok"}), 200

@bp.get("/health/db")
def health_db() -> tuple[dict, int]:
    try:
        user_count = db.session.query(User).count()
        event_count = db.session.query(Event).count()
        booking_count = db.session.query(Booking).count()
        return (
            jsonify(
                {
                    "status": "ok",
                    "database": "connected",
                    "engine": getattr(db.engine, "name", None),
                    "uri": current_app.config.get("SQLALCHEMY_DATABASE_URI"),
                    "tables": {
                        "users": user_count,
                        "events": event_count,
                        "bookings": booking_count,
                    },
                }
            ),
            200,
        )
    except Exception as exc:
        return (
            jsonify({"status": "error", "database": "unavailable", "detail": str(exc)}),
            500,
        )

# ===== EVENT ROUTES =====

@bp.get("/api/events")
def get_events():
    """Get all events"""
    try:
        events = Event.query.all()
        return jsonify([{
            'id': event.id,
            'title': event.title,
            'description': event.description,
            'venue': event.venue,
            'starts_at': event.starts_at.isoformat(),
            'ends_at': event.ends_at.isoformat(),
            'capacity': event.capacity,
            'created_at': event.created_at.isoformat()
        } for event in events])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.get("/api/events/<int:event_id>")
def get_event(event_id):
    """Get one event by ID"""
    try:
        event = Event.query.get_or_404(event_id)
        return jsonify({
            'id': event.id,
            'title': event.title,
            'description': event.description,
            'venue': event.venue,
            'starts_at': event.starts_at.isoformat(),
            'ends_at': event.ends_at.isoformat(),
            'capacity': event.capacity,
            'created_at': event.created_at.isoformat()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.post("/api/events")
@admin_required
def create_event():
    """Create a new event (Admin only)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'venue', 'starts_at', 'ends_at', 'capacity']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        event = Event(
            title=data['title'],
            description=data.get('description', ''),
            venue=data['venue'],
            starts_at=datetime.fromisoformat(data['starts_at']),
            ends_at=datetime.fromisoformat(data['ends_at']),
            capacity=data['capacity']
        )
        
        db.session.add(event)
        db.session.commit()
        
        return jsonify({"success": True, "event_id": event.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ===== BOOKING ROUTES =====

@bp.post("/api/bookings")
@login_required  # Add this decorator
def create_booking():
    """Make a booking - now uses session user_id"""
    try:
        data = request.get_json()
        
        # Validate required fields (no longer need user_id from frontend)
        required_fields = ['event_id', 'quantity']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Check if event exists
        event = Event.query.get(data['event_id'])
        if not event:
            return jsonify({"error": "Event not found"}), 404
        
        # Use user_id from session instead of request
        user_id = session['user_id']
        
        # Check capacity
        total_booked = db.session.query(db.func.sum(Booking.quantity)).filter(
            Booking.event_id == data['event_id']
        ).scalar() or 0
        
        available_capacity = event.capacity - total_booked
        if data['quantity'] > available_capacity:
            return jsonify({
                "error": f"Not enough seats available. Only {available_capacity} left."
            }), 400
        
        # Check if event hasn't passed
        if event.starts_at < datetime.utcnow():
            return jsonify({"error": "Cannot book for past events"}), 400
        
        booking = Booking(
            user_id=user_id,  # From session
            event_id=data['event_id'],
            quantity=data['quantity']
        )
        
        db.session.add(booking)
        db.session.commit()
        
        return jsonify({
            "success": True, 
            "booking_id": booking.id,
            "message": f"Successfully booked {data['quantity']} ticket(s)"
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@bp.get("/api/my-bookings")  # Changed from /api/users/<id>/bookings
@login_required
def get_my_bookings():
    """Get all bookings for the current user"""
    try:
        user_id = session['user_id']
        bookings = Booking.query.filter_by(user_id=user_id).all()
        return jsonify([{
            'id': booking.id,
            'event_id': booking.event_id,
            'event_title': booking.event.title,
            'quantity': booking.quantity,
            'created_at': booking.created_at.isoformat()
        } for booking in bookings])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.delete("/api/bookings/<int:booking_id>")
def cancel_booking(booking_id):
    """Cancel a booking"""
    try:
        booking = Booking.query.get_or_404(booking_id)
        
        # Check if event hasn't started
        if booking.event.starts_at < datetime.utcnow():
            return jsonify({"error": "Cannot cancel booking for past events"}), 400
        
        db.session.delete(booking)
        db.session.commit()
        
        return jsonify({"success": True, "message": "Booking cancelled"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ===== AUTHENTICATION ROUTES =====

@bp.post("/api/register")
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'password']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"error": "User already exists"}), 400
            
        # Hash the password
        hashed_password = generate_password_hash(data['password'])
        
        user = User(
            email=data['email'],
            name=data['name'],
            password_hash=hashed_password,
            user_type='user'  # Default to regular user
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Automatically log in the user after registration
        session['user_id'] = user.id
        session['user_email'] = user.email
        session['user_name'] = user.name
        session['user_type'] = user.user_type
        
        return jsonify({
            "success": True, 
            "user_id": user.id,
            "name": user.name,
            "email": user.email,
            "user_type": user.user_type,
            "message": "User registered successfully"
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@bp.post("/api/login")
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'email' not in data or 'password' not in data:
            return jsonify({"error": "Email and password are required"}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if user and check_password_hash(user.password_hash, data['password']):
            # Set session variables
            session['user_id'] = user.id
            session['user_email'] = user.email
            session['user_name'] = user.name
            session['user_type'] = user.user_type
            
            return jsonify({
                "success": True, 
                "user_id": user.id,
                "name": user.name,
                "email": user.email,
                "user_type": user.user_type
            })
        else:
            return jsonify({"error": "Invalid email or password"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.post("/api/logout")
def logout():
    """Logout user"""
    session.clear()
    return jsonify({"success": True, "message": "Logged out successfully"})

@bp.get("/api/current_user")
def get_current_user():
    """Get current logged in user info"""
    if 'user_id' in session:
        return jsonify({
            "logged_in": True,
            "user_id": session['user_id'],
            "name": session['user_name'],
            "email": session['user_email'],
            "user_type": session['user_type']
        })
    else:
        return jsonify({"logged_in": False})

# ===== ADMIN ROUTES =====

@bp.put("/api/events/<int:event_id>")
@admin_required
def update_event(event_id):
    """Update an event (Admin only)"""
    try:
        # TODO: Add admin authorization check
        
        event = Event.query.get_or_404(event_id)
        data = request.get_json()
        
        if 'title' in data:
            event.title = data['title']
        if 'description' in data:
            event.description = data['description']
        if 'venue' in data:
            event.venue = data['venue']
        if 'starts_at' in data:
            event.starts_at = datetime.fromisoformat(data['starts_at'])
        if 'ends_at' in data:
            event.ends_at = datetime.fromisoformat(data['ends_at'])
        if 'capacity' in data:
            event.capacity = data['capacity']
        
        db.session.commit()
        
        return jsonify({"success": True, "message": "Event updated"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@bp.delete("/api/events/<int:event_id>")
@admin_required
def delete_event(event_id):
    """Delete an event (Admin only)"""
    try:
        # TODO: Add admin authorization check
        
        event = Event.query.get_or_404(event_id)
        
        # Check if there are existing bookings
        if event.bookings:
            return jsonify({
                "error": "Cannot delete event with existing bookings"
            }), 400
        
        db.session.delete(event)
        db.session.commit()
        
        return jsonify({"success": True, "message": "Event deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500