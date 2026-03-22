from __future__ import annotations

import bcrypt


class PasswordService:
    def hash_password(self, password: str) -> str:
        return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    def verify_password(self, plain_password: str, password_hash: str) -> bool:
        return bcrypt.checkpw(plain_password.encode("utf-8"), password_hash.encode("utf-8"))


password_service = PasswordService()
