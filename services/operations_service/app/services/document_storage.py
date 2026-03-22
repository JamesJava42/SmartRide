from __future__ import annotations

import mimetypes
import re
from dataclasses import dataclass
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.config import settings


class DocumentStorageError(Exception):
    pass


@dataclass
class StoredDocumentFile:
    file_path: str
    original_file_name: str
    mime_type: str
    file_size: int


class LocalDocumentStorage:
    allowed_extensions: dict[str, set[str]] = {
        ".pdf": {"application/pdf"},
        ".png": {"image/png"},
        ".jpg": {"image/jpeg"},
        ".jpeg": {"image/jpeg"},
        ".webp": {"image/webp"},
    }

    def __init__(self, media_root: str, max_size_bytes: int) -> None:
        self.media_root = Path(media_root).resolve()
        self.max_size_bytes = max_size_bytes
        self.media_root.mkdir(parents=True, exist_ok=True)

    async def save_upload(
        self,
        *,
        entity_type: str,
        owner_id: str,
        document_type: str,
        file: UploadFile,
    ) -> StoredDocumentFile:
        raw = await file.read()
        if not raw:
            raise DocumentStorageError("Document file is required")
        if len(raw) > self.max_size_bytes:
            raise DocumentStorageError(f"Document exceeds {self.max_size_bytes // (1024 * 1024)} MB size limit")

        original_name = file.filename or "document"
        extension = Path(original_name).suffix.lower()
        if extension not in self.allowed_extensions:
            allowed = ", ".join(sorted(self.allowed_extensions))
            raise DocumentStorageError(f"Unsupported document type. Allowed: {allowed}")

        mime_type = file.content_type or mimetypes.guess_type(original_name)[0] or "application/octet-stream"
        if mime_type not in self.allowed_extensions[extension]:
            raise DocumentStorageError("Unsupported MIME type for the selected file")

        safe_owner_id = re.sub(r"[^a-zA-Z0-9_-]", "", owner_id) or "unknown"
        safe_original_name = self._sanitize_file_name(original_name)
        unique_name = f"{document_type.lower()}-{uuid4().hex}{extension}"
        relative_path = Path(entity_type) / safe_owner_id / unique_name
        absolute_path = self.media_root / relative_path
        absolute_path.parent.mkdir(parents=True, exist_ok=True)
        absolute_path.write_bytes(raw)

        return StoredDocumentFile(
            file_path=relative_path.as_posix(),
            original_file_name=safe_original_name,
            mime_type=mime_type,
            file_size=len(raw),
        )

    def delete(self, relative_path: str | None) -> None:
        if not relative_path:
            return
        absolute_path = self.resolve(relative_path)
        if absolute_path.exists():
            absolute_path.unlink()

    def resolve(self, relative_path: str) -> Path:
        candidate = (self.media_root / relative_path).resolve()
        if self.media_root not in candidate.parents and candidate != self.media_root:
            raise DocumentStorageError("Invalid file path")
        return candidate

    @staticmethod
    def _sanitize_file_name(value: str) -> str:
        normalized = re.sub(r"[^a-zA-Z0-9._-]+", "_", value).strip("._")
        return normalized or "document"


document_storage = LocalDocumentStorage(settings.media_root, settings.document_max_size_bytes)
