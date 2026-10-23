import sys, numpy as np
from imglib import *

W = int(sys.argv[1]) if len(sys.argv) > 1 else 1200
H = int(W * 9 / 16)
OUT = sys.argv[2] if len(sys.argv) > 2 else '/home/claude/work/out/hero_preview.webp'
S = W / 2400.0  # scale factor relative to the final 2400px render
rng = np.random.default_rng(7)

# ---------- 1. concrete substrate ----------
low = fbm(H, W, 2.6, 1)           # broad tonal clouds
mid = fbm(H, W, 1.7, 2)           # surface texture
fine = fbm(H, W, 0.9, 3)          # sand grain
pits = fbm(H, W, 1.2, 4)
pit_mask = smoothstep(1.9, 2.6, pits)             # small air-void pits
height = mid * 0.30 + fine * 0.14 + low * 0.5 - pit_mask * 1.9
height = blur(height, 1.2 * S + 0.3)

light_dir = (0.55, -0.62, 0.58)
shade, _ = shade_from_height(height * 2.2, light=light_dir, strength=1.0, ambient=0.0)
lum = 0.47 + 0.15 * low + 0.20 * (shade - 0.55) + 0.025 * fine - 0.22 * pit_mask
# brighter toward the top-right where the light comes from
ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
lum += 0.20 * smoothstep(0.25, 1.0, (xs / W) * 0.65 + (1 - ys / H) * 0.55) - 0.05
lum = np.clip(lum, 0, 1)

stops = [(0.0, '#040b13'), (0.30, '#0d2033'), (0.55, '#1c3f58'), (0.78, '#386075'), (0.93, '#6a8a9a'), (1.0, '#a5bcc6')]
bg = gradient_map(lum, stops)

# wet-sheen: a soft broad specular lobe following the surface bumps
sheen = smoothstep(0.62, 0.95, shade) * smoothstep(0.1, 0.9, (xs / W) * 0.6 + (1 - ys / H) * 0.6)
bg += sheen[..., None] * np.array([0.10, 0.20, 0.26], dtype=np.float32) * 0.9

# ---------- 2. droplet field ----------
classes = [(5, 62, 100), (16, 30, 54), (70, 12, 24), (300, 4.5, 10), (900, 1.8, 3.8)]
def density(x, y):
    xr = x / W
    return 0.05 + 0.95 * smoothstep(0.30, 0.82, xr) * (0.6 + 0.4 * (1 - y / H))
P = np.zeros((0, 3), dtype=np.float32)
buf = []
for count, a, b in classes:
    placed = 0; tries = 0
    while placed < count and tries < count * 60:
        tries += 1
        r = (a + (b - a) * rng.random() ** 1.6) * S
        x, y = rng.random() * W, rng.random() * H
        if rng.random() > density(x, y):
            continue
        if buf:
            arr = np.array(buf, dtype=np.float32)
            d2 = (arr[:, 0] - x) ** 2 + (arr[:, 1] - y) ** 2
            if np.any(d2 < ((arr[:, 2] + r) * 1.04) ** 2):
                continue
        buf.append((x, y, r)); placed += 1
drops = [tuple(map(float, t)) for t in buf]
print('droplets', len(drops))

L2 = np.array(light_dir[:2], dtype=np.float32)
L2 /= np.linalg.norm(L2)
Lv = np.array(light_dir, dtype=np.float32)
Lv /= np.linalg.norm(Lv)
Hh = Lv + np.array([0, 0, 1], dtype=np.float32)
Hh /= np.linalg.norm(Hh)

# contact shadows first (offset away from the light), on the substrate
shadow = np.zeros((H, W), dtype=np.float32)
for (cx, cy, r) in drops:
    off = -L2 * r * 0.42
    cv2.circle(shadow, (int(cx + off[0]), int(cy + off[1])), max(1, int(r * 1.08)), 1.0, -1, lineType=cv2.LINE_AA)
shadow = blur(shadow, 2.6 * S + 0.6)
lit_bg = bg.copy()
bg = bg * (1 - 0.62 * shadow[..., None])

out = bg.copy()
for (cx, cy, r) in drops:
    pad = 3
    x0, x1 = int(max(0, cx - r - pad)), int(min(W, cx + r + pad + 1))
    y0, y1 = int(max(0, cy - r - pad)), int(min(H, cy + r + pad + 1))
    if x1 <= x0 or y1 <= y0:
        continue
    gx, gy = np.meshgrid(np.arange(x0, x1, dtype=np.float32), np.arange(y0, y1, dtype=np.float32))
    dx, dy = gx - cx, gy - cy
    d = np.sqrt(dx * dx + dy * dy) / r
    alpha = np.clip((1.0 - d) * r + 0.5, 0, 1)
    if alpha.max() <= 0:
        continue
    s = 0.93
    nz = np.sqrt(np.clip(1 - (d * s) ** 2, 0, 1))
    nx, ny = dx / r * s, dy / r * s
    # lens: inverted, magnified-then-minified image of the surroundings
    k = 0.95
    sx = (cx - dx * k + L2[0] * r * 0.25).astype(np.float32)
    sy = (cy - dy * k + L2[1] * r * 0.25).astype(np.float32)
    refr = cv2.remap(lit_bg, sx, sy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    refr = refr * np.array([0.92, 1.04, 1.14], dtype=np.float32) * (0.78 + 0.42 * nz[..., None])
    # dark edge (total internal reflection) – strongest on the side facing away from light
    facing = nx * L2[0] + ny * L2[1]  # >0 -> toward light
    edge = smoothstep(0.62, 1.0, d)
    refr *= (1 - 0.55 * edge * (0.55 + 0.45 * (1 - np.clip(facing, -1, 1)) * 0.5))[..., None]
    # warm caustic: light focused through the drop lands on the shadow side
    cau = smoothstep(0.30, 0.92, d) * np.clip(-facing, 0, 1) ** 1.2
    refr += cau[..., None] * np.array([0.95, 0.62, 0.18], dtype=np.float32) * 0.95
    # cool fill from the lit side rim
    rim = smoothstep(0.80, 0.99, d) * np.clip(facing, 0, 1)
    refr += rim[..., None] * np.array([0.35, 0.62, 0.78], dtype=np.float32) * 0.55
    # specular glints
    spec = np.clip(nx * Hh[0] + ny * Hh[1] + nz * Hh[2], 0, 1)
    refr += (spec ** 90)[..., None] * 1.7 + (spec ** 12)[..., None] * 0.10
    a = alpha[..., None]
    out[y0:y1, x0:x1] = out[y0:y1, x0:x1] * (1 - a) + refr * a

# ---------- 3. depth of field ----------
dist = np.abs(xs / W - 0.70) * 0.85 + np.abs(ys / H - 0.40) * 0.55
b1 = smoothstep(0.16, 0.50, dist)
sharp = out
soft1 = blur(out, 3.2 * S + 0.5)
soft2 = blur(out, 10 * S + 1.0)
w2 = smoothstep(0.55, 0.95, b1)[..., None]
w1 = b1[..., None]
img = sharp * (1 - w1) + soft1 * w1
img = img * (1 - w2) + soft2 * w2

# ---------- 4. grade ----------
img *= vignette(H, W, 0.45, 2.0, 0.62, 0.42)[..., None]
img = tone(img, exposure=1.02, contrast=1.06, saturation=1.05)
img = grain(img, 0.018, 9)
import os
os.makedirs(os.path.dirname(OUT), exist_ok=True)
print(save(img, OUT, quality=80))
