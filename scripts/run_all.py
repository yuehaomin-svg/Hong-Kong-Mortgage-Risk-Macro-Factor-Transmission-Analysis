from __future__ import annotations

import sys

from build_dashboard_data import build as build_dashboard
from build_dataset import build as build_dataset


def main() -> None:
    if "--refresh" in sys.argv:
        from download_data import main as download_data

        download_data()
    build_dataset()
    build_dashboard()


if __name__ == "__main__":
    main()
