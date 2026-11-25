"""Build the 1200x630 iNFiN8 Puzzle Series Open Graph image."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1200, 630
BG = (5, 5, 5)
GOLD = (212, 175, 55, 255)
GOLD_SOFT = (224, 196, 98, 255)
CREAM = (245, 245, 245, 255)
CREAM_DIM = (210, 206, 196, 255)

# Frame inset and minimum clear space inside it (also keeps content in X's center-safe area)
FRAME = 28
FRAME_W = 2
CLEAR = 40  # min px from the inner edge of the gold border
INNER_TOP = FRAME + FRAME_W + CLEAR  # 70
INNER_BOTTOM = H - FRAME - FRAME_W - CLEAR  # 560
INNER_H = INNER_BOTTOM - INNER_TOP  # 490

ROOT = Path("/workspace/infin8-puzzle")
LOGO = Path("/workspace/music/a8-master-logo-clean.png")
INFINITY = ROOT / "public/assets/symbols/infinity.png"
OUT = ROOT / "public/og-share.png"

INTER = "/usr/share/fonts/truetype/sand-box/google/Inter/Inter-VariableFont_opsz,wght.ttf"
GARAMOND = "/usr/share/fonts/truetype/sand-box/google/EB Garamond/EBGaramond-Italic-VariableFont_wght.ttf"
OSWALD = "/usr/share/fonts/truetype/sand-box/google/Oswald/Oswald-VariableFont_wght.ttf"

# Consistent gap between major blocks; tighter gap inside the wordmark + series pair
GAP = 22
PAIR_GAP = 10
BOX_PAD_Y = 18


def var_font(path: str, size: int, weight: int) -> ImageFont.FreeTypeFont:
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


def trim(im: Image.Image) -> Image.Image:
    if im.mode != "RGBA":
        im = im.convert("RGBA")
    bbox = im.split()[-1].getbbox()
    return im.crop(bbox) if bbox else im


def tracked_size(draw: ImageDraw.ImageDraw, text: str, font, tracking: int) -> tuple[int, int, int]:
    """Return (width, top_bearing, bottom_bearing) relative to a midline y=0 using anchor mm."""
    # Measure with a dummy draw at origin, using the font's bbox
    xs, tops, bottoms = [], [], []
    x = 0
    for i, ch in enumerate(text):
        bbox = draw.textbbox((0, 0), ch, font=font)
        w = bbox[2] - bbox[0]
        xs.append(w)
        # Use mm anchor bbox at (0,0)
        b = draw.textbbox((0, 0), ch, font=font, anchor="mm")
        tops.append(b[1])
        bottoms.append(b[3])
        x += w + (tracking if i < len(text) - 1 else 0)
    return x, min(tops), max(bottoms)


def draw_tracked(draw: ImageDraw.ImageDraw, cx: float, cy: float, text: str, font, fills, tracking: int) -> None:
    widths = []
    for ch in text:
        bbox = draw.textbbox((0, 0), ch, font=font)
        widths.append(bbox[2] - bbox[0])
    total = sum(widths) + tracking * (len(text) - 1)
    x = cx - total / 2
    for ch, w, fill in zip(text, widths, fills, strict=True):
        draw.text((x + w / 2, cy), ch, font=font, fill=fill, anchor="mm")
        x += w + tracking


def content_bbox(im: Image.Image, threshold: int = 12) -> tuple[int, int, int, int]:
    """Tight bbox of pixels that aren't near-pure background, ignoring the gold frame."""
    px = im.load()
    xs, ys = [], []
    # ignore the frame region so we measure the stack only
    margin = FRAME + FRAME_W + 4
    for y in range(margin, H - margin):
        for x in range(margin, W - margin):
            r, g, b = px[x, y][:3]
            # skip near-black and the soft glow (low gold haze)
            if r <= 18 and g <= 16 and b <= 12:
                continue
            # skip very faint glow
            if r < 40 and g < 32 and b < 16:
                continue
            xs.append(x)
            ys.append(y)
    if not xs:
        return (0, 0, 0, 0)
    return min(xs), min(ys), max(xs), max(ys)


def main() -> None:
    # Work on a transparent layer so we can measure the stack independently, then composite
    stack = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(stack)

    logo = trim(Image.open(LOGO))
    logo_w = 248
    logo_h = int(logo.height * (logo_w / logo.width))
    logo = logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)

    word = var_font(INTER, 68, 800)
    series = var_font(OSWALD, 24, 500)
    prompt = var_font(GARAMOND, 36, 500)
    footer = var_font(OSWALD, 22, 500)
    plus = var_font(INTER, 40, 600)
    equals = var_font(INTER, 40, 600)
    num = var_font(INTER, 44, 700)

    brand = "iNFiN8"
    brand_fills = [GOLD if ch == "8" else CREAM for ch in brand]
    series_text = "PUZZLE SERIES"
    prompt_text = "Can you solve it?"
    foot_text = "Hear / See / FEEL"

    brand_w, brand_top, brand_bot = tracked_size(draw, brand, word, 14)
    brand_h = brand_bot - brand_top
    series_w, series_top, series_bot = tracked_size(draw, series_text, series, 10)
    series_h = series_bot - series_top
    prompt_w, prompt_top, prompt_bot = tracked_size(draw, prompt_text, prompt, 0)
    prompt_h = prompt_bot - prompt_top
    foot_w, foot_top, foot_bot = tracked_size(draw, foot_text, footer, 7)
    foot_h = foot_bot - foot_top

    inf = trim(Image.open(INFINITY))
    target_h = 64
    inf = inf.resize((int(inf.width * (target_h / inf.height)), target_h), Image.Resampling.LANCZOS)
    plus_w = draw.textbbox((0, 0), "+", font=plus)[2] - draw.textbbox((0, 0), "+", font=plus)[0]
    eq_w = draw.textbbox((0, 0), "=", font=equals)[2] - draw.textbbox((0, 0), "=", font=equals)[0]
    num_w = draw.textbbox((0, 0), "24", font=num)[2] - draw.textbbox((0, 0), "24", font=num)[0]
    row_gap = 20
    row_w = inf.width * 3 + plus_w * 2 + eq_w + num_w + row_gap * 6
    box_h = target_h + BOX_PAD_Y * 2
    box_w = row_w + 80

    # Block heights (logo, brand pair, box, prompt, footer)
    brand_pair_h = brand_h + PAIR_GAP + series_h
    blocks = [logo_h, brand_pair_h, box_h, prompt_h, foot_h]
    stack_h = sum(blocks) + GAP * (len(blocks) - 1)

    if stack_h > INNER_H:
        raise SystemExit(f"stack {stack_h}px taller than inner {INNER_H}px")

    y = INNER_TOP + (INNER_H - stack_h) / 2
    cx = W / 2

    # 1. logo
    logo_top = y
    stack.alpha_composite(logo, (int(cx - logo.width / 2), int(round(y))))
    y += logo_h + GAP

    # 2. wordmark + series (tighter internal gap)
    brand_cy = y - brand_top  # so the top of the glyphs sits at y
    draw_tracked(draw, cx, brand_cy, brand, word, brand_fills, 14)
    y += brand_h + PAIR_GAP
    series_cy = y - series_top
    draw_tracked(draw, cx, series_cy, series_text, series, [GOLD] * len(series_text), 10)
    y += series_h + GAP

    # 3. equation box
    box_top = y
    box_left = cx - box_w / 2
    box_right = cx + box_w / 2
    box_bottom = y + box_h
    draw.rounded_rectangle(
        (box_left, box_top, box_right, box_bottom),
        radius=16,
        outline=(212, 175, 55, 140),
        width=2,
        fill=(12, 12, 12, 230),
    )
    row_x = int(cx - row_w / 2)
    row_cy = int(round(y + box_h / 2))

    def place_inf(x0: int) -> int:
        stack.alpha_composite(inf, (x0, int(row_cy - inf.height / 2)))
        return x0 + inf.width + row_gap

    def place_text(x0: int, ch: str, font, color) -> int:
        bbox = draw.textbbox((0, 0), ch, font=font)
        tw = bbox[2] - bbox[0]
        draw.text((x0 + tw / 2, row_cy), ch, font=font, fill=color, anchor="mm")
        return x0 + tw + row_gap

    row_x = place_inf(row_x)
    row_x = place_text(row_x, "+", plus, GOLD_SOFT)
    row_x = place_inf(row_x)
    row_x = place_text(row_x, "+", plus, GOLD_SOFT)
    row_x = place_inf(row_x)
    row_x = place_text(row_x, "=", equals, GOLD_SOFT)
    place_text(row_x, "24", num, CREAM)
    y += box_h + GAP

    # 4. prompt
    prompt_cy = y - prompt_top
    draw_tracked(draw, cx, prompt_cy, prompt_text, prompt, [CREAM_DIM] * len(prompt_text), 0)
    y += prompt_h + GAP

    # 5. footer with side rules
    foot_cy = y - foot_top
    draw_tracked(draw, cx, foot_cy, foot_text, footer, [(212, 175, 55, 220)] * len(foot_text), 7)
    # rule width based on measured text, vertically centered on the cap-height midline
    fw = tracked_size(draw, foot_text, footer, 7)[0]
    rule_y = foot_cy
    rule_pad = 18
    rule_len = 110
    draw.line(
        (cx - fw / 2 - rule_pad - rule_len, rule_y, cx - fw / 2 - rule_pad, rule_y),
        fill=(212, 175, 55, 90),
        width=1,
    )
    draw.line(
        (cx + fw / 2 + rule_pad, rule_y, cx + fw / 2 + rule_pad + rule_len, rule_y),
        fill=(212, 175, 55, 90),
        width=1,
    )
    y += foot_h
    stack_bottom = y

    # Background + glow + frame, then the centered stack
    img = Image.new("RGBA", (W, H), (*BG, 255))
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    # glow centered on the canvas so it doesn't pull the eye down
    gdraw.ellipse((W // 2 - 480, H // 2 - 320, W // 2 + 480, H // 2 + 80), fill=(212, 175, 55, 34))
    glow = glow.filter(ImageFilter.GaussianBlur(52))
    img = Image.alpha_composite(img, glow)
    frame = ImageDraw.Draw(img)
    frame.rounded_rectangle(
        (FRAME, FRAME, W - FRAME, H - FRAME),
        radius=18,
        outline=(212, 175, 55, 90),
        width=FRAME_W,
    )
    img = Image.alpha_composite(img, stack)

    flat = Image.new("RGB", (W, H), BG)
    flat.paste(img, mask=img.split()[-1])
    OUT.parent.mkdir(parents=True, exist_ok=True)
    flat.save(OUT, "PNG", optimize=True)

    # Measure from the actual pixels of the stack (no frame/glow)
    # Use the designed stack bounds plus a pixel bbox of nontransparent stack pixels
    alpha = stack.split()[-1]
    bbox = alpha.getbbox()
    assert bbox
    left, top, right, bottom = bbox
    inner_left = FRAME + FRAME_W
    inner_right = W - FRAME - FRAME_W
    inner_top = FRAME + FRAME_W
    inner_bottom = H - FRAME - FRAME_W
    margins = {
        "top_from_border": top - inner_top,
        "bottom_from_border": inner_bottom - bottom,
        "left_from_border": left - inner_left,
        "right_from_border": inner_right - right,
        "stack_height": bottom - top,
        "inner_height": inner_bottom - inner_top,
        "top_bottom_delta": abs((top - inner_top) - (inner_bottom - bottom)),
        "logo": (logo_w, logo_h),
        "stack_designed": (logo_top, stack_bottom),
    }
    print(f"wrote {OUT} {OUT.stat().st_size} bytes {flat.size}")
    print("margins (px from inner gold border):", margins)
    if margins["top_from_border"] < CLEAR or margins["bottom_from_border"] < CLEAR:
        raise SystemExit("clearance below 40px")
    if margins["top_bottom_delta"] > 6:
        raise SystemExit(f"top/bottom not even: delta {margins['top_bottom_delta']}px")


if __name__ == "__main__":
    main()
