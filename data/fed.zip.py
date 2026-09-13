import asyncio

from fluid.utils import log
from quantflow.data.fed import FederalReserve

from lspy.observable import ZipArchive


async def fetch_data() -> None:
    fed = FederalReserve()
    with ZipArchive() as a:
        df = await fed.yield_curves()
        a.add_csv("yield-curves.csv", df)
        df = await fed.ref_rates()
        a.add_csv("ref-rates.csv", df)


if __name__ == "__main__":
    log.config()
    asyncio.run(fetch_data())
