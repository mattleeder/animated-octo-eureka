from faker import Faker
from . import queries
from datetime import datetime

import os
import tempfile

from rail_national import create_app
from rail_national.db import get_db, init_db

train_lines = [
    ["AAA", "AAB", "AAC", "AAD", "AAE"],
    ["BAA", "BAB", "BAC", "BAD", "BAE", "BAF"],
    ["CAA", "CAB", "CAC", "CAD", "CAE", "CAF", "CAG"],
]

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
        