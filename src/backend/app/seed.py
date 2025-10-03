from __future__ import annotations

from datetime import datetime, timedelta

from .models import db, User, Event, Booking


def seed_database() -> None:
    db.create_all()

    # Avoid duplicate seeding
    if User.query.first() is not None:
        return

    # Users
    alice = User(email="alice@example.com", name="Alice")
    bob = User(email="bob@example.com", name="Bob")
    db.session.add_all([alice, bob])

    # Events
    now = datetime.utcnow()
    concert = Event(
        title="Campus Concert",
        description="Live music on the quad",
        venue="Main Quad",
        starts_at=now + timedelta(days=7),
        ends_at=now + timedelta(days=7, hours=2),
        capacity=100,
    )
    lecture = Event(
        title="Guest Lecture",
        description="Tech talk in auditorium",
        venue="Auditorium A",
        starts_at=now + timedelta(days=3),
        ends_at=now + timedelta(days=3, hours=1, minutes=30),
        capacity=200,
    )
    db.session.add_all([concert, lecture])
    db.session.flush()

    # Bookings
    b1 = Booking(user=alice, event=concert, quantity=2)
    b2 = Booking(user=bob, event=concert, quantity=3)
    b3 = Booking(user=alice, event=lecture, quantity=1)
    db.session.add_all([b1, b2, b3])

    db.session.commit()

