from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort
from datetime import datetime

from rail_national.auth import login_required
from rail_national.db import get_db
from rail_national.queries import get_schedule, insert_route, query_route, update_route, delete_route

from . import utilities

bp = Blueprint("schedule", __name__)

def get_route(route_id, check_permissions = True):
    route = query_route(route_id)

    if route is None:
        abort(404, f"Route id {route_id} doesn't exist.")

    if check_permissions:
        abort(403)

    return route

@bp.route("/")
def index():
    schedule = get_schedule()
    return render_template("schedule/index.html", schedule = schedule)

@bp.route("/add_route", methods = ("GET", "POST"))
@login_required
def add_route():
    if request.method == "POST":
        route_id, route_id_errors = utilities.Validators.validate_route_id(request.form["route_id"])
        origin_stn, origin_stn_errors = utilities.Validators.validate_stn(request.form["origin_stn"])
        destn_stn, destn_stn_errors = utilities.Validators.validate_stn(request.form["destn_stn"])
        stop_stn, stop_stn_errors = utilities.Validators.validate_stn(request.form["stop_stn"])
        origin_dep_time, origin_dep_time_errors = utilities.Validators.validate_time(request.form["origin_dep_time"])
        destn_arr_time, destn_arr_time_errors = utilities.Validators.validate_time(request.form["destn_arr_time"])
        stop_time, stop_time_errors = utilities.Validators.validate_time(request.form["stop_time"])
        cancelled = 0
        errors = []

        #route_id, route_id_errors = validate_route_id(route_id, required = True, [extra_validators])

        # Ensure Times Are Compatible

        if datetime.strptime(origin_dep_time, "%Y-%m-%dT%H:%M") > datetime.strptime(destn_arr_time, "%Y-%m-%dT%H:%M"):
            errors.append(f"Origin Departure time cannot be later than Destination Arrival time.")

        if datetime.strptime(origin_dep_time, "%Y-%m-%dT%H:%M") > datetime.strptime(stop_time, "%Y-%m-%dT%H:%M"):
            errors.append(f"Origin Departure time cannot be later than Stop time.")

        errors = [*errors, *route_id_errors, *origin_stn_errors, *destn_stn_errors, *stop_stn_errors, *origin_stn_errors, *origin_dep_time_errors, *destn_arr_time_errors, *stop_stn_errors, *stop_time_errors]


        if len(errors) == 0:
            success, msg = insert_route(route_id, origin_stn, destn_stn, stop_stn, origin_dep_time, destn_arr_time, stop_time, cancelled)
            if success:
                return redirect(url_for("schedule.index"))
            else:
                errors.append(msg)
            
        flash("\n".join(errors))

    return render_template("schedule/add_route.html")

@bp.route("/<int:route_id>/update_route", methods = ("GET", "POST"))
@login_required
def update_route(route_id):
    route = get_route(route_id)

    if request.method == "POST":
        route_id, route_id_errors = utilities.Validators.validate_route_id(request.form["route_id"])
        origin_stn, origin_stn_errors = utilities.Validators.validate_stn(request.form["origin_stn"])
        destn_stn, destn_stn_errors = utilities.Validators.validate_stn(request.form["destn_stn"])
        stop_stn, stop_stn_errors = utilities.Validators.validate_stn(request.form["stop_stn"])
        origin_dep_time, origin_dep_time_errors = utilities.Validators.validate_time(request.form["origin_dep_time"])
        destn_arr_time, destn_arr_time_errors = utilities.Validators.validate_time(request.form["destn_arr_time"])
        stop_time, stop_time_errors = utilities.Validators.validate_time(request.form["stop_time"])
        cancelled = 0
        errors = []

        # Ensure Times Are Compatible

        if datetime.strptime(origin_dep_time, "%Y-%m-%dT%H:%M") > datetime.strptime(destn_arr_time, "%Y-%m-%dT%H:%M"):
            errors.append(f"Origin Departure time cannot be later than Destination Arrival time.")

        if datetime.strptime(origin_dep_time, "%Y-%m-%dT%H:%M") > datetime.strptime(stop_time, "%Y-%m-%dT%H:%M"):
            errors.append(f"Origin Departure time cannot be later than Stop time.")

        errors = [*errors, *route_id_errors, *origin_stn_errors, *destn_stn_errors, *stop_stn_errors, *origin_stn_errors, *origin_dep_time_errors, *destn_arr_time_errors, *stop_stn_errors, *stop_time_errors]

        if len(errors) == 0:
            success, msg = update_route(origin_stn, destn_stn, stop_stn, origin_dep_time, destn_arr_time, stop_time, cancelled, route_id)
            if success:
                return redirect(url_for("schedule.index"))
            else:
                errors.append(msg)
            
        flash("\n".join(errors))
    
    return render_template("schedule/update_route.html", route = route)

@bp.route("/<int:route_id>/delete", methods=("POST",))
@login_required
def delete(route_id):
    # This checks permissions
    route = get_route(route_id)
    delete_route(route_id)
    return redirect(url_for("schedule.index"))
