import io
import json
import sys
import zipfile
from dataclasses import dataclass, field
from typing import Any, Self

import pandas as pd

from .df import format_date


def to_csv(df: pd.DataFrame, index: bool = False) -> None:
    format_date(df).to_csv(sys.stdout, index=index)


@dataclass
class ZipArchive:
    zip_buffer: io.BytesIO = field(default_factory=io.BytesIO)
    data: list[tuple[str, str]] = field(default_factory=list)

    def __enter__(self) -> Self:
        return self

    def __exit__(self, exc_type: Any, exc_value: Any, traceback: Any) -> None:
        self.write()

    def add_csv(
        self,
        name: str,
        df: pd.DataFrame,
        index: bool = False,
        **kwargs: Any,
    ) -> None:
        self.data.append((name, format_date(df).to_csv(index=index, **kwargs)))

    def add_json(
        self,
        name: str,
        data: Any,
    ) -> None:
        self.data.append((name, json.dumps(data)))

    def write(self) -> None:
        with zipfile.ZipFile(self.zip_buffer, "w") as zip_file:
            for name, data in self.data:
                zip_file.writestr(name, data)
        sys.stdout.buffer.write(self.zip_buffer.getvalue())
