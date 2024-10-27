import sqlite3

import click
from flask import current_app, g

def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(
            current_app.config["DATABASE"],
            detect_types = sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row

    return g.db

def close_db(e = None):
    db = g.pop("db", None)

    if db is not None:
        db.close()

def init_db():
    db = get_db()

    with current_app.open_resource("schema.sql") as f:
        db.executescript(f.read().decode("utf8"))

@click.command("init-db")
def init_db_command():
    "Clear the existing data and create new tables."
    init_db()
    click.echo("Initialized the database.")

def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)


# ONLY HERE FOR TESTING PURPOSES
def new_db_query():
    route_search_parameters = [{"start_stn" : "BBB", "leave_time" : "15:00", "target_stn" : "BDC", "current_route" : "BBB"}]
    initial_placeholders = [x[key] for x in route_search_parameters for key in ["start_stn", "leave_time", "current_route"]]
    output = []
    min_time = "23:59"
    used_route_placeholders = []
    query_placeholders = initial_placeholders + used_route_placeholders
    loop_idx = 1
    max_arrival_rank = 1
    MAX_ALLOWED_CHANGES = 100
    while loop_idx <= MAX_ALLOWED_CHANGES:
    #         if len(used_route_placeholders) > 0:
    #         query = f"""
    # WITH initial(start_stn, leave_time, current_route) as (

    #             VALUES {",".join(["(?,?,?)"] * (len(initial_placeholders) // 3))}

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

        WITH initial(start_stn, leave_time, current_route) as (

                VALUES {",".join(["(?,?,?)"] * (len(initial_placeholders) // 3))}

        ),"""

        inter_and_reachable_cte = """
            inter as (

                SELECT DISTINCT ds.route_id, i.start_stn, i.current_route
                FROM dummy_stops as ds
                INNER JOIN initial as i
                    ON i.start_stn = ds.stop_stn
                    AND i.leave_time <= ds.scheduled_departure_time

        ),

            reachable as (

                SELECT inter.start_stn, s.stop_stn, s.route_id, inter.current_route || ',' || s.stop_stn as current_route, s.scheduled_arrival_time, row_number() OVER (PARTITION BY s.stop_stn ORDER BY scheduled_arrival_time) as arrival_rank
                FROM dummy_stops as s
                INNER JOIN inter
                    ON inter.route_id = s.route_id
                    """

        query_tail = f"""

        )

        SELECT r.*
        FROM reachable as r
        WHERE r.arrival_rank <= {max_arrival_rank};
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
            if row["stop_stn"] == route_search_parameters[0]["target_stn"]:
                output.append([row["current_route"], row["scheduled_arrival_time"]])
                min_time = min(min_time, row["scheduled_arrival_time"])
                res.pop(idx)
            elif row["scheduled_arrival_time"] >= min_time:
                res.pop(idx)

        if len(res) == 0:
            break
        
        initial_placeholders = [x[key] for x in res for key in ["stop_stn", "scheduled_arrival_time", "current_route"]]
        query_placeholders = initial_placeholders + used_route_placeholders

        loop_idx += 1
        
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