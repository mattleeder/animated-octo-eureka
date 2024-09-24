from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort
from datetime import datetime

from rail_national.auth import login_required
from rail_national.db import get_db

from . import utilities

bp = Blueprint("schedule", __name__)

def get_route(route_id, check_permissions = True):
    route = get_db().execute("""
        SELECT *
          FROM schedule
         WHERE route_id = ?""",
        (route_id,)
    ).fetchone()

    if route is None:
        abort(404, f"Route id {route_id} doesn't exist.")

    if check_permissions:
        abort(403)

    return route

@bp.route("/")
def index():
    db = get_db()
    schedule = db.execute("""
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
    """).fetchall()
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
        errors = []

        # Check required

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

        
        # Validate Inputs

        try:
            utilities.Validators.validate_route_id(route_id)
        except utilities.ValidationError:
            errors.append(f"Route ID '{route_id}' is invalid.")

        try:
            utilities.Validators.validate_stn(origin_stn)
        except utilities.ValidationError:
            errors.append(f"Origin Station '{origin_stn}' is invalid.")

        try:
            utilities.Validators.validate_stn(destn_stn)
        except utilities.ValidationError:
            errors.append(f"Destination Station '{destn_stn}' is invalid.")

        try:
            utilities.Validators.validate_stn(stop_stn)
        except utilities.ValidationError:
            errors.append(f"Stop Station '{stop_stn}' is invalid.")

        try:
            utilities.Validators.validate_time(origin_dep_time, "%Y-%m-%dT%H:%M")
        except utilities.ValidationError:
            errors.append(f"Origin Departure Time '{origin_dep_time}' is invalid.")

        try:
            utilities.Validators.validate_time(destn_arr_time, "%Y-%m-%dT%H:%M")
        except utilities.ValidationError:
            errors.append(f"Origin Departure Time '{destn_arr_time}' is invalid.")

        try:
            utilities.Validators.validate_time(stop_time, "%Y-%m-%dT%H:%M")
        except utilities.ValidationError:
            errors.append(f"Origin Departure Time '{stop_time}' is invalid.")

        try:
            utilities.Validators.validate_cancelled(cancelled)
        except utilities.ValidationError:
            errors.append(f"Cancel code '{cancelled}' is invalid.")


        # Ensure Times Are Compatible

        if datetime.strptime(origin_dep_time, "%Y-%m-%dT%H:%M") > datetime.strptime(destn_arr_time, "%Y-%m-%dT%H:%M"):
            errors.append(f"Origin Departure time cannot be later than Destination Arrival time.")

        if datetime.strptime(origin_dep_time, "%Y-%m-%dT%H:%M") > datetime.strptime(stop_time, "%Y-%m-%dT%H:%M"):
            errors.append(f"Origin Departure time cannot be later than Stop time.")


        if len(errors) == 0:
            try:
                db = get_db()
                db.execute("""
                    INSERT INTO schedule (route_id, origin_stn, destn_stn, stop_stn, origin_dep_time, destn_arr_time, stop_time, cancelled)
                     VALUES (?, ?, ?, ?, unixepoch(?), unixepoch(?), unixepoch(?), ?)""",
                    (route_id, origin_stn, destn_stn, stop_stn, origin_dep_time, destn_arr_time, stop_time, cancelled)
                )
                db.commit()
            except db.IntegrityError as e:
                match e.sqlite_errorcode:
                    case 20:
                        errors.append(f"Route ID '{route_id}' must be an integer.")
                    case 1555:
                        errors.append(f"Route ID '{route_id}' already exists.")
                    case _:
                        errors.append(f"Operation Failed")
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
        db.execute("""
            UPDATE schedule SET origin_stn = ?, destn_stn = ?, stop_stn = ?, origin_dep_time = unixepoch(?), destn_arr_time = unixepoch(?), unixepoch(stop_time) = ?, cancelled = ?
             WHERE route_id = ?""",
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
