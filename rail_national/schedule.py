from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort
from datetime import datetime

from rail_national.auth import login_required
import rail_national.queries as queries

from . import utilities

bp = Blueprint("schedule", __name__)

def get_route(route_id, check_permissions = False):
    route = queries.get_route(route_id)

    if route is None:
        abort(404, f"Route id {route_id} doesn't exist.")

    if check_permissions:
        abort(403)

    return route

@bp.route("/")
def index():
    column_types = queries.get_column_types_from_table("schedule")
    schedule = queries.get_schedule()
    return render_template("schedule/index.html", schedule = schedule, column_types = column_types)

@bp.route("/add_route", methods = ("GET", "POST"))
@login_required
def add_route():
    if request.method == "POST":
        route_id, route_id_errors = utilities.Validators.validate_route_id(request.form.get("route_id"))
        origin_stn, origin_stn_errors = utilities.Validators.validate_stn(request.form.get("origin_stn"))
        destn_stn, destn_stn_errors = utilities.Validators.validate_stn(request.form.get("destn_stn"))
        stop_stn, stop_stn_errors = utilities.Validators.validate_stn(request.form.get("stop_stn"))
        origin_dep_time, origin_dep_time_errors = utilities.Validators.validate_time(request.form.get("origin_dep_time"), "%Y-%m-%dT%H:%M")
        destn_arr_time, destn_arr_time_errors = utilities.Validators.validate_time(request.form.get("destn_arr_time"), "%Y-%m-%dT%H:%M")
        stop_time, stop_time_errors = utilities.Validators.validate_time(request.form.get("stop_time"), "%Y-%m-%dT%H:%M")
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
            success, msg = queries.insert_route(route_id, origin_stn, destn_stn, stop_stn, origin_dep_time, destn_arr_time, stop_time, cancelled)
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
        route_id, route_id_errors = utilities.Validators.validate_route_id(request.form.get("route_id"), required = False)
        route_id = route_id or route["route_id"]
        origin_stn, origin_stn_errors = utilities.Validators.validate_stn(request.form.get("origin_stn"), required = False)
        origin_stn = origin_stn or route["origin_stn"]
        destn_stn, destn_stn_errors = utilities.Validators.validate_stn(request.form.get("destn_stn"), required = False)
        destn_stn = destn_stn or route["destn_stn"]
        stop_stn, stop_stn_errors = utilities.Validators.validate_stn(request.form.get("stop_stn"), required = False)
        stop_stn = stop_stn or route["stop_stn"]
        origin_dep_time, origin_dep_time_errors = utilities.Validators.validate_time(request.form.get("origin_dep_time"), "%Y-%m-%dT%H:%M", required = False)
        origin_dep_time = origin_dep_time or datetime.fromtimestamp(route["origin_dep_time"]).strftime("%Y-%m-%dT%H:%M")
        destn_arr_time, destn_arr_time_errors = utilities.Validators.validate_time(request.form.get("destn_arr_time"), "%Y-%m-%dT%H:%M", required = False)
        destn_arr_time = destn_arr_time or datetime.fromtimestamp(route["destn_arr_time"]).strftime("%Y-%m-%dT%H:%M")
        stop_time, stop_time_errors = utilities.Validators.validate_time(request.form.get("stop_time"), "%Y-%m-%dT%H:%M", required = False)
        stop_time = stop_time or datetime.fromtimestamp(route["stop_time"]).strftime("%Y-%m-%dT%H:%M")
        cancelled, cancelled_errors = utilities.Validators.validate_cancelled(request.form.get("cancelled", default = "0"), required = False)
        cancelled = cancelled or route["cancelled"]
        cancelled = int(cancelled)
        errors = []

        # Ensure Times Are Compatible

        if (origin_dep_time or destn_arr_time) and datetime.strptime(origin_dep_time, "%Y-%m-%dT%H:%M") > datetime.strptime(destn_arr_time, "%Y-%m-%dT%H:%M"):
            errors.append(f"Origin Departure time cannot be later than Destination Arrival time.")

        if (origin_dep_time or stop_time) and datetime.strptime(origin_dep_time, "%Y-%m-%dT%H:%M") > datetime.strptime(stop_time, "%Y-%m-%dT%H:%M"):
            errors.append(f"Origin Departure time cannot be later than Stop time.")

        errors = [*errors, *route_id_errors, *origin_stn_errors, *destn_stn_errors, *stop_stn_errors, *origin_stn_errors, *origin_dep_time_errors, *destn_arr_time_errors, *stop_stn_errors, *stop_time_errors, *cancelled_errors]

        if len(errors) == 0:
            success, msg = queries.update_route(origin_stn, destn_stn, stop_stn, origin_dep_time, destn_arr_time, stop_time, cancelled, route_id)
            if success:
                return redirect(url_for("schedule.index"))
            else:
                errors.append(msg)
            
        flash("\n".join(errors))

    else:
        # Convert to appropriate formatting
        route = dict(route)
        route["origin_dep_time"] = datetime.fromtimestamp(route["origin_dep_time"]).strftime("%Y-%m-%dT%H:%M")
        route["destn_arr_time"] = datetime.fromtimestamp(route["destn_arr_time"]).strftime("%Y-%m-%dT%H:%M")
        route["stop_time"] = datetime.fromtimestamp(route["stop_time"]).strftime("%Y-%m-%dT%H:%M")
    
    return render_template("schedule/update_route.html", route = route)

@bp.route("/<int:route_id>/delete", methods=("POST",))
@login_required
def delete(route_id):
    # This checks permissions
    route = get_route(route_id)
    queries.delete_route(route_id)
    return redirect(url_for("schedule.index"))
