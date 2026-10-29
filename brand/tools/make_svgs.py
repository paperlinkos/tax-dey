"""Generate Tax Dey logo SVGs with the wordmark converted to outlines.

Usage: python -I make_svgs.py <font.ttf> <out_dir>
"""
import io
import sys
from pathlib import Path

import uharfbuzz as hb
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

FOREST, GOLD, PAPER, INDIGO = "#0b3b2c", "#e2a72e", "#f7f4ec", "#1f3460"
DOTS = [(12, 12), (28, 12), (44, 12), (12, 28), (28, 28), (44, 28), (12, 44), (28, 44)]
CENTRES = [(12, 12), (28, 28), (44, 12), (12, 44)]
GOLD_DOT = '<circle cx="51.5" cy="51.5" r="8.5" fill="{gold}"/>'


def mark(kind: str, main: str, gold: str = GOLD) -> str:
    """Inner SVG for a mark drawn on a 64×64 grid."""
    if kind == "solid":
        body = f'<g fill="{main}">' + "".join(f'<circle cx="{x}" cy="{y}" r="6.5"/>' for x, y in DOTS) + "</g>"
    elif kind == "rings":
        body = f'<g fill="none" stroke="{main}" stroke-width="3.4">' + "".join(f'<circle cx="{x}" cy="{y}" r="5"/>' for x, y in DOTS) + "</g>"
        body += f'<g fill="{main}">' + "".join(f'<circle cx="{x}" cy="{y}" r="1.6"/>' for x, y in CENTRES) + "</g>"
    elif kind == "rings-small":
        body = f'<g fill="none" stroke="{main}" stroke-width="4.2">' + "".join(f'<circle cx="{x}" cy="{y}" r="4.6"/>' for x, y in DOTS) + "</g>"
    else:
        raise ValueError(kind)
    return body + GOLD_DOT.format(gold=gold)


FAVICON = f'<g fill="{FOREST}"><circle cx="4" cy="4" r="3"/><circle cx="11" cy="4" r="3"/><circle cx="4" cy="11" r="3"/></g><circle cx="11.8" cy="11.8" r="3.6" fill="{GOLD}"/>'


def svg(view_w: float, view_h: float, inner: str, title: str) -> str:
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {view_w:.2f} {view_h:.2f}" role="img" aria-label="{title}">'
            f"<title>{title}</title>{inner}</svg>\n")


class Wordmark:
    """"Tax Dey" set in Bricolage Grotesque ExtraBold, shaped with kerning, as outline paths."""

    def __init__(self, font_path: str, tracking_em: float = -0.03):
        font = TTFont(font_path)
        instance = instantiateVariableFont(font, {"wght": 800, "opsz": 48, "wdth": 100}, inplace=False)
        buffer = io.BytesIO()
        instance.save(buffer)
        data = buffer.getvalue()
        self.font = TTFont(io.BytesIO(data))
        self.upem = self.font["head"].unitsPerEm
        self.glyphs = self.font.getGlyphSet()
        self.order = self.font.getGlyphOrder()
        self.hb_font = hb.Font(hb.Face(data))
        self.tracking = tracking_em * self.upem
        self.cap = self.font["OS/2"].sCapHeight or 0.7 * self.upem

    def path(self, text: str, size: float):
        """Return (svg path data, width, cap_height) for `text` at `size` px, baseline at y = cap height."""
        buf = hb.Buffer()
        buf.add_str(text)
        buf.guess_segment_properties()
        hb.shape(self.hb_font, buf, {"kern": True, "liga": True})
        scale = size / self.upem
        cap = self.cap * scale
        pen = SVGPathPen(self.glyphs)
        bounds = BoundsPen(self.glyphs)
        x = 0.0
        for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
            name = self.order[info.codepoint]
            # Font units are y-up; SVG is y-down. Baseline sits at y = cap.
            transform = (scale, 0, 0, -scale, (x + pos.x_offset) * scale, cap - pos.y_offset * scale)
            self.glyphs[name].draw(TransformPen(pen, transform))
            self.glyphs[name].draw(TransformPen(bounds, transform))
            x += pos.x_advance + self.tracking
        x_min, _, x_max, _ = bounds.bounds
        return pen.getCommands(), x_max, cap, x_min


def write(out: Path, name: str, content: str):
    (out / name).write_text(content)
    print("wrote", name)


def main(font_path: str, out_dir: str):
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    words = Wordmark(font_path)

    # Marks.
    for kind, label in [("rings", "Tax Dey logo"), ("rings-small", "Tax Dey logo (small sizes)"), ("solid", "Tax Dey compact logo")]:
        write(out, f"mark-{kind}.svg", svg(64, 64, mark(kind, FOREST), label))
        write(out, f"mark-{kind}-reversed.svg", svg(64, 64, mark(kind, PAPER), label))
    write(out, "mark-rings-indigo.svg", svg(64, 64, mark("rings", INDIGO), "Tax Dey logo, indigo edition"))
    write(out, "favicon.svg", svg(16, 16, FAVICON, "Tax Dey"))

    # Wordmark with the gold full stop.
    size = 64
    path, width, cap, _ = words.path("Tax Dey", size)
    stop_r = size * 0.1
    stop_cx = width + size * 0.05 + stop_r
    w_total = stop_cx + stop_r
    for suffix, colour in [("", FOREST), ("-reversed", PAPER)]:
        inner = f'<path d="{path}" fill="{colour}"/><circle cx="{stop_cx:.2f}" cy="{cap - stop_r:.2f}" r="{stop_r:.2f}" fill="{GOLD}"/>'
        write(out, f"wordmark{suffix}.svg", svg(w_total, cap + size * 0.24, inner, "Tax Dey"))

    # Horizontal lockup: small-size rings + name (no full stop). The mark is a little taller than
    # the capitals and the capitals are centred on the mark's visual centre (the dots span 7..60 of 64).
    mark_size = cap * 1.9
    gap = mark_size * 0.2
    text_x = mark_size + gap
    offset_y = mark_size * (33.5 / 64) - cap / 2
    descender = size * 0.22
    lock_w = text_x + width
    lock_h = max(mark_size, offset_y + cap + descender)
    for suffix, colour in [("", FOREST), ("-reversed", PAPER)]:
        inner = (f'<g transform="scale({mark_size / 64:.4f})">{mark("rings-small", colour)}</g>'
                 f'<g transform="translate({text_x:.2f} {offset_y:.2f})"><path d="{path}" fill="{colour}"/></g>')
        write(out, f"lockup-horizontal{suffix}.svg", svg(lock_w, lock_h, inner, "Tax Dey"))

    # Stacked lockup: detailed rings above the wordmark with full stop.
    big = w_total * 0.55
    stack_gap = size * 0.4
    for suffix, colour in [("", FOREST), ("-reversed", PAPER)]:
        inner = (f'<g transform="translate({(w_total - big) / 2:.2f} 0) scale({big / 64:.4f})">{mark("rings", colour)}</g>'
                 f'<g transform="translate(0 {big + stack_gap:.2f})"><path d="{path}" fill="{colour}"/>'
                 f'<circle cx="{stop_cx:.2f}" cy="{cap - stop_r:.2f}" r="{stop_r:.2f}" fill="{GOLD}"/></g>')
        write(out, f"lockup-stacked{suffix}.svg", svg(w_total, big + stack_gap + cap + size * 0.24, inner, "Tax Dey"))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
