#!/usr/bin/env python3
import json
import os
import base64
import shlex
import subprocess
import sys
import tempfile
from pathlib import Path


def read_job():
    raw = sys.stdin.read().strip() or os.environ.get("SOUNDLY_JOB_JSON", "{}")
    return json.loads(raw)


def structured_prompt(job):
    prompt = job.get("prompt", "").strip()
    style = job.get("style", "").strip()
    if "[" in prompt and "]" in prompt:
        return prompt

    genre = ", ".join(part for part in [style, prompt] if part)
    if "no vocal" in prompt.lower() or "instrumental" in prompt.lower():
        return f"[Genre] {genre}\n\n[verse]\nInstrumental section with realistic arrangement, coherent melody, and no lead vocal."

    return (
        f"[Genre] {genre}\n\n"
        "[verse]\n"
        "A clear opening phrase sets the scene with natural vocal phrasing.\n\n"
        "[chorus]\n"
        "A memorable hook rises with fuller accompaniment and realistic song structure."
    )


def main():
    job = read_job()
    template = os.environ.get("YUE_COMMAND_TEMPLATE")
    if not template:
        raise SystemExit("Missing YUE_COMMAND_TEMPLATE. Point it at your YuE inference command.")

    with tempfile.TemporaryDirectory(prefix="soundly-yue-") as tmp:
        tmpdir = Path(tmp)
        prompt_path = tmpdir / "lyrics.txt"
        output_path = tmpdir / "output.wav"
        prompt_path.write_text(structured_prompt(job), encoding="utf-8")

        values = {
            "prompt": shlex.quote(job.get("prompt", "")),
            "style": shlex.quote(job.get("style", "")),
            "duration": str(job.get("duration", 30)),
            "seed": shlex.quote(str(job.get("seed", ""))),
            "prompt_file": shlex.quote(str(prompt_path)),
            "output_path": shlex.quote(str(output_path)),
            "tmpdir": shlex.quote(str(tmpdir)),
        }
        command = template.format(**values)
        completed = subprocess.run(command, shell=True, text=True, capture_output=True, check=False)

        if completed.returncode != 0:
            raise SystemExit(completed.stderr or f"YuE command failed with exit code {completed.returncode}")

        if not output_path.exists():
            try:
                parsed = json.loads(completed.stdout)
                if parsed.get("audioPath") or parsed.get("audioUrl") or parsed.get("audioBase64"):
                    print(json.dumps({"model": "YuE", **parsed}))
                    return
            except json.JSONDecodeError:
                pass
            raise SystemExit(f"YuE command did not create {output_path}")

        print(json.dumps({
            "model": "YuE",
            "audioBase64": base64.b64encode(output_path.read_bytes()).decode("ascii"),
            "mimeType": "audio/wav",
            "duration": job.get("duration"),
        }))


if __name__ == "__main__":
    main()
