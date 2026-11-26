"""Turn an ordered, visible HTML lesson into a click-by-click recording manifest."""
import argparse
import json
import math
import os
import re
import tempfile
from pathlib import Path


def load_lesson(path):
    source = path.read_text(encoding="utf-8-sig").strip()
    if source.startswith("window.lesson"):
        assignment = re.fullmatch(r"window\.lesson\s*=\s*(\{.*\})\s*;?\s*", source, re.S)
        if not assignment:
            raise ValueError("Expected one window.lesson assignment with a JSON object")
        source = assignment.group(1)
    data = json.loads(source)
    if not isinstance(data, dict) or not isinstance(data.get("slides"), list) or not data["slides"]:
        raise ValueError("Expected an object with a nonempty ordered list of visible slides")
    return data["slides"]


def clock_seconds(value):
    fields = [int(n) for n in value.split(":")]
    if fields[-1] >= 60 or (len(fields) == 3 and fields[1] >= 60):
        raise ValueError(f"Invalid timestamp {value}")
    total = 0
    for field in fields:
        total = 60 * total + field
    return total


def duration(step, cursor):
    value = step.get("seconds")
    if value is not None and (type(value) not in (int, float) or not math.isfinite(value) or value <= 0):
        raise ValueError("seconds must be a positive finite number")
    pace = step.get("pace", "")
    if not isinstance(pace, str):
        raise ValueError("pace must be text")
    if re.match(r"^\s*\d+:", pace):
        stamp = r"(\d+:\d{2}(?::\d{2})?)"
        span = re.match(r"^\s*" + stamp + r"\s*[-–—~～至]\s*" + stamp + r"(?![\d:.])", pace)
        if not span:
            raise ValueError("Invalid starting time range in pace")
        start, end = map(clock_seconds, span.groups())
        if not math.isclose(start, cursor, rel_tol=0, abs_tol=1e-8) or end <= start:
            raise ValueError(f"Expected a continuous range from {cursor:g} seconds, found {start}..{end}")
        if value is not None and not math.isclose(value, end - start, rel_tol=0, abs_tol=1e-8):
            raise ValueError("seconds and pace disagree")
        value = end - start
    if value is None:
        raise ValueError("Provide seconds or a time range at the start of pace")
    return value


def make_manifest(slides):
    records = []
    cursor = 0
    for page, slide in enumerate(slides, 1):
        if not isinstance(slide, dict):
            raise ValueError(f"P{page}: expected a slide object")
        if slide.get("hidden"):
            raise ValueError(f"P{page}: supply the visible running order of the final presentation")
        steps = slide.get("steps", [slide])
        if not isinstance(steps, list) or not steps:
            raise ValueError(f"P{page}: include the visible entry state")
        for index, step in enumerate(steps, 1):
            if not isinstance(step, dict):
                raise ValueError(f"P{page}.{index}: expected a step object")
            try:
                seconds = duration(step, cursor)
            except ValueError as exc:
                raise ValueError(f"P{page}.{index}: {exc}") from exc
            row = {k: slide[k] for k in ("section", "sub", "doi", "cite") if k in slide}
            row.update(step)
            row.update(id=f"{page:02d}-{index}", slide=page, step=index, ppt_slide=len(records) + 1,
                       title=slide.get("title", ""), seconds=seconds,
                       start_seconds=cursor, end_seconds=cursor + seconds)
            for field in ("caption", "note", "board", "pace"):
                row.setdefault(field, "")
                if not isinstance(row[field], str):
                    raise ValueError(f"P{page}.{index}: {field} must be text")
            records.append(row)
            cursor += seconds
    return records


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("lesson", type=Path, help="lesson JSON or a JS file containing one window.lesson JSON assignment")
    parser.add_argument("output", type=Path, help="output steps.json")
    parser.add_argument("--expected-seconds", type=float, help="optional rehearsal budget in seconds")
    args = parser.parse_args()
    try:
        if args.lesson.resolve() == args.output.resolve():
            raise ValueError("Choose an output path different from the lesson source")
        slides = load_lesson(args.lesson)
        records = make_manifest(slides)
        total = records[-1]["end_seconds"]
        if args.expected_seconds is not None and not math.isclose(total, args.expected_seconds, rel_tol=0, abs_tol=1e-8):
            raise ValueError(f"Expected {args.expected_seconds:g} seconds, got {total:g}")
        args.output.parent.mkdir(parents=True, exist_ok=True)
        payload = json.dumps(records, ensure_ascii=False, indent=2, allow_nan=False) + "\n"
        with tempfile.NamedTemporaryFile(dir=args.output.parent, delete=False) as out:
            tmp = Path(out.name)
        try:
            tmp.write_text(payload, encoding="utf-8")
            os.replace(tmp, args.output)
        finally:
            tmp.unlink(missing_ok=True)
    except (OSError, ValueError) as exc:
        parser.exit(1, f"{exc}\n")
    print(f"{len(slides)} pages, {len(records)} states, {total:g} seconds")


if __name__ == "__main__":
    main()
