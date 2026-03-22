from __future__ import annotations

import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent
SERVICES_ROOT = REPO_ROOT / "services"
SERVICE_PATHS = {
    "auth_service": SERVICES_ROOT / "auth_service",
    "marketplace_service": SERVICES_ROOT / "marketplace_service",
    "operations_service": SERVICES_ROOT / "operations_service",
    "notification_service": SERVICES_ROOT / "notification_service",
}
_ACTIVE_SERVICE_ROOT: Path | None = None


def _activate_service_for_path(path_like: object, *, reset_modules: bool) -> None:
    global _ACTIVE_SERVICE_ROOT
    path = Path(str(path_like)).resolve()
    target_root: Path | None = None
    for service_name, service_root in SERVICE_PATHS.items():
        if service_root in path.parents or path == service_root:
            target_root = service_root
            break
    if target_root is None:
        return

    for entry in list(sys.path):
        try:
            resolved = Path(entry).resolve()
        except Exception:
            continue
        if resolved.parent == SERVICES_ROOT and resolved.name.endswith("_service"):
            sys.path.remove(entry)

    sys.path.insert(0, str(target_root))

    if reset_modules and target_root != _ACTIVE_SERVICE_ROOT:
        for module_name in list(sys.modules):
            if module_name == "app" or module_name.startswith("app."):
                del sys.modules[module_name]
    _ACTIVE_SERVICE_ROOT = target_root


def pytest_ignore_collect(collection_path: Path, config) -> bool:
    _activate_service_for_path(collection_path, reset_modules=True)
    return False


def pytest_collect_file(file_path: Path, parent):
    _activate_service_for_path(file_path, reset_modules=True)
    return None
