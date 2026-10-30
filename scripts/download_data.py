from __future__ import annotations

import time
from pathlib import Path
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"


def download(url: str, destination: Path, retries: int = 3) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    request = Request(url, headers={"User-Agent": "DSC5002-HK-Mortgage-Risk/1.0"})
    for attempt in range(1, retries + 1):
        try:
            with urlopen(request, timeout=60) as response:
                destination.write_bytes(response.read())
            print(f"downloaded {destination.name} ({destination.stat().st_size:,} bytes)")
            return
        except Exception:
            if attempt == retries:
                raise
            time.sleep(attempt)


def main() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    fixed_sources = {
        "hkma_T0307.xlsx": "https://www.hkma.gov.hk/media/eng/doc/market-data-and-statistics/monthly-statistical-bulletin/T0307.xlsx",
        "hkma_T0316.xlsx": "https://www.hkma.gov.hk/media/eng/doc/market-data-and-statistics/monthly-statistical-bulletin/T0316.xlsx",
        "hkma_T060302.xls": "https://www.hkma.gov.hk/media/eng/doc/market-data-and-statistics/monthly-statistical-bulletin/T060302.xls",
        "unemployment.json": "https://www.censtatd.gov.hk/api/get.php?id=210-06103&lang=en&full_series=1",
        "cpi_sections.json": "https://www.censtatd.gov.hk/api/get.php?id=510-60001A&lang=en&full_series=1",
    }
    for filename, url in fixed_sources.items():
        download(url, RAW / filename)

    for year in range(2018, 2026):
        for month in range(1, 13):
            filename = f"landreg_{year}{month:02d}.json"
            url = f"https://www.landreg.gov.hk/datagovhk/{year}{month:02d}_data.json"
            download(url, RAW / filename)


if __name__ == "__main__":
    main()
