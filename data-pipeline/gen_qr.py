"""
Generate the QR code SVG that encodes the live website URL. Output is
written to assets/img/qr-website.svg and styled with the Rouse petrol
brand colour.

Re-run any time WEBSITE_URL changes:

    .venv/bin/python data-pipeline/gen_qr.py
"""

from __future__ import annotations
from pathlib import Path

import qrcode
import qrcode.image.svg

WEBSITE_URL = "https://pmuscat41.github.io/Rouse-MENA_INFO/"
BRAND_COLOUR = "#007f9c"  # Rouse petrol

SCRIPT_DIR = Path(__file__).resolve().parent
OUTPUT = SCRIPT_DIR.parent / "assets" / "img" / "qr-website.svg"


def main() -> int:
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
        image_factory=qrcode.image.svg.SvgPathImage,
    )
    qr.add_data(WEBSITE_URL)
    qr.make(fit=True)
    img = qr.make_image()

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(str(OUTPUT))

    # Recolour: SvgPathImage emits a single <path> with the QR modules.
    # Replace the default fill with the brand petrol.
    text = OUTPUT.read_text()
    text = (
        text.replace('fill="#000000"', f'fill="{BRAND_COLOUR}"')
            .replace("fill='#000000'", f"fill='{BRAND_COLOUR}'")
    )
    # Fallback: some qrcode versions emit no fill attribute; add one to <path>.
    if BRAND_COLOUR not in text:
        text = text.replace("<path ", f'<path fill="{BRAND_COLOUR}" ', 1)
    OUTPUT.write_text(text)

    print(f"Wrote {OUTPUT.relative_to(SCRIPT_DIR.parent)}")
    print(f"  Encodes: {WEBSITE_URL}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
