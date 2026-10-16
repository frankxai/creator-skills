#!/usr/bin/env python3
"""Build or optionally submit a Suno music request through MuAPI."""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request
from typing import Any


API_BASE = "https://api.muapi.ai/api/v1"
DEFAULT_MODEL = "V5"
TERMINAL_STATUSES = {"completed", "failed"}


def build_payload(args: argparse.Namespace) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "prompt": args.prompt,
        "style": args.style,
        "model": args.model,
        "instrumental": args.instrumental,
    }
    optional = {
        "title": args.title,
        "negative_tags": args.negative_tags,
        "vocal_gender": args.vocal_gender,
    }
    payload.update({key: value for key, value in optional.items() if value is not None})
    return payload


def request_json(
    url: str,
    *,
    api_key: str,
    method: str = "GET",
    payload: dict[str, Any] | None = None,
    timeout: float = 30,
) -> dict[str, Any]:
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={
            "x-api-key": api_key,
            "Content-Type": "application/json",
            "User-Agent": "creator-skills-muapi-music/1.0",
        },
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        result = json.load(response)
    if not isinstance(result, dict):
        raise RuntimeError("MuAPI returned an unexpected response")
    return result


def submit_and_poll(args: argparse.Namespace, api_key: str) -> dict[str, Any]:
    # Attempt the potentially billable POST once; repeat only read-only polling.
    created = request_json(
        f"{API_BASE}/suno-create-music",
        api_key=api_key,
        method="POST",
        payload=build_payload(args),
        timeout=args.timeout,
    )
    request_id = created.get("request_id")
    if not request_id:
        raise RuntimeError("MuAPI did not return a request_id")

    latest = created
    for attempt in range(args.max_polls):
        if str(latest.get("status", "")).lower() in TERMINAL_STATUSES:
            return latest
        if attempt:
            time.sleep(args.poll_interval)
        latest = request_json(
            f"{API_BASE}/predictions/{request_id}/result",
            api_key=api_key,
            timeout=args.timeout,
        )
    raise TimeoutError(f"request {request_id} did not finish within the polling limit")


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build a Suno request and optionally submit it through MuAPI."
    )
    parser.add_argument("prompt", help="Song idea or lyrics")
    parser.add_argument("--style", required=True, help="Genre, mood, and production direction")
    parser.add_argument("--model", default=DEFAULT_MODEL)
    parser.add_argument("--instrumental", action="store_true")
    parser.add_argument("--vocal-gender", choices=("male", "female"))
    parser.add_argument("--title")
    parser.add_argument("--negative-tags")
    parser.add_argument(
        "--submit",
        action="store_true",
        help="Make one paid generation request; without this flag the command is a dry run",
    )
    parser.add_argument("--poll-interval", type=float, default=5)
    parser.add_argument("--max-polls", type=int, default=36)
    parser.add_argument("--timeout", type=float, default=30)
    args = parser.parse_args(argv)
    if args.poll_interval < 0 or args.max_polls < 1 or args.timeout <= 0:
        parser.error("poll interval must be non-negative and poll/timeout limits must be positive")
    return args


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    if not args.submit:
        print(json.dumps(build_payload(args), indent=2))
        return 0

    api_key = os.environ.get("MUAPI_API_KEY")
    if not api_key:
        print("MUAPI_API_KEY is required with --submit", file=sys.stderr)
        return 2
    try:
        result = submit_and_poll(args, api_key)
    except (urllib.error.URLError, RuntimeError, TimeoutError, ValueError) as error:
        print(f"MuAPI request failed: {error}", file=sys.stderr)
        return 1
    print(json.dumps(result, indent=2))
    return 0 if str(result.get("status", "")).lower() == "completed" else 1


if __name__ == "__main__":
    raise SystemExit(main())
