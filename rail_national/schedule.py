from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort

from rail_national.auth import login_required
from rail_national.db import get_db

bp = Blueprint("schedule", __name__)

def get_route(route_id, check_permissions = True):
    route = get_db().execute(
        "SELECT route_id, origin_stn, destn_stn, stop_stn, origin_dep_time, destn_arr_time, stop_time"
        "  FROM schedule"
        " WHERE route_id = ?",
        (route_id,)
    ).fetchone()

    if route is None:
        abort(404, f"Route id {route_id} doesn't exists.")

    if check_permissions:
        abort(403)

    return route

@bp.route("/")
def index():
    db = get_db()
    schedule = db.execute(
        "SELECT *"
        "FROM schedule"
        "ORDER BY origin_dep_time"
    ).fetchall()
    return render_template("schedule/index.html", schedule = schedule)

@bp.route("/add_route", methods = ("GET", "POST"))
@login_required
def add_route():
    if request.method == "POST":
        route_id = request.form["route_id"]
        origin_stn = request.form["origin_stn"]
        destn_stn = request.form["destn_stn"]
        stop_stn = request.form["stop_stn"]
        origin_dep_time = request.form["origin_dep_time"]
        destn_arr_time = request.form["destn_arr_time"]
        stop_time = request.form["stop_time"]
        cancelled = 0
        errors = None

        if not route_id:
            errors.append("Route ID is required.")

        if not origin_stn:
            errors.append("Origin Station is required.")

        if not destn_stn:
            errors.append("Destination Station is required.")

        if not stop_stn:
            errors.append("Stop Station is required.")

        if not origin_dep_time:
            errors.append("Origin Departure Time is required.")

        if not destn_arr_time:
            errors.append("Destination Arrival Time is required.")

        if not stop_time:
            errors.append("Stop Time is Required")

        if errors is None:
            try:
                db = get_db()
                db.execute(
                    "INSERT INTO schedule (route_id, origin_stn, destn_stn, stop_stn, origin_dep_time, destn_arr_time, stop_time, cancelled)"
                    " VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (route_id, origin_stn, destn_stn, stop_stn, origin_dep_time, destn_arr_time, stop_time, cancelled)
                )
                db.commit()
            except db.IntegrityError:
                errors.append(f"Route ID {route_id} already exists.")
            else:
                return redirect(url_for("schedule.index"))
            
        flash("\n".join(errors))

    return render_template("schedule/add_route.html")

@bp.route("/<int:route_id>/update_route", methods = ("GET", "POST"))
@login_required
def update_route(route_id):
    route = get_route(route_id)

    if request.method == "POST":
        origin_stn = request.form["origin_stn"]
        destn_stn = request.form["destn_stn"]
        stop_stn = request.form["stop_stn"]
        origin_dep_time = request.form["origin_dep_time"]
        destn_arr_time = request.form["destn_arr_time"]
        stop_time = request.form["stop_time"]
        cancelled = 0
        errors = None

        if not route_id:
            errors.append("Route ID is required.")

        if not origin_stn:
            errors.append("Origin Station is required.")

        if not destn_stn:
            errors.append("Destination Station is required.")

        if not stop_stn:
            errors.append("Stop Station is required.")

        if not origin_dep_time:
            errors.append("Origin Departure Time is required.")

        if not destn_arr_time:
            errors.append("Destination Arrival Time is required.")

        if not stop_time:
            errors.append("Stop Time is Required")

        db = get_db()
        db.execute(
            "UPDATE schedule SET origin_stn = ?, destn_stn = ?, stop_stn = ?, origin_dep_time = ?, destn_arr_time = ?, stop_time = ?, cancelled = ?"
            " WHERE route_id = ?",
            (origin_stn, destn_stn, stop_stn, origin_dep_time, destn_arr_time, stop_time, cancelled, route_id)
        )
        db.commit()
        return redirect(url_for("schedule.index"))
    
    return render_template("schedule/update_route.html", route = route)

@bp.route("/<int:route_id>/delete", methods=("POST",))
@login_required
def delete(route_id):
    # This checks permissions
    route = get_route(route_id)
    db = get_db()
    db.execute("DELETE FROM schedule WHERE route_id = ?", (route_id,))
    db.commit()
    return redirect(url_for("schedule.index"))
