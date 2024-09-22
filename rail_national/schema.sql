DROP TABLE IF EXISTS live;
DROP TABLE IF EXISTS schedule;
DROP TABLE IF EXISTS user;

CREATE TABLE user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
)

CREATE TABLE schedule (
    route_id INTEGER PRIMARY KEY AUTOINCREMENT,
    origin_stn TEXT NOT NULL,
    destn_stn TEXT NOT NULL,
    stop_stn TEXT NOT NULL,
    origin_dep_time TIMESTAMP NOT NULL,
    destn_arr_time TIMESTAMP NOT NULL,
    stop_time TIMESTAMP NOT NULL,
    cancelled BOOLEAN NOT NULL,
);

CREATE TABLE live (
    route_id INTEGER PRIMARY KEY AUTOINCREMENT,
    origin_stn TEXT NOT NULL,
    destn_stn TEXT NOT NULL,
    stop_stn TEXT NOT NULL,
    origin_dep_time TIMESTAMP NOT NULL,
    destn_arr_time TIMESTAMP NOT NULL,
    stop_time TIMESTAMP NOT NULL,
    cancelled BOOLEAN NOT NULL,
);