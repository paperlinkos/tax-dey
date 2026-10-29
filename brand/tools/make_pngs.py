"""Render Tax Dey PNG assets with headless Chrome, then downscale app icons with sips.

Usage: python3 -I make_pngs.py <brand_dir> <work_dir>
"""
import subprocess
import sys
import urllib.parse
from pathlib import Path

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
FOREST, GOLD, PAPER, LEAF = "#0b3b2c", "#e2a72e", "#f7f4ec", "#12684a"


def inline(path: Path) -> str:
    return path.read_text().replace('role="img"', 'style="display:block;width:100%;height:100%"', 1)


def pattern_tile(dot: str, gold_dot: str) -> str:
    cols, rows, step = 12, 8, 24
    gold = (8, 5)
    dots = "".join(f"<circle cx='{12 + c * step}' cy='{12 + r * step}' r='5'/>" for r in range(rows) for c in range(cols) if (c, r) != gold)
    gx, gy = 12 + gold[0] * step + 5, 12 + gold[1] * step + 5
    return (f"<svg xmlns='http://www.w3.org/2000/svg' width='{cols * step}' height='{rows * step}'>"
            f"<g fill='{dot}'>{dots}</g><circle cx='{gx}' cy='{gy}' r='7' fill='{gold_dot}'/></svg>")


def render(html: str, width: int, height: int, out: Path, work: Path):
    page = work / f"{out.stem}.html"
    page.write_text(f"<!doctype html><meta charset='utf-8'><style>html,body{{margin:0;width:{width}px;height:{height}px;overflow:hidden}}</style>{html}")
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
                    f"--window-size={width},{height}", "--virtual-time-budget=5000", f"--screenshot={out}", page.as_uri()],
                   check=True, capture_output=True)
    print("wrote", out.name)


def resize(source: Path, size: int, out: Path):
    subprocess.run(["sips", "-z", str(size), str(size), str(source), "--out", str(out)], check=True, capture_output=True)
    print("wrote", out.name)


def main(brand: str, work_dir: str):
    brand_dir = Path(brand)
    logo = brand_dir / "logo"
    png = brand_dir / "png"
    pattern_dir = brand_dir / "pattern"
    work = Path(work_dir)
    for folder in (png, pattern_dir, work):
        folder.mkdir(parents=True, exist_ok=True)

    tile_dark = pattern_tile(LEAF, GOLD)
    tile_light = pattern_tile("#d9e6dc", GOLD)
    (pattern_dir / "pattern-tile-on-forest.svg").write_text(tile_dark + "\n")
    (pattern_dir / "pattern-tile-on-paper.svg").write_text(tile_light + "\n")
    print("wrote pattern tiles")

    solid_rev, solid = inline(logo / "mark-solid-reversed.svg"), inline(logo / "mark-solid.svg")
    rings_rev = inline(logo / "mark-rings-reversed.svg")

    # App icons: full-bleed squares (iOS and Android apply their own rounding), mark inside a 60% safe zone.
    for name, bg, mark in [("app-icon", FOREST, solid_rev), ("app-icon-light", PAPER, solid)]:
        big = png / f"{name}-1024.png"
        render(f"<div style='width:1024px;height:1024px;background:{bg};display:grid;place-items:center'><div style='width:600px;height:600px'>{mark}</div></div>", 1024, 1024, big, work)
        for size in (512, 192, 180):
            resize(big, size, png / f"{name}-{size}.png")

    # Social avatar: survives a circular crop (mark kept within the inner 62%).
    render(f"<div style='width:800px;height:800px;background:{FOREST};display:grid;place-items:center'><div style='width:440px;height:440px'>{rings_rev}</div></div>", 800, 800, png / "social-avatar-800.png", work)

    # Link preview (Open Graph), 1200×630.
    lockup = inline(logo / "lockup-horizontal.svg")
    tile_uri = "data:image/svg+xml," + urllib.parse.quote(tile_dark, safe="/:=' ")
    og = f"""
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Instrument+Sans:wght@500&display=swap">
<div style="width:1200px;height:630px;background:{PAPER};display:grid;grid-template-columns:1fr 380px">
  <div style="padding:72px 0 64px 80px;display:flex;flex-direction:column;justify-content:space-between">
    <div style="height:84px;width:auto;display:flex"><div style="height:84px;aspect-ratio:{_aspect(logo / 'lockup-horizontal.svg')}">{lockup}</div></div>
    <div>
      <div style="font:800 68px/1.02 'Bricolage Grotesque',sans-serif;letter-spacing:-0.03em;color:{FOREST};max-width:640px">Your tax, set aside as you earn.</div>
      <div style="margin-top:22px;font:500 26px/1.4 'Instrument Sans',sans-serif;color:#5b6862">Free Nigerian tax calculator and tax vault</div>
    </div>
  </div>
  <div style="background-color:{FOREST};background-image:url(&quot;{tile_uri}&quot;);background-size:288px 192px;background-position:-20px -14px"></div>
</div>"""
    render(og, 1200, 630, png / "og-image-1200x630.png", work)


def _aspect(svg_path: Path) -> str:
    text = svg_path.read_text()
    view = text.split('viewBox="', 1)[1].split('"', 1)[0].split()
    return f"{float(view[2]):.2f} / {float(view[3]):.2f}"


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
