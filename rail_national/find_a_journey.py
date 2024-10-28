from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort
from datetime import datetime

from rail_national.auth import login_required
import rail_national.queries as queries

from . import utilities

bp = Blueprint("find_a_journey", __name__, url_prefix = "/find_a_journey")

@bp.route("/")
def journey_search():
    journey_start_station = request.args.get("journey-start-input")
    journey_end_station = request.args.get("journey-end-input")
    journey_start_time = request.args.get("journey-departure-time")

    if journey_start_station and journey_end_station and journey_start_time:
        journey_start_station = journey_start_station.upper()
        journey_end_station = journey_end_station.upper()
        journey_start_time = datetime.strptime(journey_start_time, "%Y-%m-%dT%H:%M")
        journeys = queries.get_n_fastest_journeys(journey_start_station, journey_end_station, journey_start_time, 1)
    else:
        journeys = None

    print(f"Journeys: {journeys}")

    return render_template("route_search/find_a_journey.html", journeys = journeys)

@bp.route("/get_fastest_journeys", methods = ("GET",))
def get_n_fastest_routes_for_journey(n = 1):
    journey_start_station = request.args.get("journey-start-input")
    journey_end_station = request.args.get("journey-end-input")
    journey_start_time = request.args.get("journey-departure-time")
    # start_time = (journey_start_time)
    print("Received", flush = True)
    # journeys = queries.get_n_fastest_journeys(start_station, end_station, start_time, n)
    return redirect(url_for("find_a_journey.journey_search"))