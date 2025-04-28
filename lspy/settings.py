import os
from pathlib import Path

# File system
FILE_SYSTEM_BASE_PATH: Path = Path(
    os.getenv(
        "FILE_SYSTEM_BASE_PATH",
        str(Path(__file__).parent.parent / ".data"),
    )
)


TRADING_DATA_URL: str = os.getenv(
    "TRADING_DATA_URL",
    "",
)
