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
                # get the folatility loader
                loader = await deribit.volatility_surface_loader(currency)
                # build the volatility surface
                vs = loader.surface()
                # add spot/perpetual price
                a.add_json(
                    f"{currency}-spot.json",
                    dict(timestamp=timestamp, spot=str(vs.spot.mid)),
                )
                # get the forward term structure
                ts = vs.term_structure()
                a.add_csv(f"{currency}-ts.csv", ts)
                # evaluate black-scholes implied volatilities
                vs.bs()
                ops = vs.disable_outliers(0.95).options_df()
                a.add_csv(f"{currency}-ops.csv", ops)


if __name__ == "__main__":
    log.config()
    asyncio.run(fetch_data())
