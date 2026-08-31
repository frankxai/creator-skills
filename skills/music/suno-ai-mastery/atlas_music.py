#!/usr/bin/env python3
"""Submit an opt-in Suno music request through Atlas Cloud."""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request
from typing import Any


API_BASE = "https://api.atlascloud.ai/api/v1"
DEFAULT_MODEL = "suno/chirp-v4-5-all"
TERMINAL_STATUSES = {"completed", "failed"}


def build_payload(args: argparse.Namespace) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "model": args.model,
        "prompt": args.prompt,
        "custom": args.custom,
        "instrumental": args.instrumental,
    }
    optional = {
        "vocal_gender": args.vocal_gender,
        "title": args.title,
        "style": args.style,
        "negative_tags": args.negative_tags,
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
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "creator-skills-atlas-music/1.0",
        },
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return json.load(response)


def submit_and_poll(args: argparse.Namespace, api_key: str) -> dict[str, Any]:
    # The paid submission is deliberately attempted once; only read-only polling repeats.
    created = request_json(
        f"{API_BASE}/model/generateAudio",
        api_key=api_key,
        method="POST",
        payload=build_payload(args),
        timeout=args.timeout,
    )
    prediction = created.get("data", created)
    request_id = prediction.get("id")
    if not request_id:
        raise RuntimeError("Atlas Cloud did not return a prediction id")

    latest = prediction
    for attempt in range(args.max_polls):
        if str(latest.get("status", "")).lower() in TERMINAL_STATUSES:
            return latest
        if attempt:
            time.sleep(args.poll_interval)
        response = request_json(
            f"{API_BASE}/model/prediction/{request_id}",
            api_key=api_key,
            timeout=args.timeout,
        )
        latest = response.get("data", response)
    raise TimeoutError(f"prediction {request_id} did not finish within the polling limit")


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build a Suno request and optionally submit it through Atlas Cloud."
    )
    parser.add_argument("prompt", help="Song description, or lyrics when --custom is set")
    parser.add_argument("--model", default=DEFAULT_MODEL)
    parser.add_argument("--custom", action="store_true", help="Treat the prompt as lyrics")
    parser.add_argument("--instrumental", action="store_true")
    parser.add_argument("--vocal-gender", choices=("Male", "Female"))
    parser.add_argument("--title")
    parser.add_argument("--style")
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

    api_key = os.environ.get("ATLASCLOUD_API_KEY")
    if not api_key:
        print("ATLASCLOUD_API_KEY is required with --submit", file=sys.stderr)
        return 2
    try:
        result = submit_and_poll(args, api_key)
    except (urllib.error.URLError, RuntimeError, TimeoutError, ValueError) as error:
        print(f"Atlas Cloud request failed: {error}", file=sys.stderr)
        return 1
    print(json.dumps(result, indent=2))
    return 0 if str(result.get("status", "")).lower() == "completed" else 1


if __name__ == "__main__":
    raise SystemExit(main())
