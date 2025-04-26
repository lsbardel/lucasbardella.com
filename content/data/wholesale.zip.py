import asyncio

from fluid.utils import log

from lspy.observable import ZipArchive
from lspy.uk_power import UKPower


async def fetch_data() -> None:
    uk_power = UKPower()
    await uk_power.download()
    df = uk_power.data_frame()
    if df is not None:
        with ZipArchive() as a:
            a.add_csv("uk_power.csv", df)
            a.add_csv("daily.csv", uk_power.daily(df))


if __name__ == "__main__":
    log.config()
    asyncio.run(fetch_data())
