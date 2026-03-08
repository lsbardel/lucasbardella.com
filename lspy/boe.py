from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from lspy import settings


@dataclass
class BoE:
    url: str = f"{settings.TRADING_DATA_URL}/boe_nominal_rates.parquet"

    def data_frame(self) -> pd.DataFrame:
        return pd.read_parquet(self.url)
