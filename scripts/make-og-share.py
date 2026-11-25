"""Build the 1200x630 iNFiN8 Puzzle Series Open Graph image."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1200, 630
BG = (5, 5, 5, 255)
GOLD = (212, 175, 55, 255)
GOLD_SOFT = (224, 196, 98, 255)
CREAM = (245, 245, 245, 255)
CREAM_DIM = (200, 196, 184, 255)

ROOT = Path("/workspace/infin8-puzzle")
LOGO = Path("/workspace/music/a8-master-logo-clean.png")
INFINITY = ROOT / "public/assets/symbols/infinity.png"
OUT = ROOT / "public/og-share.png"

INTER = "/usr/share/fonts/truetype/sand-box/google/Inter/Inter-VariableFont_opsz,wght.ttf"
GARAMOND = "/usr/share/fonts/truetype/sand-box/google/EB Garamond/EBGaramond-Italic-VariableFont_wght.ttf"
OSWALD = "/usr/share/fonts/truetype/sand-box/google/Oswald/Oswald-VariableFont_wght.ttf"


def var_font(path: str, size: int, weight: int, axes_prefix: list[int] | None = None) -> ImageFont.FreeTypeFont:
    font = ImageFont.truetype(path, size)
    try:
        axes = font.get_variation_axes()
        values = []
        for ax in axes:
            name = ax["name"].decode() if isinstance(ax["name"], bytes) else ax["name"]
            if name.lower() in {"weight", "wght"}:
                values.append(weight)
            elif name.lower() in {"optical size", "opsz"}:
                values.append(min(max(size, ax["minimum"]), ax["maximum"]))
            else:
                values.append(ax["default"])
        font.set_variation_by_axes(values)
    except Exception:
        pass
    return font


def trim(im: Image.Image, pad: int = 0) -> Image.Image:
    if im.mode != "RGBA":
        im = im.convert("RGBA")
    bbox = im.split()[-1].getbbox()
    if not bbox:
        return im
    im = im.crop(bbox)
    if pad:
        canvas = Image.new("RGBA", (im.width + pad * 2, im.height + pad * 2), (0, 0, 0, 0))
        canvas.paste(im, (pad, pad), im)
        return canvas
    return im


def draw_centered_text(draw: ImageDraw.ImageDraw, xy, text, font, fill, tracking=0):
    x, y = xy
    if not tracking:
        draw.text((x, y), text, font=font, fill=fill, anchor="mm")
        return
    widths = []
    for ch in text:
        bbox = draw.textbbox((0, 0), ch, font=font)
        widths.append(bbox[2] - bbox[0])
    total = sum(widths) + tracking * (len(text) - 1)
    cx = x - total / 2
    for ch, w in zip(text, widths, strict=True):
        draw.text((cx + w / 2, y), ch, font=font, fill=fill, anchor="mm")
        cx += w + tracking


def paste_center(base: Image.Image, sprite: Image.Image, cx: int, cy: int) -> None:
    x = int(cx - sprite.width / 2)
    y = int(cy - sprite.height / 2)
    base.alpha_composite(sprite, (x, y))


def main() -> None:
    img = Image.new("RGBA", (W, H), BG)
    # soft gold glow at the top, like the game
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse((W // 2 - 520, -240, W // 2 + 520, 280), fill=(212, 175, 55, 38))
    glow = glow.filter(ImageFilter.GaussianBlur(48))
    img = Image.alpha_composite(img, glow)

    draw = ImageDraw.Draw(img)

    # thin gold frame
    draw.rounded_rectangle((28, 28, W - 28, H - 28), radius=18, outline=(212, 175, 55, 90), width=2)

    logo = trim(Image.open(LOGO))
    logo_w = 300
    logo_h = int(logo.height * (logo_w / logo.width))
    logo = logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
    paste_center(img, logo, W // 2, 148)

    word = var_font(INTER, 72, 800)
    # draw iNFiN in cream and 8 in gold, with tracking
    brand = "iNFiN8"
    tracking = 14
    widths = []
    for ch in brand:
        bbox = draw.textbbox((0, 0), ch, font=word)
        widths.append(bbox[2] - bbox[0])
    total = sum(widths) + tracking * (len(brand) - 1)
    cx = W / 2 - total / 2
    y_brand = 300
    for ch, w in zip(brand, widths, strict=True):
        fill = GOLD if ch == "8" else CREAM
        draw.text((cx + w / 2, y_brand), ch, font=word, fill=fill, anchor="mm")
        cx += w + tracking

    series = var_font(OSWALD, 26, 500)
    draw_centered_text(draw, (W / 2, 354), "PUZZLE SERIES", series, GOLD, tracking=10)

    # equation card
    box = (150, 400, W - 150, 522)
    draw.rounded_rectangle(box, radius=16, outline=(212, 175, 55, 140), width=2, fill=(12, 12, 12, 230))

    inf = trim(Image.open(INFINITY))
    # scale infinity to a consistent visual height
    target_h = 72
    inf = inf.resize((int(inf.width * (target_h / inf.height)), target_h), Image.Resampling.LANCZOS)

    plus = var_font(INTER, 44, 600)
    equals = var_font(INTER, 44, 600)
    num = var_font(INTER, 48, 700)

    # measure row: inf + plus + inf + plus + inf + equals + 24
    plus_w = draw.textbbox((0, 0), "+", font=plus)[2]
    eq_w = draw.textbbox((0, 0), "=", font=equals)[2]
    num_w = draw.textbbox((0, 0), "24", font=num)[2]
    gap = 22
    row_w = inf.width * 3 + plus_w * 2 + eq_w + num_w + gap * 6
    x = int((W - row_w) / 2)
    cy = 461

    def place_inf(x0: int) -> int:
        paste_center(img, inf, x0 + inf.width // 2, cy)
        return x0 + inf.width + gap

    def place_text(x0: int, ch: str, font, color=GOLD_SOFT) -> int:
        bbox = draw.textbbox((0, 0), ch, font=font)
        tw = bbox[2] - bbox[0]
        draw.text((x0 + tw / 2, cy), ch, font=font, fill=color, anchor="mm")
        return x0 + tw + gap

    x = place_inf(x)
    x = place_text(x, "+", plus)
    x = place_inf(x)
    x = place_text(x, "+", plus)
    x = place_inf(x)
    x = place_text(x, "=", equals)
    place_text(x, "24", num, CREAM)

    prompt = var_font(GARAMOND, 34, 500)
    try:
        prompt.set_variation_by_axes([500])
    except Exception:
        pass
    draw_centered_text(draw, (W / 2, 558), "Can you solve it?", prompt, CREAM_DIM)

    footer = var_font(OSWALD, 16, 400)
    # gold rules beside the footer, like the game
    foot = "Hear / See / FEEL"
    fb = draw.textbbox((0, 0), foot, font=footer)
    fw = fb[2] - fb[0]
    fy = 598
    draw_centered_text(draw, (W / 2, fy), foot, footer, (212, 175, 55, 200), tracking=6)
    line_y = fy
    draw.line((W / 2 - fw / 2 - 130, line_y, W / 2 - fw / 2 - 18, line_y), fill=(212, 175, 55, 80), width=1)
    draw.line((W / 2 + fw / 2 + 18, line_y, W / 2 + fw / 2 + 130, line_y), fill=(212, 175, 55, 80), width=1)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    # flatten to opaque RGB — Open Graph cards prefer no alpha
    flat = Image.new("RGB", (W, H), (5, 5, 5))
    flat.paste(img, mask=img.split()[-1])
    flat.save(OUT, "PNG", optimize=True)
    print(f"wrote {OUT} {OUT.stat().st_size} bytes {flat.size}")


if __name__ == "__main__":
    main()
