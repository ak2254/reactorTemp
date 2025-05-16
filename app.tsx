rom datetime import datetime

def serialize_row(row: dict) -> dict:
    return {
        k: v.isoformat() if isinstance(v, datetime) else v
        for k, v in row.items()
    }
