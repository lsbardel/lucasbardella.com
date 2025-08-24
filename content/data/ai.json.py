
from fluid.utils import log
import json
import sys
import yaml
from pathlib import Path

def fetch_data() -> None:
    yaml_path = Path(__file__).parent / "ai.yaml"
    with open(yaml_path, "r") as f:
        data = yaml.safe_load(f)
    sys.stdout.write(json.dumps(data, indent=2))


if __name__ == "__main__":
    log.config()
    fetch_data()
