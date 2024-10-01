import sqlite3
from datetime import datetime
from typing import Union

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
    def validate_route_id(data: str, required = True, extra_validators = []) -> Union[str, list[str]]:
        # Must be positive integer
        error_messages = []
        if not data:
            if required:
                error_messages.append("Route ID Required.")
            return data, error_messages

        if data.isnumeric():
            if not int(data) > 0:
                error_messages.append(f"'{data}' is negative.")
        else:
            error_messages.append(f"'{data}' is non-numeric.")
        for validator in extra_validators:
            _, errors = validator(data)
            error_messages.extend(errors)
        print(data)
        return [data, error_messages]
        

    @staticmethod
    def validate_stn(data: str, required = True, extra_validators = []) -> Union[str, list[str]]:
        # Must be string of length 3
        # Must only contain char
        # Must be in station database??
        error_messages = []
        if not data:
            if required:
                error_messages.append("Station Required.")
            return data, error_messages

        if len(data) != 3:
            error_messages.append(f"Length is {len(data)} not 3.")
        if not data.isalpha():
            error_messages.append(f"'{data}' contains non-alphabetic characters.")
        for validator in extra_validators:
            _, errors = validator(data)
            error_messages.extend(errors)
        return data, error_messages
        
    @staticmethod
    def validate_time(data: str, time_format: str, required = True, extra_validators = []) -> Union[str, list[str]]:
        error_messages = []
        if not data:
            if required:
                error_messages.append("Time required.")
            return data, error_messages
        try:
            datetime.strptime(data, time_format)
        except ValueError as e:
            error_messages.append(f"{data} is not a valid time for the format {time_format}.")
        for validator in extra_validators:
            _, errors = validator(data)
            error_messages.extend(errors)
        return data, error_messages

    @staticmethod
    def validate_cancelled(data: str, required = True, extra_validators = []) -> Union[str, list[str]]:
        error_messages = []
        if not data:
            if required:
                error_messages.append("Time required.")
            return data, error_messages
        if data != "0" and data != "1":
            error_messages.append(f"{data} is not valid cancellation code.")
        for validator in extra_validators:
            _, errors = validator(data)
            error_messages.extend(errors)
        return data, error_messages
        
class CheckValid:

    def __init__(self, form_data, validators = None):
        self.form_data = form_data