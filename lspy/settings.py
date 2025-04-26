import os
from pathlib import Path

# File system
FILE_SYSTEM_BASE_PATH: Path = Path(
    os.getenv(
        "FILE_SYSTEM_BASE_PATH",
        str(Path(__file__).parent.parent / ".data"),
    )
)


AWS_S3_BUCKET: str = os.getenv(
    "AWS_S3_BUCKET",
    "assets.metablock.io",
)
