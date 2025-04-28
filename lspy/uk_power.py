from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from lspy import settings


@dataclass
class UKPower:
    url: str = f"{settings.TRADING_DATA_URL}/uk_daa2.csv"

    def data_frame(self) -> pd.DataFrame | None:
        return pd.read_csv(self.url, parse_dates=["trading_date", "delivery_date"])

    def daily(self, df: pd.DataFrame) -> pd.DataFrame:
        avg = df.groupby("trading_date")["price"].mean().reset_index()
        avg.columns = ["trading_date", "price"]  # type: ignore
        # To convert prices from £/MWh to p/kWh, you need to multiply the prices by 10.
        # This is because £1/MWh is equivalent to 0.1 p/kWh
        # (since 1 MWh = 1000 kWh and £1 = 100 pence).
        avg["price_pkwh"] = 10 * avg["price"]
        avg["london"] = 1.2389 * avg["price_pkwh"] + 11.5631
        return avg
