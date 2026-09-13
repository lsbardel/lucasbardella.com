import pandas as pd
from fluid.utils import log

from lspy import settings
from lspy.observable import to_csv

if __name__ == "__main__":
    log.config()
    df = pd.read_parquet(f"{settings.TRADING_DATA_URL}/boe_nominal_rates.parquet")
    to_csv(df)
