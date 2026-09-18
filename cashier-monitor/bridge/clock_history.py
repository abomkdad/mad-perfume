"""Preserve recorder wall-clock offsets across explicitly recorded corrections."""
import json
import os
from pathlib import Path


def recording_offset(device, start, end, current_offset, history=None):
    if history is None:
        path = Path(os.environ.get('MAD_CLOCK_HISTORY', '/var/lib/mad-video/clock-history.json'))
        history = json.loads(path.read_text()) if path.exists() else []
    changes = sorted((r for r in history if r['device'] == device), key=lambda r: r['startedAt'])
    for row in changes:
        # Refuse uncertain or mixed-clock windows rather than retrieve unrelated video.
        if end < row['startedAt'] - 5:
            return row['previousOffsetSeconds']
        if row.get('status') != 'verified':
            raise ValueError('unverified recorder clock correction')
        if start <= row['finishedAt'] + 5:
            raise ValueError('recording overlaps clock correction')
    return current_offset
