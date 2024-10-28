from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort
from datetime import datetime

from rail_national.auth import login_required
import rail_national.queries as queries

from . import utilities

bp = Blueprint("stops", __name__, url_prefix = "/stops")


@bp.route("/view_table")
def view_table():
    column_types = queries.get_column_types_from_table("stops")
    stops = queries.get_stops()
    return render_template("stops/view_table.html", stops = stops, column_types = column_types)
