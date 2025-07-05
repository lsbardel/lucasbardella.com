import asyncio

from fluid.utils import log
from fluid.utils.dates import utcnow
from quantflow.data.deribit import Deribit

from lspy.observable import ZipArchive


async def fetch_data() -> None:
    currencies = ("btc", "eth")
    timestamp = utcnow().isoformat()
    with ZipArchive() as a:
        async with Deribit() as deribit:
            for currency in currencies:
                loader = await deribit.volatility_surface_loader(currency)
                vs = loader.surface()
                ts = vs.term_structure()
                a.add_json(
                    f"{currency}-spot.json",
                    dict(timestamp=timestamp, spot=str(vs.spot.mid)),
                )
                a.add_csv(f"{currency}-ts.csv", ts)


if __name__ == "__main__":
    log.config()
    asyncio.run(fetch_data())
