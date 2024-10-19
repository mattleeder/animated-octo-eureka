from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort
from datetime import datetime

import json

from rail_national.auth import login_required
import rail_national.queries as queries

from . import utilities

bp = Blueprint("virtualised_table", __name__, url_prefix = "/virtualised_table")

@bp.route("/")
def index():
    column_types = queries.get_column_types_from_table("schedule")
    schedule = queries.get_schedule()
    # json_column_types = [
    #     {
    #         "route_id" : row["route_id"],
    #         "origin_stn" : row["origin_stn"],
    #         "destn_stn" : row["destn_stn"],
    #         "stop_stn" : row["stop_stn"],
    #         "origin_dep_time" : row["origin_dep_time"],
    #         "destn_arr_time" : row["destn_arr_time"],
    #         "stop_time" : row["stop_time"],
    #         "cancelled" : row["cancelled"],
    #     }
    #     for row in column_types    
    # ]
    json_schedule = [
        {
            "route_id" : row["route_id"],
            "origin_stn" : row["origin_stn"],
            "destn_stn" : row["destn_stn"],
            "stop_stn" : row["stop_stn"],
            "origin_dep_time" : row["origin_dep_time"],
            "destn_arr_time" : row["destn_arr_time"],
            "stop_time" : row["stop_time"],
            "cancelled" : row["cancelled"],
        }
        for row in schedule
    ]
    return render_template("virtualised_table/index.html", schedule = json_schedule, column_types = column_types)