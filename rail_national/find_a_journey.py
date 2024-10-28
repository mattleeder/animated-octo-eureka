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
    return render_template("route_search/find_a_journey.html")
