"""Generates the app's recordings with Kokoro-82M (Apache 2.0) through kokoro-onnx.

Usage: py -3.10 scripts/audio/generate.py <jobs.json> <out dir> <timings.json>
Run through `npm run content:audio`, which writes the jobs. Sets up its venv and model files
the first time (scripts/audio/.venv and scripts/audio/models, both ignored by git).
"""
import json
import os
import subprocess
import sys
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
VENV = HERE / '.venv'
MODELS = HERE / 'models'
RELEASE = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0'
MODEL_FILES = ['kokoro-v1.0.onnx', 'voices-v1.0.bin']
SAMPLE_RATE = 24000
# Opus at about 24 kbps: clear speech at a quarter of the default size
COMPRESSION = 0.93


def venv_python() -> Path:
    return VENV / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python')


def ensure_setup() -> None:
    """Re-runs this script inside the venv, creating it and fetching the model if needed."""
    if Path(sys.executable).resolve() == venv_python().resolve():
        return
    if not venv_python().exists():
        subprocess.check_call([sys.executable, '-m', 'venv', str(VENV)])
        subprocess.check_call([str(venv_python()), '-m', 'pip', 'install', '-q', '-r', str(HERE / 'requirements.txt')])
    MODELS.mkdir(exist_ok=True)
    for name in MODEL_FILES:
        if not (MODELS / name).exists():
            print(f'Downloading {name}...')
            urllib.request.urlretrieve(f'{RELEASE}/{name}', MODELS / name)
    sys.exit(subprocess.call([str(venv_python()), __file__, *sys.argv[1:]]))


def main() -> None:
    import numpy as np
    import soundfile as sf
    from kokoro_onnx import Kokoro

    jobs_file, out_dir, timings_file = sys.argv[1:4]
    jobs = json.loads(Path(jobs_file).read_text(encoding='utf-8'))
    kokoro = Kokoro(str(MODELS / 'kokoro-v1.0.onnx'), str(MODELS / 'voices-v1.0.bin'))
    timings: dict[str, list[float]] = {}

    for n, job in enumerate(jobs, 1):
        chunks, starts, at = [], [], 0.0
        for seg in job['segments']:
            samples, _ = kokoro.create(seg['text'], voice=seg['voice'], speed=job['rate'], lang=seg['lang'])
            starts.append(round(at, 2))
            silence = np.zeros(int(seg['pause'] * SAMPLE_RATE), dtype=np.float32)
            chunks += [samples.astype(np.float32), silence]
            at += (len(samples) + len(silence)) / SAMPLE_RATE
        audio = np.concatenate(chunks)
        sf.write(Path(out_dir) / f"{job['key']}.ogg", audio, SAMPLE_RATE, format='OGG', subtype='OPUS', compression_level=COMPRESSION)
        if job['kind'] == 'story':
            timings[job['key']] = starts
        print(f"[{n}/{len(jobs)}] {job['key']} {job['kind']} {at:.1f}s", flush=True)

    Path(timings_file).write_text(json.dumps(timings), encoding='utf-8')


if __name__ == '__main__':
    ensure_setup()
    main()
