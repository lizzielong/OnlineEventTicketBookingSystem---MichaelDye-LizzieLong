from flask import Blueprint, jsonify, current_app
from .models import db, User, Event, Booking


bp = Blueprint("main", __name__)


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


