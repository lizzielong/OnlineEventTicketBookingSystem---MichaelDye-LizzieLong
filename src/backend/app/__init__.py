from flask import Flask
from flask_cors import CORS
from .models import db
from .config import Config
from flask import current_app
import click
import os
from .seed import seed_database


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config['SECRET_KEY'] = os.urandom(24)
    app.config['SESSION_TYPE'] = 'filesystem'

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints
    from .routes import bp as routes_bp
    app.register_blueprint(routes_bp)

    # Init database
    db.init_app(app)
    if Config.AUTO_CREATE_TABLES:
        with app.app_context():
            db.create_all()

    @app.cli.command("seed")
    def seed_cmd() -> None:
        """Create tables (if needed) and insert sample data."""
        with app.app_context():
            seed_database()
        click.echo("Seeded database with sample data.")

    @app.cli.command("clear-seed")
    def clear_seed_cmd() -> None:
        """Delete all rows from seeded tables (Bookings, Users, Events)."""
        from .models import Booking, User, Event

        with app.app_context():
            # Delete in order to satisfy foreign keys
            Booking.query.delete()
            User.query.delete()
            Event.query.delete()
            db.session.commit()
        click.echo("Cleared seeded data (bookings, users, events).")

    @app.cli.command("reset-db")
    def reset_db_cmd() -> None:
        """Drop all tables and recreate them (DANGEROUS)."""
        with app.app_context():
            db.drop_all()
            db.create_all()
        click.echo("Dropped and recreated all tables.")

    return app

