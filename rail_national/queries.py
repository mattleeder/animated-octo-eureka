from .db import get_db
from sqlite3 import IntegrityError

def get_route(route_id):
    route = get_db().execute("""
        SELECT *
          FROM schedule
         WHERE route_id = ?""",
         (route_id,)
    ).fetchone()
    return route

def count_routes():
    db = get_db()
    count = db.execute("SELECT COUNT(route_id) FROM schedule").fetchone()[0]
    return count

def get_schedule():
    db = get_db()
    schedule = db.execute(
        """
        SELECT route_id,
               origin_stn,
               destn_stn,
               stop_stn,
               strftime('%Y-%m-%d %H:%M', DATETIME(origin_dep_time, 'unixepoch')) as origin_dep_time,
               strftime('%Y-%m-%d %H:%M', DATETIME(destn_arr_time, 'unixepoch')) as destn_arr_time,
               strftime('%Y-%m-%d %H:%M', DATETIME(stop_time, 'unixepoch')) as stop_time,
               CASE cancelled
                    WHEN 1 THEN 'YES'
                    WHEN 0 THEN 'NO'
                END as cancelled
        FROM schedule
        ORDER BY origin_dep_time DESC
        """
    ).fetchall()
    return schedule

def insert_route(route_id, origin_stn, destn_stn, stop_stn, origin_dep_time, destn_arr_time, stop_time, cancelled):
    try:
        db = get_db()
        db.execute("""
            INSERT INTO schedule (route_id, origin_stn, destn_stn, stop_stn, origin_dep_time, destn_arr_time, stop_time, cancelled)
            VALUES (?, ?, ?, ?, unixepoch(?), unixepoch(?), unixepoch(?), ?)""",
            (route_id, origin_stn, destn_stn, stop_stn, origin_dep_time, destn_arr_time, stop_time, cancelled,)
            )
        db.commit()
        return True, ""
    except IntegrityError as e:
        match e.sqlite_errorcode:
            case 1555:
                return False, f"Route ID '{route_id}' already exists."
            case _:
                return False, f"Operation Failed."

def update_route(origin_stn, destn_stn, stop_stn, origin_dep_time, destn_arr_time, stop_time, cancelled, route_id):
    db = get_db()
    db.execute("""
        UPDATE schedule SET origin_stn = ?, destn_stn = ?, stop_stn = ?, origin_dep_time = unixepoch(?), destn_arr_time = unixepoch(?), stop_time = unixepoch(?), cancelled = ?
         WHERE route_id = ?""",
            (origin_stn, destn_stn, stop_stn, origin_dep_time, destn_arr_time, stop_time, cancelled, route_id),
        )
    db.commit()
    return True, ""

def delete_route(route_id):
    db = get_db()
    db.execute("DELETE FROM schedule WHERE route_id = ?", (route_id,))
    db.commit()