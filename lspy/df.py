from typing import Sequence

import pandas as pd

DEFAULT_INCLUDES = ("datetime64[ns, UTC]", "datetime64[ns]")


def format_date(
    df: pd.DataFrame, include: Sequence[str] = DEFAULT_INCLUDES
) -> pd.DataFrame:
    timestamp_cols = df.select_dtypes(include=tuple(include)).columns  # type: ignore
    for column in timestamp_cols:
        df[column] = df[column].apply(lambda d: d.isoformat(timespec="milliseconds"))
    return df
