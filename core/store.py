"""
Session & entity storage backed by plain JSON files in the data/ directory.
No database required — works out of the box with zero setup.
"""
from __future__ import annotations

import json
import random
import string
import threading
import time
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

_locks: dict[str, threading.Lock] = {}


def _lock_for(name: str) -> threading.Lock:
    if name not in _locks:
        _locks[name] = threading.Lock()
    return _locks[name]


def _generate_id() -> str:
    ts = int(time.time() * 1000)
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=9))
    return f"{ts}_{suffix}"


def _now_iso() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


class EntityStore:
    """Simple CRUD store backed by a JSON file."""

    def __init__(self, collection_name: str) -> None:
        self.name = collection_name
        self.file = DATA_DIR / f"{collection_name}.json"

    # ── internal ─────────────────────────────────────────────────────────────

    def _load(self) -> list[dict]:
        if not self.file.exists():
            return []
        try:
            return json.loads(self.file.read_text(encoding="utf-8"))
        except Exception:
            return []

    def _save(self, items: list[dict]) -> None:
        self.file.write_text(
            json.dumps(items, indent=2, ensure_ascii=False), encoding="utf-8"
        )

    # ── public API ────────────────────────────────────────────────────────────

    def create(self, data: dict) -> dict:
        # 'id' and 'created_date' are always system-generated; any values
        # supplied in `data` for these keys are intentionally overwritten.
        item = {**data, "id": _generate_id(), "created_date": _now_iso()}
        with _lock_for(self.name):
            items = self._load()
            items.append(item)
            self._save(items)
        return item

    def update(self, item_id: str, data: dict) -> dict | None:
        with _lock_for(self.name):
            items = self._load()
            for i, item in enumerate(items):
                if item.get("id") == item_id:
                    items[i] = {**item, **data}
                    self._save(items)
                    return items[i]
        return None

    def get(self, item_id: str) -> dict | None:
        for item in self._load():
            if item.get("id") == item_id:
                return item
        return None

    def list(self, sort_field: str = "-created_date", limit: int = 30) -> list[dict]:
        items = self._load()
        descending = sort_field.startswith("-")
        field = sort_field.lstrip("-")
        items.sort(key=lambda x: str(x.get(field, "")), reverse=descending)
        return items[:limit]

    def delete(self, item_id: str) -> bool:
        with _lock_for(self.name):
            items = self._load()
            before = len(items)
            items = [i for i in items if i.get("id") != item_id]
            if len(items) < before:
                self._save(items)
                return True
        return False

    def bulk_create(self, data_list: list[dict]) -> list[dict]:
        now = _now_iso()
        created = [{**d, "id": _generate_id(), "created_date": now} for d in data_list]
        with _lock_for(self.name):
            items = self._load()
            items.extend(created)
            self._save(items)
        return created


# ── Singleton stores ──────────────────────────────────────────────────────────

query_sessions = EntityStore("query_sessions")
knowledge_nodes = EntityStore("knowledge_nodes")
document_entries = EntityStore("document_entries")
