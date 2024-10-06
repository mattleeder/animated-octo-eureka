import pytest

from rail_national import utilities

def test_missing_route_id():
    data, errors = utilities.Validators.validate_route_id("")
    assert data == ""
    assert "Route ID Required." in errors

def test_negative_route_id():
    data, errors = utilities.Validators.validate_route_id("-10")
    assert data == "-10"
    assert "'-10' is non-numeric." in errors

def test_non_numeric_route_id():
    data, errors = utilities.Validators.validate_route_id("test")
    assert data == "test"
    assert "'test' is non-numeric." in errors

def test_missing_station():
    data, errors = utilities.Validators.validate_stn("")
    assert data == ""
    assert "Station Required." in errors

def test_wrong_station_length():
    data, errors = utilities.Validators.validate_stn("ABCD")
    assert data == "ABCD"
    assert "Length is 4 not 3." in errors

def test_station_not_alphabetic():
    data, errors = utilities.Validators.validate_stn("LS2")
    assert data == "LS2"
    assert "'LS2' contains non-alphabetic characters." in errors

def test_missing_time():
    data, errors = utilities.Validators.validate_time("", "%Y-%m-%dT%H:%M")
    assert data == ""
    assert "Time required." in errors

def test_wrong_time_format():
    data, errors = utilities.Validators.validate_time("2024-13-13T25:61", "%Y-%m-%dT%H:%M")
    assert data == "2024-13-13T25:61"
    assert "'2024-13-13T25:61' is not a valid time for the format '%Y-%m-%dT%H:%M'." in errors

def test_missing_cancelled():
    data, errors = utilities.Validators.validate_cancelled("")
    assert data == ""
    assert "Cancelled required." in errors

def test_invalid_cancellation_code():
    data, errors = utilities.Validators.validate_cancelled("2")
    assert data == "2"
    assert "'2' is not valid cancellation code." in errors