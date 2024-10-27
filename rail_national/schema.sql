DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS schedule;
DROP TABLE IF EXISTS live;
DROP TABLE IF EXISTS dummy_stops;

CREATE TABLE user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE schedule (
    route_id INTEGER PRIMARY KEY,
    origin_stn TEXT NOT NULL,
    destn_stn TEXT NOT NULL,
    stop_stn TEXT NOT NULL,
    origin_dep_time INTEGER NOT NULL,
    destn_arr_time INTEGER NOT NULL,
    stop_time INTEGER NOT NULL,
    cancelled BOOLEAN NOT NULL
);

CREATE TABLE live (
    route_id INTEGER PRIMARY KEY,
    origin_stn TEXT NOT NULL,
    destn_stn TEXT NOT NULL,
    stop_stn TEXT NOT NULL,
    origin_dep_time INTEGER NOT NULL,
    destn_arr_time INTEGER NOT NULL,
    stop_time INTEGER NOT NULL,
    cancelled BOOLEAN NOT NULL
);

CREATE TABLE stops (
    stop_id INTEGER PRIMARY KEY AUTOINCREMENT,
    route_id INTEGER NOT NULL,
    stop_stn TEXT NOT NULL,
    scheduled_arrival_time INTEGER, -- Can be null when stop is at originating station for route
    scheduled_departure_time INTEGER NOT NULL
);