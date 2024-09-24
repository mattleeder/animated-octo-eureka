import sqlite3
from datetime import datetime

def make_time_readable(data: sqlite3.Row | list[sqlite3.Row], cols: list[str]):
    if isinstance(data, list):
        for row in data:
            pass

class ValidationError(Exception):
    def __init__(self, message, errors):
        super().__init__(message)
        self.errors = errors

class Validators():

    @staticmethod
    def validate_route_id(s: str):
        # Must be positive integer
        valid = True
        errors = []
        if not s.isnumeric(s):
            errors.append(f"'{s}' is non-numeric.")
        if not int(s) > 0:
            errors.append(f"'{s}' is negative.")
        if not valid:
            raise ValidationError(f"'{s}' is not a valid route ID.", errors)
        

    @staticmethod
    def validate_stn(s: str) -> None:
        # Must be string of length 3
        # Must only contain char
        # Must be in station database??
        valid = True
        errors = []
        if len(s) != 3:
            valid = False
            errors.append(f"Length is {len(s)} not 3.")
        if not s.isalpha():
            valid = False
            errors.append(f"'{s}' contains non-alphabetic characters.")
        if not valid:
            raise ValidationError(f"'{s}' is not a valid station.", errors)
        
    @staticmethod
    def validate_time(s: str, time_format: str) -> None:
        try:
            datetime.strptime(s, time_format)
        except ValueError as e:
            raise ValidationError(f"{s} is not a valid time for the format {time_format}.", e)

    @staticmethod
    def validate_cancelled(s: str):
        if s != "0" and s != "1":
            raise ValidationError(f"{s} is not valid cancellation code.", [])