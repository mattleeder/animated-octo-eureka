import time
import sqlite3

def make_time_readable(data: sqlite3.Row | list[sqlite3.Row], cols: list[str]):
    if isinstance(data, list):
        for row in data:
            pass

class ValidationError(Exception):
    def __init__(self, message, errors):
        super().__init__(message)
        self.errors = errors

class Validators():

    def validate_stn(s: bytes) -> bool:
        # Must be string of length 3
        # Must only contain char
        # Must be in station database??
        valid = True
        errors = []
        if len(s) != 3:
            valid = False
            errors.append(f"Length is {len(s)} not 3")
        if not s.isalpha():
            valid = False
            errors.append(f"'{s}' contains non-alphabetic characters")
        if not valid:
            raise ValidationError(f"'{s}' is not a valid station", errors)

    def validate_time(s: bytes, format: str):
        pass

    def validate_cancelled(s: bytes):
        pass