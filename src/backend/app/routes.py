from flask import Blueprint, jsonify, request, current_app
from .models import db, User, Event, Booking
from datetime import datetime

bp = Blueprint("main", __name__)

# ===== HEALTH ROUTES =====

@bp.get("/health")
def health() -> tuple[dict, int]:
    return jsonify({"status": "ok"}), 200


@bp.get("/health/db")
def health_db() -> tuple[dict, int]:
    try:
        # Simple connectivity check and table counts
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
    except Exception as exc:  # pragma: no cover
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
        
        # Check if event exists and has capacity
        event = Event.query.get(data['event_id'])
        if not event:
            return jsonify({"error": "Event not found"}), 404
            
        # TODO: Add capacity check logic
        
        booking = Booking(
            user_id=data['user_id'],  # For now, hardcode user_id until auth is implemented
            event_id=data['event_id'],
            quantity=data['quantity']
        )
        
        db.session.add(booking)
        db.session.commit()
        
        return jsonify({"success": True, "booking_id": booking.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@bp.get("/api/users/<int:user_id>/bookings")
def get_user_bookings(user_id):
    """Get all bookings for a user"""
    try:
        bookings = Booking.query.filter_by(user_id=user_id).all()
        return jsonify([{
            'id': booking.id,
            'event_id': booking.event_id,
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
        db.session.delete(booking)
        db.session.commit()
        
        return jsonify({"success": True, "message": "Booking cancelled"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ===== AUTHENTICATION ROUTES (Basic) =====

@bp.post("/api/register")
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"error": "User already exists"}), 400
            
        user = User(
            email=data['email'],
            name=data['name']
        )
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({"success": True, "user_id": user.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@bp.post("/api/login")
def login():
    """Login user (simplified - no password for now)"""
    try:
        data = request.get_json()
        user = User.query.filter_by(email=data['email']).first()
        
        if user:
            return jsonify({
                "success": True, 
                "user_id": user.id,
                "name": user.name,
                "email": user.email
            })
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500