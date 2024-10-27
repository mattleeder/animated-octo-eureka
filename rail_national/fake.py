from faker import Faker
from . import queries
from datetime import datetime, timedelta


import os
import random
import tempfile

from rail_national import create_app
from rail_national.db import get_db, init_db

train_lines = [
    ["AAA", "ABA", "ABB", "ABC", "BBB"],
    ["AAA", "ADA", "ADB", "ADC", "DDD"],
    ["AAA", "ACA", "ACB", "ACC", "CCC"],

    ["BBB", "ABC", "ABB", "ABA", "AAA"],
    ["BBB", "BCA", "BCB", "BCC", "CCC"],
    ["BBB", "BDA", "BDB", "BDC", "DDD"],
    ["BBB", "BEA", "BEB", "BEC", "EEE"],

    ["CCC", "ACA", "ACB", "ACC", "AAA"],
    ["CCC", "BCA", "BCB", "BCC", "BBB"],
    ["CCC", "CEA", "CEB", "CEC", "EEE"],

    ["DDD", "ADA", "ADB", "ADC", "AAA"],
    ["DDD", "BDA", "BDB", "BDC", "BBB"],
    ["DDD", "DEA", "DEB", "DEC", "EEE"],

    ["EEE", "BEA", "BEB", "BEC", "BBB"],
    ["EEE", "CEA", "CEB", "CEC", "CCC"],
    ["EEE", "DEA", "DEB", "DEC", "DDD"],
]

route_time_between_stops_in_minutes = {
    "slow" : 45,
    "medium" : 30,
    "fast" : 15,
} 

def schedule(count = 1000):
#     CREATE TABLE schedule (
#     route_id INTEGER PRIMARY KEY,
#     origin_stn TEXT NOT NULL,
#     destn_stn TEXT NOT NULL,
#     stop_stn TEXT NOT NULL,
#     origin_dep_time INTEGER NOT NULL,
#     destn_arr_time INTEGER NOT NULL,
#     stop_time INTEGER NOT NULL,
#     cancelled BOOLEAN NOT NULL
# );
    app = create_app()

    fake = Faker()
    i = 0
    while i < count:

        line_number = fake.random_int(min = 0, max = len(train_lines) - 1)
        train_line = train_lines[line_number]
        station_selector = Faker()
        origin_station_idx = station_selector.unique.random_int(min = 0, max = len(train_line) - 1)
        destination_station_idx = station_selector.unique.random_int(min = 0, max = len(train_line) - 1)
        stop_station_idx = station_selector.random_int(min = min(origin_station_idx, destination_station_idx), max = max(origin_station_idx, destination_station_idx))

        route_id = fake.unique.random_int(min = 10, max = 10_000)
        origin_stn = train_line[origin_station_idx]
        destn_stn = train_line[destination_station_idx]
        stop_stn = train_line[stop_station_idx]
        
        origin_dep_time = fake.date_time_between(datetime(2024, 9, 1, 0, 0))
        stop_time = fake.date_time_between(origin_dep_time)
        destn_arr_time = fake.date_time_between(stop_time)
        cancelled = 0

        with app.app_context():
            queries.insert_route(route_id, origin_stn, destn_stn, stop_stn, origin_dep_time, destn_arr_time, stop_time, cancelled)

        i += 1

def stops(count = 1000):
# CREATE TABLE stops (
#     stop_id INTEGER PRIMARY KEY AUTOINCREMENT,
#     route_id TEXT,
#     stop_stn TEXT,
#     scheduled_arrival_time INTEGER,
#     scheduled_departure_time INTEGER
# );

# Fake data generation:
#   - Generate a new route_id
#   - Pick a train line
#   - Pick a random number of stops
#   - Pick a speed for the route
#   - The speeds are set so that we can manually create fastest routes to check
#   - Each stop lasts 1 minute
    app = create_app()

    fake = Faker()
    i = 0
    while i < count:

        route_id = fake.unique.random_int(min = 0)
        train_line = random.choice(train_lines)
        route = []
        for station in train_line:
            if random.randint(0, 1):
                route.append(station)
        
        # Must have at least 2 stations
        if len(route) < 2:
            continue

        # Routes must start and finish between 00:00 1st and 23:59 31st October 2024
        # A route can have max 4 slow stops which is 4 hours
        time_of_stop = fake.date_time_between(datetime(2024, 10, 1, 0, 0), datetime(2024, 10, 31, 19, 59))
        one_minute = timedelta(minutes = 1)
        route_speed = route_time_between_stops_in_minutes[random.choice(["slow", "medium", "fast"])]
        time_between_stops = timedelta(minutes = route_speed)

        with app.app_context():
            for station in route:
                queries.insert_stop(route_id, station, time_of_stop, time_of_stop + one_minute)
                time_of_stop = time_of_stop + one_minute + time_between_stops

        i += len(route)