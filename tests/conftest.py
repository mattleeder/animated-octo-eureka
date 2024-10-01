import os
import tempfile

import pytest

from rail_national import create_app
from rail_national.db import get_db, init_db

# conftest.py
import sys
import pytest

def is_debugging():
    return 'debugpy' in sys.modules
    
    
# enable_stop_on_exceptions if the debugger is running during a test
if is_debugging():
    @pytest.hookimpl(tryfirst=True)
    def pytest_exception_interact(call):
        raise call.excinfo.value
    
    @pytest.hookimpl(tryfirst=True)
    def pytest_internalerror(excinfo):
        raise excinfo.value

with open(os.path.join(os.path.dirname(__file__), "data.sql"), "rb") as f:
    _data_sql = f.read().decode("utf8")


@pytest.fixture
def app():
    db_fd, db_path = tempfile.mkstemp()

    app = create_app({
        "TESTING": True,
        "DATABASE": db_path,
    })

    with app.app_context():
        init_db()
        get_db().executescript(_data_sql)

    yield app

    os.close(db_fd)
    os.unlink(db_path)


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def runner(app):
    return app.test_cli_runner()


class AuthActions(object):
    def __init__(self, client):
        self._client = client

    def login(self, username = "test", password = "test"):
        return self._client.post(
            "/auth/login",
            data = {"username": username, "password": password}
        )
    
    def logout(self):
        return self._client.get("/auth/logout")
    

@pytest.fixture
def auth(client):
    return AuthActions(client)