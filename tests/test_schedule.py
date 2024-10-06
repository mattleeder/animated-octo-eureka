import pytest
from rail_national.db import get_db
from rail_national import queries


def test_index(client, auth):
    response = client.get("/")
    assert b"Log In" in response.data
    assert b"Register" in response.data

    auth.login()
    response = client.get("/")
    assert b"Log Out" in response.data
    assert b"LST" in response.data
    assert b"COL" in response.data
    assert b"SRA" in response.data
    assert b"2024-09-22 14:00" in response.data
    assert b"2024-09-22 14:10" in response.data


@pytest.mark.parametrize("path", (
    "/add_route",
    "/1/update_route",
    "/1/delete",
))
def test_login_required(client, path):
    response = client.post(path)
    assert response.headers["Location"] == "/auth/login"

@pytest.mark.parametrize("path", (
    "/2/update_route",
    "/2/delete",
))
def test_exists_required(client, auth, path):
    auth.login()
    # Redirect
    assert client.post(path).status_code == 302

def test_add_route(client, auth, app):
    auth.login()
    assert client.get("/add_route").status_code == 200
    client.post("/add_route", data = {
        "route_id": 7357, 
        "origin_stn": "BHM", 
        "destn_stn": "EUS", 
        "stop_stn": "WFJ", 
        "origin_dep_time": "2024-09-22T15:00",
        "destn_arr_time": "2024-09-22T15:30",
        "stop_time": "2024-09-22T15:15",
        "cancelled": 0,
    })
    
    with app.app_context():
        count = queries.count_routes()
        assert count == 3

def test_add_bad_route_id(client, auth, app):
    auth.login()
    assert client.get("/add_route").status_code == 200
    response = client.post("/add_route", data = {
        "route_id": "test", 
        "origin_stn": "BHM", 
        "destn_stn": "EUS", 
        "stop_stn": "WFJ", 
        "origin_dep_time": "2024-09-22T15:00",
        "destn_arr_time": "2024-09-22T15:30",
        "stop_time": "2024-09-22T15:15",
        "cancelled": 0,
    })

    print(response.data)

    assert b"&#39;test&#39; is non-numeric." in response.data

def test_add_duplicate_route_id(client, auth, app):
    auth.login()
    assert client.get("/add_route").status_code == 200
    response = client.post("/add_route", data = {
        "route_id": 1, 
        "origin_stn": "BHM", 
        "destn_stn": "EUS", 
        "stop_stn": "WFJ", 
        "origin_dep_time": "2024-09-22T15:00",
        "destn_arr_time": "2024-09-22T15:30",
        "stop_time": "2024-09-22T15:15",
        "cancelled": 0,
    })

    # &#39; is for single quotes ''
    assert b"Route ID &#39;1&#39; already exists." in response.data

def test_add_route_origin_departure_time_after_destination_arrival_time(client, auth, app):
    auth.login()
    assert client.get("/add_route").status_code == 200
    response = client.post("/add_route", data = {
        "route_id": 10, 
        "origin_stn": "BHM", 
        "destn_stn": "EUS", 
        "stop_stn": "WFJ", 
        "origin_dep_time": "2024-09-22T15:30",
        "destn_arr_time": "2024-09-22T15:00",
        "stop_time": "2024-09-22T15:15",
        "cancelled": 0,
    })

    assert b"Origin Departure time cannot be later than Destination Arrival time." in response.data

def test_add_route_origin_departure_time_after_stop_time(client, auth, app):
    auth.login()
    assert client.get("/add_route").status_code == 200
    response = client.post("/add_route", data = {
        "route_id": 10, 
        "origin_stn": "BHM", 
        "destn_stn": "EUS", 
        "stop_stn": "WFJ", 
        "origin_dep_time": "2024-09-22T15:00",
        "destn_arr_time": "2024-09-22T15:30",
        "stop_time": "2024-09-22T14:15",
        "cancelled": 0,
    })
    
    assert b"Origin Departure time cannot be later than Stop time." in response.data

def test_update(client, auth, app):
    auth.login()
    assert client.get("/2/update_route").status_code == 200

    with app.app_context():
        route = queries.get_route(2)
        assert route["cancelled"] == 0
    
    response = client.post("/2/update_route", data = {
        "cancelled": "1",
    })
    # Redirect
    assert response.status_code == 302
    assert response.headers["Location"] == "/"

    with app.app_context():
        for key in ["route_id", "origin_stn", "destn_stn", "stop_stn", "origin_dep_time", "destn_arr_time", "stop_time", "cancelled"]:
            print(f"{key}: {route[key]}")
        route = queries.get_route(2)
        for key in ["route_id", "origin_stn", "destn_stn", "stop_stn", "origin_dep_time", "destn_arr_time", "stop_time", "cancelled"]:
            print(f"{key}: {route[key]}")
        assert route["cancelled"] == 1
        assert route["destn_stn"] == "SRA"


# @pytest.mark.parametrize("path", (
#     "/create",
#     "/1/update",
# ))
# def test_create_update_validate(client, auth, path):
#     auth.login()
#     response = client.post(path, data = {

#     })
#     assert

def test_delete(client, auth, app):
    auth.login()
    response = client.post("/1/delete")
    assert response.headers["Location"] == "/"

    with app.app_context():
        route = queries.get_route(1)
        assert route is None