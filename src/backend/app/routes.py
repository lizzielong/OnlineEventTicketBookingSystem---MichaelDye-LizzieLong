from flask import Blueprint, jsonify, request, current_app
from .models import db, User, Event, Booking
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

bp = Blueprint("main", __name__)

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
def create_event():
    """Create a new event (Admin only)"""
    try:
        data = request.get_json()
        
        # TODO: Add admin authorization check
        
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
def create_booking():
    """Make a booking"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['user_id', 'event_id', 'quantity']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Check if event exists
        event = Event.query.get(data['event_id'])
        if not event:
            return jsonify({"error": "Event not found"}), 404
        
        # Check if user exists
        user = User.query.get(data['user_id'])
        if not user:
            return jsonify({"error": "User not found"}), 404
            
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
            user_id=data['user_id'],
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

@bp.get("/api/users/<int:user_id>/bookings")
def get_user_bookings(user_id):
    """Get all bookings for a user"""
    try:
        # Check if user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
            
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
            password_hash=hashed_password
        )
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            "success": True, 
            "user_id": user.id,
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
            return jsonify({
                "success": True, 
                "user_id": user.id,
                "name": user.name,
                "email": user.email
            })
        else:
            return jsonify({"error": "Invalid email or password"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ===== ADMIN ROUTES =====

@bp.put("/api/events/<int:event_id>")
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