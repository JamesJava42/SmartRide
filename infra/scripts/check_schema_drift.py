from __future__ import annotations

import asyncio
import importlib
import subprocess
import sys
from pathlib import Path

from sqlalchemy import inspect
from sqlalchemy.ext.asyncio import create_async_engine


ROOT = Path(__file__).resolve().parents[2]
SERVICE_CONFIGS = [
    ("auth_service", "auth_schema", ROOT / "services" / "auth_service"),
    ("marketplace_service", "marketplace_schema", ROOT / "services" / "marketplace_service"),
    ("operations_service", "operations_schema", ROOT / "services" / "operations_service"),
    ("notification_service", "notification_schema", ROOT / "services" / "notification_service"),
]
SERVICE_MAP = {service_name: (schema_name, service_root) for service_name, schema_name, service_root in SERVICE_CONFIGS}


def _purge_app_modules() -> None:
    for module_name in list(sys.modules):
        if (
            module_name == "app"
            or module_name.startswith("app.")
            or module_name == "shared"
            or module_name.startswith("shared.")
        ):
            del sys.modules[module_name]


async def _collect_issues(service_root: Path, schema_name: str) -> list[str]:
    sys.path.insert(0, str(service_root))
    try:
        importlib.import_module("app.models")
        db_base = importlib.import_module("app.db.base")
        config = importlib.import_module("app.config")

        metadata = db_base.Base.metadata
        engine = create_async_engine(config.settings.database_url)

        async with engine.connect() as conn:
            def collect(sync_conn):
                inspector = inspect(sync_conn)
                dialect = sync_conn.dialect

                def type_str(sql_type) -> str:
                    try:
                        return sql_type.compile(dialect=dialect)
                    except Exception:
                        return str(sql_type)

                model_tables = {table.name: table for table in metadata.tables.values() if table.schema == schema_name}
                db_tables = set(inspector.get_table_names(schema=schema_name))
                issues: list[str] = []

                for table_name in sorted(set(model_tables) - db_tables):
                    issues.append(f"MISSING_TABLE {schema_name}.{table_name}")
                for table_name in sorted(db_tables - set(model_tables)):
                    issues.append(f"EXTRA_TABLE {schema_name}.{table_name}")

                for table_name in sorted(set(model_tables) & db_tables):
                    model_table = model_tables[table_name]
                    model_columns = {column.name: column for column in model_table.columns}
                    db_columns = {column["name"]: column for column in inspector.get_columns(table_name, schema=schema_name)}

                    for column_name in sorted(set(model_columns) - set(db_columns)):
                        issues.append(f"MISSING_COLUMN {schema_name}.{table_name}.{column_name}")
                    for column_name in sorted(set(db_columns) - set(model_columns)):
                        issues.append(f"EXTRA_COLUMN {schema_name}.{table_name}.{column_name}")

                    for column_name in sorted(set(model_columns) & set(db_columns)):
                        model_column = model_columns[column_name]
                        db_column = db_columns[column_name]
                        model_type = type_str(model_column.type).lower()
                        db_type = type_str(db_column["type"]).lower()
                        if model_type != db_type:
                            issues.append(
                                f"TYPE_MISMATCH {schema_name}.{table_name}.{column_name} "
                                f"model={model_type} db={db_type}"
                            )
                        if bool(model_column.nullable) != bool(db_column["nullable"]):
                            issues.append(
                                f"NULLABLE_MISMATCH {schema_name}.{table_name}.{column_name} "
                                f"model={bool(model_column.nullable)} db={bool(db_column['nullable'])}"
                            )

                return issues

            issues = await conn.run_sync(collect)

        await engine.dispose()
        return issues
    finally:
        sys.path.pop(0)
        _purge_app_modules()


async def _run_single_service(service_name: str) -> int:
    schema_name, service_root = SERVICE_MAP[service_name]
    issues = await _collect_issues(service_root, schema_name)
    if not issues:
        print(f"[schema-drift] {service_name} ({schema_name}): OK")
        return 0

    print(f"[schema-drift] {service_name} ({schema_name}): FAIL")
    for issue in issues:
        print(f"  - {issue}")
    return 1


def main() -> int:
    if len(sys.argv) == 3 and sys.argv[1] == "--service":
        return asyncio.run(_run_single_service(sys.argv[2]))

    exit_code = 0
    for service_name, _, _ in SERVICE_CONFIGS:
        result = subprocess.run(
            [sys.executable, __file__, "--service", service_name],
            cwd=ROOT,
            check=False,
            capture_output=True,
            text=True,
        )
        if result.stdout:
            print(result.stdout, end="")
        if result.stderr:
            print(result.stderr, end="", file=sys.stderr)
        if result.returncode != 0:
            exit_code = result.returncode

    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
