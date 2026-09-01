"""Minimal Ollama client, standard library only.

No `requests`, no `ollama` package: this machine has 7.8 GB of RAM and the
harness competes with the model for it. A dependency-free client also means the
published harness runs for anyone with Python 3.9+ and Ollama, which is the
point of shipping it alongside the post.

Timing comes from Ollama's own response metrics rather than wall-clock around
the call, so it excludes HTTP overhead:
  load_duration        model load (0 when already resident)
  prompt_eval_duration time to process the prompt = time to first token
  eval_duration        time generating, over eval_count tokens
"""

from __future__ import annotations

import json
import urllib.error
import urllib.request
from dataclasses import dataclass

DEFAULT_HOST = "http://localhost:11434"

# Nanoseconds per second — Ollama reports every duration in ns.
NS = 1_000_000_000


class OllamaError(RuntimeError):
    pass


@dataclass(frozen=True)
class Generation:
    """One model response plus the metrics needed to report cost and speed."""

    text: str
    model: str
    ttft_s: float
    eval_s: float
    total_s: float
    prompt_tokens: int
    eval_tokens: int

    @property
    def tokens_per_s(self) -> float:
        return self.eval_tokens / self.eval_s if self.eval_s > 0 else 0.0


class OllamaClient:
    def __init__(self, host: str = DEFAULT_HOST, timeout: int = 600) -> None:
        self.host = host.rstrip("/")
        # Generous: a 4B model on a thermally throttled laptop GPU can take
        # minutes for a long generation, and a timeout mid-batch costs the run.
        self.timeout = timeout

    def _post(self, path: str, payload: dict) -> dict:
        request = urllib.request.Request(
            f"{self.host}{path}",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.URLError as exc:
            raise OllamaError(
                f"Could not reach Ollama at {self.host}. Is `ollama serve` running? ({exc})"
            ) from exc

    def generate(
        self,
        model: str,
        prompt: str,
        *,
        seed: int,
        num_ctx: int = 2048,
        num_predict: int = 512,
    ) -> Generation:
        """One deterministic-as-possible generation.

        temperature 0 alone is not deterministic — GPU floating-point reduction
        order varies between runs — so seed and num_ctx are set explicitly too.
        Even then, expect occasional divergence; that is why the caller repeats
        each prompt and reports variance rather than trusting a single answer.
        """
        data = self._post(
            "/api/generate",
            {
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0,
                    "seed": seed,
                    "num_ctx": num_ctx,
                    "num_predict": num_predict,
                },
            },
        )
        if "response" not in data:
            raise OllamaError(f"Unexpected response from Ollama: {data}")

        return Generation(
            text=data["response"],
            model=model,
            ttft_s=(data.get("load_duration", 0) + data.get("prompt_eval_duration", 0)) / NS,
            eval_s=data.get("eval_duration", 0) / NS,
            total_s=data.get("total_duration", 0) / NS,
            prompt_tokens=data.get("prompt_eval_count", 0),
            eval_tokens=data.get("eval_count", 0),
        )

    def available_models(self) -> list[str]:
        request = urllib.request.Request(f"{self.host}/api/tags", method="GET")
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                data = json.loads(response.read().decode("utf-8"))
        except urllib.error.URLError as exc:
            raise OllamaError(f"Could not reach Ollama at {self.host}. ({exc})") from exc
        return [m["name"] for m in data.get("models", [])]

    def unload(self, model: str) -> None:
        """Evict a model from memory.

        With 4 GB of VRAM only one model fits at a time; leaving the previous
        one resident is what turns the next load into a swap storm.
        """
        try:
            self._post("/api/generate", {"model": model, "prompt": "", "keep_alive": 0})
        except OllamaError:
            pass
