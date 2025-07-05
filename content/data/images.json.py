import asyncio
import json
import sys

from fluid.utils import log
from fluid.utils.http_client import AioHttpClient

PHOTOS = (
    ("rust1", "unsplash", "PEy4qZCLXss"),
    ("rust2", "pixabay", "3397227"),
)


async def fetch_data() -> None:
    results = {}
    async with AioHttpClient() as client:
        for name, provider, photo in PHOTOS:
            data = await client.get(
                f"https://api.metablock.io/v1/photos/{provider}/{photo}"
            )
            results[name] = data
    sys.stdout.write(json.dumps(results, indent=2))


if __name__ == "__main__":
    log.config()
    asyncio.run(fetch_data())
