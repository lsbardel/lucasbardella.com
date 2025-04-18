import asyncio

import pandas as pd
from fluid.utils import log
from quantflow.data.fmp import FMP

from lspy.observable import to_csv


async def fetch_data() -> None:
    async with FMP(url="https://financialmodelingprep.com/stable") as fmp:
        d = await fmp.get_path("market-risk-premium")
        to_csv(pd.DataFrame(d))


if __name__ == "__main__":
    log.config()
    asyncio.run(fetch_data())
