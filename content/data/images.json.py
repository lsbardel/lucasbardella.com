import asyncio
import json
import sys
from enum import StrEnum, auto

from fluid.utils import log
from fluid.utils.http_client import AioHttpClient


class ImageProvider(StrEnum):
    UNSPLASH = auto()
    PIXABAY = auto()


PHOTOS = (
    ("rust1", ImageProvider.UNSPLASH, "PEy4qZCLXss"),
    ("gold", ImageProvider.UNSPLASH, "jrA2l3JjD5k"),
    ("mario", ImageProvider.UNSPLASH, "_R95VMWyn7A"),
    ("vortex", ImageProvider.UNSPLASH, "BhZBnHzUQ7o"),
    ("thanks", ImageProvider.UNSPLASH, "NHDZEGauCig"),
    ("rust2", ImageProvider.PIXABAY, "3397227"),
    ("bwcharts", ImageProvider.PIXABAY, "1863880")
)


async def fetch_data() -> None:
    results = {}
    async with AioHttpClient() as client:
        for name, provider, photo in PHOTOS:
            data = await client.get(
                f"https://api.metablock.io/v1/photos/{provider.value}/{photo}"
            )
            results[name] = data
    sys.stdout.write(json.dumps(results, indent=2))


if __name__ == "__main__":
    log.config()
    asyncio.run(fetch_data())
