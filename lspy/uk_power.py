from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from pathlib import Path
from typing import TYPE_CHECKING

import boto3
import pandas as pd
from botocore.exceptions import ClientError
from fluid.utils import log

from lspy import settings

if TYPE_CHECKING:
    from types_boto3_s3.client import S3Client


logger = log.get_logger(__name__)


@dataclass
class Aws:
    s3: S3Client = field(default_factory=lambda: boto3.client("s3"))
    path: Path = settings.FILE_SYSTEM_BASE_PATH / "s3"
    bucket: str = settings.AWS_S3_BUCKET

    async def download(self, file_name: str) -> str | None:
        return await asyncio.get_event_loop().run_in_executor(
            None, self._download, file_name
        )

    def data_path(self, file_name: str) -> Path:
        self.path.mkdir(exist_ok=True, parents=True)
        return self.path / file_name

    def _download(self, file_name: str) -> str | None:
        path = self.data_path(file_name)
        try:
            self.s3.download_file(self.bucket, f"algo-trading/{path.name}", str(path))
        except ClientError as exc:
            if exc.response.get("Error", {}).get("Code") != "404":
                raise
            return None
        logger.info(f"downloaded {file_name} to {path}")
        return str(path)


@dataclass
class UKPower:
    aws: Aws = field(default_factory=Aws)
    file_name: str = "uk_daa2.csv"

    async def download(self) -> None:
        await self.aws.download(self.file_name)

    def data_frame(self) -> pd.DataFrame | None:
        path = self.aws.data_path(self.file_name)
        if not path.exists():
            return None
        return pd.read_csv(path, parse_dates=["trading_date", "delivery_date"])

    def daily(self, df: pd.DataFrame) -> pd.DataFrame:
        avg = df.groupby("trading_date")["price"].mean().reset_index()
        avg.columns = ["trading_date", "price"]  # type: ignore
        # To convert prices from £/MWh to p/kWh, you need to multiply the prices by 10.
        # This is because £1/MWh is equivalent to 0.1 p/kWh
        # (since 1 MWh = 1000 kWh and £1 = 100 pence).
        avg["price_pkwh"] = 10 * avg["price"]
        avg["london"] = 1.2389 * avg["price_pkwh"] + 11.5631
        return avg
