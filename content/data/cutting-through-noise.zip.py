import asyncio
from datetime import date

import pandas as pd
from fluid.utils import log
from quantflow.data.fmp import FMP

from lspy.observable import ZipArchive

SYMBOLS = ["AAPL", "GOOGL", "MSFT", "AMZN", "META", "TSLA", "NVDA"]
START = date(2020, 1, 1)


async def fetch_data() -> None:
    frames = []
    async with FMP() as fmp:
        for symbol in SYMBOLS:
            df = await fmp.prices(symbol, from_date=START, convert_to_date=True)
            if not df.empty:
                df["symbol"] = symbol
                frames.append(df)

    if frames:
        combined = pd.concat(frames).sort_values(["symbol", "date"])
        with ZipArchive() as archive:
            archive.add_csv("prices.csv", combined)


if __name__ == "__main__":
    log.config()
    asyncio.run(fetch_data())
