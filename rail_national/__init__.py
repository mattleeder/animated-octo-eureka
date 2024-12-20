import os

from flask import Flask

def create_app(test_config = None):
    app = Flask(__name__, instance_relative_config = True)
    # Create and configure the app
    app.config.from_mapping(
        SECRET_KEY = "dev",
        DATABASE = os.path.join(app.instance_path, "rail_national.sqlite")
    )

    if test_config is None:
        # Load the instance config, if it exists, when not testing
        app.config.from_pyfile("config.py", silent = True)
    else:
        # Load the test config
        app.config.from_mapping(test_config)

    # Ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    @app.route("/hello")
    def hello():
        return "Hello, World!"
    
    from . import db
    db.init_app(app)

    from . import auth
    app.register_blueprint(auth.bp)

    from . import schedule
    app.register_blueprint(schedule.bp)
    app.add_url_rule("/", endpoint = "index")

    from . import stops
    app.register_blueprint(stops.bp)

    from . import find_a_journey
    app.register_blueprint(find_a_journey.bp)
    
    return app