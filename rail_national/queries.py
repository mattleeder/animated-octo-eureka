from .db import get_db
from sqlite3 import IntegrityError
from datetime import datetime, timedelta

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
            (origin_stn, destn_stn, stop_stn, origin_dep_time, destn_arr_time, stop_time, cancelled, route_id,)
        )
    db.commit()
    return True, ""

def delete_route(route_id):
    db = get_db()
    db.execute("DELETE FROM schedule WHERE route_id = ?", (route_id,))
    db.commit()

def get_column_types_from_table(table):
    """DO NOT CALL WITH USER SUBMITTED DATA"""
    db = get_db()
    rows = db.execute(
        f"""
        PRAGMA table_info({table})
        """
    ).fetchall()
    column_types = {row["name"] : row["type"] for row in rows}
    
    if "origin_dep_time" in column_types:
        column_types["origin_dep_time"] = "DATE"

    if "destn_arr_time" in column_types:
        column_types["destn_arr_time"] = "DATE"

    if "stop_time" in column_types:
        column_types["stop_time"] = "DATE"

    return column_types

# # # # # # # # # # # # # # # # # # # # # # # # # #
#                                                 #
# STOPS                                           #
#                                                 #
# # # # # # # # # # # # # # # # # # # # # # # # # #


def get_stops():
    db = get_db()
    stops = db.execute(
        """
        SELECT stop_id,
               route_id,
               stop_stn,
               strftime('%Y-%m-%d %H:%M', DATETIME(scheduled_arrival_time, 'unixepoch')) as scheduled_arrival_time,
               strftime('%Y-%m-%d %H:%M', DATETIME(scheduled_departure_time, 'unixepoch')) as scheduled_departure_time
          FROM stops
         ORDER BY scheduled_departure_time DESC;
        """
    ).fetchall()
    return stops

def insert_stop(route_id, stop_stn, scheduled_arrival_time, scheduled_departure_time):

    assert len(stop_stn) == 3

    try:
        db = get_db()
        # Stop ID will autoincrement
        db.execute("""
            INSERT INTO stops (route_id, stop_stn, scheduled_arrival_time, scheduled_departure_time)
            VALUES (?, ?, unixepoch(?), unixepoch(?))""",
            (route_id, stop_stn, scheduled_arrival_time, scheduled_departure_time)
            )
        db.commit()
        return True, ""
    except IntegrityError as e:
        match e.sqlite_errorcode:
            case 1555:
                return False, f"Stop ID already exists."
            case _:
                return False, f"Operation Failed."
            
# NOT READY FOR USE YET
def get_n_fastest_journeys(start_station, target_station, journey_start_time : datetime, number_of_journeys):
    #         if len(used_route_placeholders) > 0:
    #         query = f"""
    # WITH initial(start_stn, leave_time, current_route) as (

    #             VALUES {",".join(["(?,?,?,?)"] * (len(initial_placeholders) // 3))}

    #     ),
    #         used_routes(route_id) as (
            
    #             VALUES {",".join(["(?)"] * len(used_route_placeholders))}

    #         ),
            
    #         inter as (

    #             SELECT DISTINCT ds.route_id, i.start_stn, i.current_route
    #               FROM dummy_stops as ds
    #              INNER JOIN initial as i
    #                    ON i.start_stn = ds.stop_stn
    #                    AND i.leave_time < ds.scheduled_arrival_time

    #     ),

    #         reachable as (

    #             SELECT inter.start_stn, s.stop_stn, s.route_id, inter.current_route || ',' || s.stop_stn as current_route, s.scheduled_arrival_time, row_number() OVER (PARTITION BY s.stop_stn ORDER BY scheduled_arrival_time) as arrival_rank
    #               FROM dummy_stops as s
    #              INNER JOIN inter
    #                    ON inter.route_id = s.route_id
    #                     WHERE NOT EXISTS (SELECT route_id FROM used_routes WHERE inter.route_id = used_routes.route_id)

    #     )

    #     SELECT r.*
    #     FROM reachable as r
    #     WHERE r.arrival_rank = 1
    #         """
    #     else:
    #         query = f"""
    #     WITH initial(start_stn, leave_time, current_route) as (

    #             VALUES {",".join(["(?,?,?)"] * (len(initial_placeholders) // 3))}

    #     ),
    #         inter as (

    #             SELECT DISTINCT ds.route_id, i.start_stn, i.current_route
    #               FROM dummy_stops as ds
    #              INNER JOIN initial as i
    #                    ON i.start_stn = ds.stop_stn
    #                    AND i.leave_time <= ds.scheduled_departure_time

    #     ),

    #         reachable as (

    #             SELECT inter.start_stn, s.stop_stn, s.route_id, inter.current_route || ',' || s.stop_stn as current_route, s.scheduled_arrival_time, row_number() OVER (PARTITION BY s.stop_stn ORDER BY scheduled_arrival_time) as arrival_rank
    #               FROM dummy_stops as s
    #              INNER JOIN inter
    #                    ON inter.route_id = s.route_id

    #     )

    #     SELECT r.*
    #     FROM reachable as r
    #     WHERE r.arrival_rank = 1
    #         """

    initial_placeholders = [start_station, int(journey_start_time.timestamp()), start_station, ""]
    output = []
    min_time = int((journey_start_time + timedelta(hours = 24)).timestamp())
    used_route_placeholders = []
    query_placeholders = initial_placeholders + used_route_placeholders + [min_time]
    loop_idx = 1
    MAX_ALLOWED_CHANGES = 100
    while loop_idx <= MAX_ALLOWED_CHANGES:

        if len(used_route_placeholders) > 0:
            used_routes_cte = f"""
            used_routes(route_id) as (
            
                VALUES {",".join(["(?)"] * len(used_route_placeholders))}

            ),
            """
            used_routes_condition = """ WHERE NOT EXISTS (SELECT route_id FROM used_routes WHERE inter.route_id = used_routes.route_id)"""
        else:
            used_routes_cte = ""
            used_routes_condition = ""


        initial_cte = f"""

        WITH initial(start_stn, leave_time, current_route, current_route_ids) as (

                VALUES {",".join(["(?,?,?,?)"] * (len(initial_placeholders) // 4))}

        ),"""

        inter_and_reachable_cte = """
            inter as (

                SELECT DISTINCT ds.route_id, i.start_stn, i.current_route, i.current_route_ids
                FROM stops as ds
                INNER JOIN initial as i
                    ON i.start_stn = ds.stop_stn
                    AND i.leave_time <= ds.scheduled_departure_time
                    AND ds.scheduled_departure_time < ?

        ),

            reachable as (

                SELECT inter.start_stn, s.stop_stn, s.route_id, inter.current_route || ',' || s.stop_stn as current_route, inter.current_route_ids || s.route_id || ',' as current_route_ids, s.scheduled_arrival_time, row_number() OVER (PARTITION BY s.stop_stn ORDER BY scheduled_arrival_time) as arrival_rank
                FROM stops as s
                INNER JOIN inter
                    ON inter.route_id = s.route_id
                    """

        query_tail = f"""

        )

        SELECT r.*
        FROM reachable as r
        WHERE r.arrival_rank <= {number_of_journeys};
        """

        query = "".join([initial_cte, used_routes_cte, inter_and_reachable_cte, used_routes_condition, query_tail])

        res = get_db().execute(query,
        query_placeholders
        ).fetchall()

        if len(res) == 0:
            break

        # for key in res[0].keys():
        #     print(key, end = ",\t")
        # print("\n")
        # for row in res:
        #     for col in row:
        #         print(col, end = ",\t\t")
        #     print("\n")
        # print("-" * 20)
        # print("\n")

        idx = len(res)
        for row in res[::-1]:
            idx -= 1
            used_route_placeholders.append(row["route_id"])
            if row["stop_stn"] == target_station:
                output.append([row["current_route"], row["current_route_ids"], datetime.fromtimestamp(row["scheduled_arrival_time"])])
                min_time = min(min_time, row["scheduled_arrival_time"])
                res.pop(idx)
            elif row["scheduled_arrival_time"] >= min_time:
                res.pop(idx)

        if len(res) == 0:
            break
        
        initial_placeholders = [x[key] for x in res for key in ["stop_stn", "scheduled_arrival_time", "current_route", "current_route_ids"]]
        query_placeholders = initial_placeholders + used_route_placeholders + [min_time]

        loop_idx += 1

    output.sort(key = lambda x : x[2])

    json_output = [{"route": route, "route_ids": route_ids, "arrival_time" : arrival_time} for route, route_ids, arrival_time in output]

    return json_output
        
def new_get_number_of_stops_along_route(route_id):
    # Get Number of stops
    res = get_db().execute(
    """
    SELECT ds.*, row_number() OVER (PARTITION BY route_id ORDER BY scheduled_departure_time) - 1 AS stop_number
    FROM dummy_stops as ds
    WHERE ds.route_id = ?
    """,
    (route_id)).fetchall()
    return res