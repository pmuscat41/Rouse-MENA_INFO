"""
Generate the QR code assets for the Rouse MEA Patent Filing Hub.

Encodes two URLs:
  1. WEBSITE_URL  — the live GitHub Pages site (petrol)
  2. FORMS_URL    — the Microsoft Forms registration that gates the fee
                    schedules (green)

Outputs four files in assets/img/:
  - qr-website.svg     scalable, used on the page
  - qr-website.png     ~600px raster, easy to attach to email / paste into PPT
  - qr-pricelist.svg
  - qr-pricelist.png

Re-run any time WEBSITE_URL or FORMS_URL changes:

    .venv/bin/python data-pipeline/gen_qr.py
"""

from __future__ import annotations
from pathlib import Path

import qrcode
import qrcode.image.svg

WEBSITE_URL = "https://pmuscat41.github.io/Rouse-MENA_INFO/"
FORMS_URL = (
    "https://forms.office.com/Pages/ResponsePage.aspx"
    "?id=BqcmxiOKJ0CwHt8gurVp12-E5ZR1EPhJrM0aR-ITrWlURFZDMDZHRlFQS1JNNVk0TDFXTEpXRldLRyQlQCN0PWcu"
)

PETROL = "#007f9c"   # Rouse petrol — primary brand
GREEN  = "#096e4a"   # Rouse green — paired with the "Request fees" CTA

SCRIPT_DIR = Path(__file__).resolve().parent
OUT_DIR = SCRIPT_DIR.parent / "assets" / "img"

QR_CODES = (
    ("qr-website",   WEBSITE_URL, PETROL),
    ("qr-pricelist", FORMS_URL,   GREEN),
)


def _make_svg(url: str, colour: str, out: Path) -> None:
    qr = qrcode.QRCode(
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
        image_factory=qrcode.image.svg.SvgPathImage,
    )
    qr.add_data(url)
    qr.make(fit=True)
    qr.make_image().save(str(out))

    # SvgPathImage emits a single black <path>. Recolour to brand.
    text = out.read_text()
    text = (
        text.replace('fill="#000000"', f'fill="{colour}"')
            .replace("fill='#000000'", f"fill='{colour}'")
    )
    if colour not in text:
        text = text.replace("<path ", f'<path fill="{colour}" ', 1)
    out.write_text(text)


def _make_png(url: str, colour: str, out: Path) -> None:
    qr = qrcode.QRCode(
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=20,   # 20 * (modules + 2*border) ≈ 600px square for typical URLs
        border=2,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color=colour, back_color="white")
    img.save(str(out))


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for stem, url, colour in QR_CODES:
        svg_path = OUT_DIR / f"{stem}.svg"
        png_path = OUT_DIR / f"{stem}.png"
        _make_svg(url, colour, svg_path)
        _make_png(url, colour, png_path)
        print(f"Wrote {svg_path.relative_to(SCRIPT_DIR.parent)}")
        print(f"Wrote {png_path.relative_to(SCRIPT_DIR.parent)}")
        snippet = url if len(url) <= 60 else url[:57] + "..."
        print(f"  Encodes: {snippet}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
