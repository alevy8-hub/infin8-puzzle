"""
Re-extract the 16 iNFiN8 symbols from public/assets/reference/symbol-library-002.png.

- per-symbol region between the label above and the symbol's own label (labels excluded)
- art = connected bright components (glow/reflection-only components dropped)
- soft alpha: opaque inside the art (incl. enclosed dark details), luminance ramp on the rim,
  colors un-premultiplied from the black background so there is no dark halo
- trim, then pad to a square canvas with a ~6% margin per side
- dogs (captain, btc-builder, dj) recolored with a luminance->gold lookup built from
  crown, lion, anchor and microphone; DJ's original colors saved to symbols-alt/dj-color.png
Run: python scripts/extract_symbols.py   (needs numpy, scipy, pillow)
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parents[1]
SHEET = ROOT / 'public/assets/reference/symbol-library-002.png'
OUT = ROOT / 'public/assets/symbols'
ALT = ROOT / 'public/assets/symbols-alt'
CANVAS = 240
MARGIN = 0.06

src = np.asarray(Image.open(SHEET).convert('RGB')).astype(np.float64)
Lmax = src.max(axis=2)

# (x0, y0, x1, y1): x between neighbours, y from below the label above to just above own label
REGIONS = {
    'infinity':          (40, 255, 345, 434),
    'star':              (345, 255, 640, 433),
    'headphones':        (640, 255, 900, 437),
    'lion':              (900, 255, 1215, 449),
    'rampant-lion':      (40, 467, 335, 649),
    'a8-winged':         (335, 467, 628, 633),
    'dj':                (628, 467, 900, 648),
    'microphone':        (900, 478, 1215, 653),
    'captain':           (40, 681, 345, 849),
    'btc-builder':       (345, 667, 640, 850),
    'anchor':            (640, 677, 900, 858),
    'crown':             (900, 685, 1215, 860),
    'electric-guitar':   (40, 885, 345, 1067),
    'technic-turntable': (345, 885, 640, 1063),
    'celtic-cross':      (640, 885, 900, 1063),
    'infin8-symbol':     (900, 885, 1215, 1064),
}
# the bottom of each region is the floor line under the art (its reflection is dropped);
# busts that stand on the floor fade out softly instead of ending in a hard line
FLOOR_FEATHER = {'captain': 18, 'btc-builder': 18, 'dj': 18}
DEFAULT_FEATHER = 5
# enclosed dark areas are art (cups, faces, crown velvet, record...) and stay opaque,
# except these holes where the black sheet background shows through the shape
BG_HOLES = {
    # shapes with no dark detail of their own: every enclosed gap is background
    'infinity': 'all',
    'a8-winged': 'all',
    'anchor': 'all',
    'infin8-symbol': 'all',
    'star': 'all',
    'rampant-lion': 'all',
}
DOGS = ['captain', 'btc-builder', 'dj']
GOLD_REFS = ['crown', 'lion', 'anchor', 'microphone']


def extract(name):
    x0, y0, x1, y1 = REGIONS[name]
    rgb = src[y0:y1, x0:x1]
    L = Lmax[y0:y1, x0:x1]
    lab, n = ndi.label(L > 30, structure=np.ones((3, 3)))
    idx = np.arange(1, n + 1)
    mx = ndi.maximum(L, lab, idx)
    area = ndi.sum(np.ones_like(L), lab, idx)
    keep = idx[(mx >= 150) & (area >= 25)]
    core = np.isin(lab, keep)
    # soft rim: grow a few px into the dim glow around the art
    art = core.copy()
    for _ in range(4):
        art |= ndi.binary_dilation(art) & (L > 16)
    no_dark_detail = BG_HOLES.get(name) == 'all'
    ramp = np.clip((L - 14) / ((75 if no_dark_detail else 55) - 14), 0, 1)
    depth = ndi.distance_transform_edt(art)
    if no_dark_detail:
        # pure luminance matte: drop shadows fade out instead of reading as smudges
        alpha = ramp * art
    else:
        alpha = np.maximum(ramp, np.clip((depth - 1.5) / 3, 0, 1)) * art
    # enclosed dark regions: opaque detail unless listed as background
    holes = ndi.binary_fill_holes(art) & ~art
    hl, hn = ndi.label(holes)
    bg = BG_HOLES.get(name, [])
    bg_ids = set(range(1, hn + 1)) if bg == 'all' else {int(hl[y - y0, x - x0]) for x, y in bg} - {0}
    for i in range(1, hn + 1):
        if i not in bg_ids:
            alpha[hl == i] = 1.0
    keep_sharp = alpha >= 1.0
    alpha = ndi.gaussian_filter(alpha, 0.6)
    if not no_dark_detail:
        alpha[keep_sharp & (ndi.distance_transform_edt(keep_sharp) > 1.5)] = 1.0
    fe = FLOOR_FEATHER.get(name, DEFAULT_FEATHER)
    h = alpha.shape[0]
    fade = np.clip((h - 1 - np.arange(h)) / fe, 0, 1) ** 1.2
    alpha = alpha * fade[:, None]
    inner = alpha > 0.999
    # un-premultiply against black: observed = a * color
    a = np.maximum(alpha, 1e-3)[..., None]
    col = np.clip(rgb / a, 0, 255)
    # limit rim colors to the nearest solid pixel brightness to avoid bright fringes
    _, (iy, ix) = ndi.distance_transform_edt(~inner, return_indices=True)
    near = rgb[iy, ix]
    cap = np.maximum(near.max(axis=2, keepdims=True), rgb.max(axis=2, keepdims=True))
    col = np.where((alpha < 1)[..., None], np.minimum(col, cap * col / np.maximum(col.max(axis=2, keepdims=True), 1)), col)
    edge_touch = {
        'top': bool(alpha[0].max() > 40 / 255), 'bottom': bool(alpha[-1].max() > 40 / 255),
        'left': bool(alpha[:, 0].max() > 40 / 255), 'right': bool(alpha[:, -1].max() > 40 / 255),
    }
    return col, alpha, edge_touch


def lum(c):
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]


def content_size(alpha):
    ys, xs = np.where(alpha > 10 / 255)
    return (xs.max() - xs.min() + 1, ys.max() - ys.min() + 1)


def trim_pad(col, alpha, scale=None):
    ys, xs = np.where(alpha > 10 / 255)
    col = col[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    alpha = alpha[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    rgba = np.dstack([col, alpha * 255]).round().clip(0, 255).astype(np.uint8)
    im = Image.fromarray(rgba, 'RGBA')
    inner = round(CANVAS * (1 - 2 * MARGIN))
    s = scale if scale is not None else inner / max(im.size)
    # resize in premultiplied space to avoid dark fringes
    pm = np.asarray(im).astype(np.float64)
    pm[..., :3] *= pm[..., 3:4] / 255
    size = (max(1, round(im.size[0] * s)), max(1, round(im.size[1] * s)))
    chans = [Image.fromarray(pm[..., i].astype(np.float32), 'F').resize(size, Image.LANCZOS) for i in range(4)]
    arr = np.dstack([np.asarray(c) for c in chans]).clip(0, 255)
    a = arr[..., 3:4]
    arr[..., :3] = np.where(a > 0, arr[..., :3] * 255 / np.maximum(a, 1e-3), 0)
    small = Image.fromarray(arr.clip(0, 255).round().astype(np.uint8), 'RGBA')
    canvas = Image.new('RGBA', (CANVAS, CANVAS), (0, 0, 0, 0))
    canvas.paste(small, ((CANVAS - size[0]) // 2, (CANVAS - size[1]) // 2))
    return canvas


def main():
    results, report = {}, {}
    for name in REGIONS:
        col, alpha, touch = extract(name)
        results[name] = (col, alpha)
        report[name] = {'region_edge_touch': touch}
    # luminance -> gold lookup from the approved gold symbols
    ys, cols = [], []
    for r in GOLD_REFS:
        c, a = results[r]
        m = a > 0.95
        ys.append(lum(c[m])); cols.append(c[m])
    Y = np.concatenate(ys); C = np.concatenate(cols)
    bins = np.clip(Y.round().astype(int), 0, 255)
    lut = np.zeros((256, 3)); have = np.zeros(256, bool)
    for b in range(256):
        sel = bins == b
        if sel.sum() >= 20:
            lut[b] = C[sel].mean(axis=0); have[b] = True
    hb = np.where(have)[0]
    for ch in range(3):
        lut[:, ch] = np.interp(np.arange(256), hb, lut[hb, ch])
    lut = ndi.gaussian_filter1d(lut, 2, axis=0)
    ref_lo, ref_hi = np.percentile(Y, [2, 98])
    ALT.mkdir(parents=True, exist_ok=True)
    for d in DOGS:
        c, a = results[d]
        if d == 'dj':
            trim_pad(c, a).save(ALT / 'dj-color.png', optimize=True)  # original colors, not used in game
        y = lum(c)
        lo, hi = np.percentile(y[a > 0.95], [2, 98])
        y2 = np.clip((y - lo) / (hi - lo) * (ref_hi - ref_lo) + ref_lo, 0, 255)
        # then match the gold set's brightness distribution (keeps the dogs from looking dull)
        ys_sorted = np.sort(Y)
        q = np.searchsorted(np.sort(y2[a > 0.95]), y2) / max(1, (a > 0.95).sum())
        y2 = 0.5 * y2 + 0.5 * np.interp(np.clip(q, 0, 1), np.linspace(0, 1, ys_sorted.size), ys_sorted)
        results[d] = (lut[y2.round().astype(int)], a)
    OUT.mkdir(parents=True, exist_ok=True)
    # the three dogs share one scale so their heads match (DJ's wide brim sets it)
    inner = round(CANVAS * (1 - 2 * MARGIN))
    dog_scale = min(inner / max(content_size(results[d][1])) for d in DOGS)
    for name, (c, a) in results.items():
        im = trim_pad(c, a, dog_scale if name in DOGS else None)
        im.save(OUT / f'{name}.png', optimize=True)
    json.dump(report, sys.stdout, indent=1)


if __name__ == '__main__':
    main()
