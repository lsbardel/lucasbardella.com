import asyncio

import pandas as pd
from fluid.utils import log
from datetime import timedelta, date
from quantflow.data.fmp import FMP

from lspy.observable import ZipArchive


async def fetch_data() -> None:
    """
    Fetch financial data for the 'cutting through the noise' blog post.
    This fetches stock price data and fundamental metrics for comparison analysis.
    """
    # Major tech stocks for comparison
    symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "META", "TSLA", "NVDA"]
    today = date.today()
    start = today - timedelta(days=2*365)

    with ZipArchive() as archive:
        async with FMP() as fmp:

            # Fetch historical price data (1 year)
            for symbol in symbols:
                try:
                    # Get historical prices
                    prices = await fmp.prices(symbol, from_date=start)
                    if prices and "historical" in prices:
                        df = pd.DataFrame(prices["historical"])
                        df["date"] = pd.to_datetime(df["date"])
                        # Sort by date ascending and take last year
                        df = df.sort_values("date").tail(252)  # ~1 year of trading days
                        archive.add_csv(f"{symbol}-prices.csv", df)

                    # Get key financial ratios
                    ratios = await fmp.get_path(f"ratios/{symbol}")
                    if ratios:
                        df_ratios = pd.DataFrame(ratios[:4])  # Last 4 quarters
                        archive.add_csv(f"{symbol}-ratios.csv", df_ratios)

                except Exception as e:
                    log.warning(f"Failed to fetch data for {symbol}: {e}")

            # Fetch market indices for comparison
            indices = ["^GSPC", "^IXIC", "^VIX"]  # S&P 500, NASDAQ, VIX
            for index in indices:
                try:
                    prices = await fmp.get_path(f"historical-price-full/{index}")
                    if prices and "historical" in prices:
                        df = pd.DataFrame(prices["historical"])
                        df["date"] = pd.to_datetime(df["date"])
                        df = df.sort_values("date").tail(252)
                        archive.add_csv(f"{index.replace('^', '')}-prices.csv", df)
                except Exception as e:
                    log.warning(f"Failed to fetch data for {index}: {e}")


if __name__ == "__main__":
    log.config()
    asyncio.run(fetch_data())
