
from fluid.utils import log

from lspy.observable import ZipArchive
from lspy.uk_power import UKPower


def fetch_data() -> None:
    uk_power = UKPower()
    df = uk_power.data_frame()
    if df is not None:
        with ZipArchive() as a:
            a.add_csv("uk_power.csv", df)
            a.add_csv("daily.csv", uk_power.daily(df))


if __name__ == "__main__":
    log.config()
    fetch_data()
