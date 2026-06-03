#!/usr/bin/env python3
"""
Generate a Simple Weight Tracker backup JSON with daily weight entries.

The script is intentionally deterministic by default, so the same history/profile
input produces the same output. It can be used either with built-in sample data or
with external JSON files.

Usage examples:
  python generate_3mo_weight_backup.py --output generated-weight-backup-3mo.json
  python generate_3mo_weight_backup.py --history history.json --profile profile.json --output backup.json

Expected history JSON shape:
{
  "startDate": "2026-03-03",
  "endDate": "2026-06-03",
  "startWeightKg": 125.0,
  "endWeightKg": 114.6,
  "seed": 20260603
}

Expected profile JSON shape:
{
  "targetWeightKg": 72,
  "heightCm": 175,
  "sex": "male",
  "age": 25,
  "activityLevel": "sedentary",
  "milestonesKg": [120, 115, 110, 107, 105, 100, 95, 92, 90, 85, 80, 77, 75, 72]
}
"""

from __future__ import annotations

import argparse
import json
import math
import random
import uuid
from copy import deepcopy
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List


APP_NAME = "simple-weight-tracker"
SCHEMA_VERSION = 3

SAMPLE_HISTORY: Dict[str, Any] = {
    "startDate": "2026-03-03",
    "endDate": "2026-06-03",
    "startWeightKg": 125.0,
    # 3 months at about 0.8 kg/week: realistic, planned, but not crash dieting.
    "endWeightKg": 114.6,
    "seed": 20260603,
}

SAMPLE_PROFILE: Dict[str, Any] = {
    "targetWeightKg": 72,
    "heightCm": 175,
    "sex": "male",
    "age": 25,
    "activityLevel": "sedentary",
    "milestonesKg": [120, 115, 110, 107, 105, 100, 95, 92, 90, 85, 80, 77, 75, 72],
}


@dataclass(frozen=True)
class GenerationConfig:
    start_date: date
    end_date: date
    start_weight_kg: float
    end_weight_kg: float
    seed: int = 20260603


def parse_date(value: str) -> date:
    return date.fromisoformat(value)


def iso_z(dt: datetime) -> str:
    """Return an ISO timestamp formatted like JavaScript Date.toISOString()."""
    dt = dt.astimezone(timezone.utc)
    millis = dt.microsecond // 1000
    return dt.strftime(f"%Y-%m-%dT%H:%M:%S.{millis:03d}Z")


def load_json_file(path: str | None, default: Dict[str, Any]) -> Dict[str, Any]:
    if not path:
        return deepcopy(default)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def build_config(history: Dict[str, Any]) -> GenerationConfig:
    required = ["startDate", "endDate", "startWeightKg"]
    missing = [key for key in required if key not in history]
    if missing:
        raise ValueError(f"history is missing required key(s): {', '.join(missing)}")

    start = parse_date(str(history["startDate"]))
    end = parse_date(str(history["endDate"]))
    if end < start:
        raise ValueError("history.endDate must be on or after history.startDate")

    start_weight = float(history["startWeightKg"])
    if "endWeightKg" in history:
        end_weight = float(history["endWeightKg"])
    else:
        # Conservative default: about 0.8 kg/week.
        days = (end - start).days
        end_weight = start_weight - 0.8 * days / 7

    return GenerationConfig(
        start_date=start,
        end_date=end,
        start_weight_kg=start_weight,
        end_weight_kg=end_weight,
        seed=int(history.get("seed", 20260603)),
    )


def date_range(start: date, end: date) -> Iterable[date]:
    cur = start
    while cur <= end:
        yield cur
        cur += timedelta(days=1)


def generate_weights(config: GenerationConfig) -> List[Dict[str, Any]]:
    """Generate daily entries in descending date order, matching schemaVersion 3."""
    rng = random.Random(config.seed)
    days = (config.end_date - config.start_date).days
    if days == 0:
        dates = [config.start_date]
    else:
        dates = list(date_range(config.start_date, config.end_date))

    entries: List[Dict[str, Any]] = []

    for idx, d in enumerate(dates):
        progress = 0 if days == 0 else idx / days
        trend = config.start_weight_kg + (config.end_weight_kg - config.start_weight_kg) * progress

        # Realistic non-linear components: weekly water/glycogen swing, slower monthly swing,
        # and small random measurement/food-content noise.
        weekly_wave = 0.34 * math.sin(2 * math.pi * idx / 7 + 0.7)
        monthly_wave = 0.22 * math.sin(2 * math.pi * idx / 29 + 1.2)
        random_noise = rng.gauss(0, 0.18)
        weight = trend + weekly_wave + monthly_wave + random_noise

        # Anchor exact start/end values while allowing all middle days to fluctuate.
        if idx == 0:
            weight = config.start_weight_kg
        elif idx == days:
            weight = config.end_weight_kg

        # Mimic real app behavior: entry timestamps can be later than measured date.
        created = datetime(d.year, d.month, d.day, 12, 0, 0, tzinfo=timezone.utc) + timedelta(
            hours=rng.randint(0, 9), minutes=rng.randint(0, 59), seconds=rng.randint(0, 59), milliseconds=rng.randint(0, 999)
        )
        updated = created + timedelta(minutes=rng.randint(0, 12), seconds=rng.randint(0, 59), milliseconds=rng.randint(0, 999))

        entry: Dict[str, Any] = {
            "id": str(uuid.uuid4()),
            "date": d.isoformat(),
            "weight": round(weight, 1),
            "createdAt": iso_z(created),
            "updatedAt": iso_z(updated),
        }

        # Sparse notes, useful for testing but not so frequent that the data looks artificial.
        if idx in {0, 30, 61, days}:
            entry["note"] = {
                0: "开始三个月模拟记录",
                30: "本周饮食略有波动",
                61: "走路和饮食执行较稳定",
                days: "三个月阶段记录结束",
            }[idx]

        entries.append(entry)

    return list(reversed(entries))


def build_plan(profile: Dict[str, Any], config: GenerationConfig, exported_at: datetime) -> Dict[str, Any]:
    created_at = iso_z(datetime(config.start_date.year, config.start_date.month, config.start_date.day, 8, 0, 0, tzinfo=timezone.utc))
    updated_at = iso_z(exported_at)
    return {
        "id": str(profile.get("id", "default")),
        "startWeightKg": float(profile.get("startWeightKg", config.start_weight_kg)),
        "targetWeightKg": float(profile.get("targetWeightKg", 72)),
        "heightCm": int(profile.get("heightCm", 175)),
        "sex": str(profile.get("sex", "male")),
        "age": int(profile.get("age", 25)),
        "activityLevel": str(profile.get("activityLevel", "sedentary")),
        "milestonesKg": profile.get("milestonesKg", SAMPLE_PROFILE["milestonesKg"]),
        "createdAt": str(profile.get("createdAt", created_at)),
        "updatedAt": str(profile.get("updatedAt", updated_at)),
    }


def build_backup(history: Dict[str, Any], profile: Dict[str, Any]) -> Dict[str, Any]:
    config = build_config(history)
    exported_at = datetime(config.end_date.year, config.end_date.month, config.end_date.day, 15, 58, 46, 487000, tzinfo=timezone.utc)
    return {
        "app": APP_NAME,
        "schemaVersion": SCHEMA_VERSION,
        "exportedAt": iso_z(exported_at),
        "entries": generate_weights(config),
        "plan": build_plan(profile, config, exported_at),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate a 3-month daily weight backup JSON.")
    parser.add_argument("--history", help="Path to history JSON. Uses built-in sample if omitted.")
    parser.add_argument("--profile", help="Path to profile JSON. Uses built-in sample if omitted.")
    parser.add_argument("--output", default="generated-weight-backup-3mo.json", help="Output backup JSON path.")
    args = parser.parse_args()

    history = load_json_file(args.history, SAMPLE_HISTORY)
    profile = load_json_file(args.profile, SAMPLE_PROFILE)
    backup = build_backup(history, profile)

    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(backup, f, ensure_ascii=False, indent=2)
        f.write("\n")

    entries = backup["entries"]
    latest = entries[0]
    earliest = entries[-1]
    print(f"Wrote {out_path}")
    print(f"Entries: {len(entries)}")
    print(f"Date range: {earliest['date']} to {latest['date']}")
    print(f"Weight range: {earliest['weight']} kg to {latest['weight']} kg")


if __name__ == "__main__":
    main()
