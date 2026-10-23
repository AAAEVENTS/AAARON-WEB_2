import sys, os, numpy as np
from imglib import *

W = int(sys.argv[1]) if len(sys.argv) > 1 else 800
OUTDIR = sys.argv[2] if len(sys.argv) > 2 else '/home/claude/work/out'
ONLY = sys.argv[3].split(',') if len(sys.argv) > 3 else None
H = int(W * 10 / 16)
S = W / 1600.0
os.makedirs(OUTDIR, exist_ok=True)
YS, XS = np.mgrid[0:H, 0:W].astype(np.float32)


def want(name):
    return ONLY is None or name in ONLY



def concrete_parts(seed, rough=1.0):
    """Returns height, tonal (0..1-ish detail) for believable concrete: pores, aggregate, subtle mottling."""
    low = fbm(H, W, 3.2, seed)
    mid = fbm(H, W, 1.5, seed + 1)
    fine = fbm(H, W, 0.6, seed + 2)
    pores = smoothstep(1.55, 2.3, fbm(H, W, 0.9, seed + 3))          # small air voids
    pores2 = smoothstep(2.0, 2.9, fbm(H, W, 1.8, seed + 4))          # larger blow-holes
    agg = smoothstep(1.9, 2.6, fbm(H, W, 0.35, seed + 5))            # light aggregate specks
    height = (mid * 0.34 + fine * 0.30) * rough - pores * 1.0 - pores2 * 2.4 + low * 0.25
    return height, low, fine, pores, pores2, agg

# --------------------------------------------------------------- 1. TANK CAUSTICS
def tank():
    # floor: coated concrete in deep teal, lit by moving water caustics
    low = fbm(H, W, 2.8, 11)
    fine = fbm(H, W, 1.0, 12)
    base_lum = 0.42 + 0.14 * low + 0.02 * fine
    base_lum *= 0.55 + 0.45 * smoothstep(0.0, 1.0, 1 - YS / H * 0.7)
    base = gradient_map(np.clip(base_lum, 0, 1), [(0, '#021522'), (0.45, '#073a52'), (0.75, '#0c6882'), (1, '#2b9fb5')])

    def ridge(seed, sig, p):
        a = blur(fbm(H, W, 2.0, seed), sig * S)
        a = a / (a.std() + 1e-6)
        return np.clip(1 - np.abs(a) * 0.95, 0, 1) ** (p * 0.62)
    chans = []
    for off in (0, 1.6, 3.2):  # slight chromatic split
        dxw = blur(fbm(H, W, 2.6, 21), 18 * S) * 26 * S
        dyw = blur(fbm(H, W, 2.6, 22), 18 * S) * 26 * S
        c = 0.0
        for k, (seed, sig, p, wgt) in enumerate([(31, 22, 9, 1.0), (32, 12, 10, 0.75), (33, 40, 7, 0.55)]):
            r = ridge(seed, sig, p)
            r = warp(r, dxw + off * S, dyw)
            c = c + r * wgt
        chans.append(c)
    caus = np.stack(chans, -1)
    caus = caus / np.percentile(caus, 99.5)
    # light shafts: broad modulation
    shaft = 0.35 + 0.65 * smoothstep(-0.8, 1.2, blur(fbm(H, W, 3.2, 41), 60 * S))
    caus *= shaft[..., None]
    col = base + caus * np.array([0.55, 0.85, 0.95], dtype=np.float32) * 0.95
    col += (caus ** 2.2) * np.array([0.35, 0.30, 0.22], dtype=np.float32) * 0.5
    # floor expansion joints (system seams)
    for gx in (int(W * 0.34), int(W * 0.78)):
        line = np.exp(-((XS - gx) ** 2) / (2 * (2.2 * S) ** 2))
        col *= 1 - 0.55 * line[..., None]
        col += np.exp(-((XS - gx - 4 * S) ** 2) / (2 * (1.6 * S) ** 2))[..., None] * 0.05
    gy = int(H * 0.62)
    col *= 1 - 0.5 * np.exp(-((YS - gy) ** 2) / (2 * (2.2 * S) ** 2))[..., None]
    col *= vignette(H, W, 0.5, 2.0)[..., None]
    col = tone(col, 1.0, 1.08, 1.05)
    return grain(col, 0.015, 3)


# --------------------------------------------------------------- 2. GLOSS RESIN FLOOR
def floor():
    yh = 0.40 * H
    f = 1.05 * W
    cx = 0.5 * W
    yy = YS - yh
    below = yy > 1.0
    yyc = np.where(below, yy, 1.0)
    X = (XS - cx) / yyc               # world X in camera-heights
    Z = f / yyc                        # world Z
    # base epoxy: pale blue-grey with soft mottling
    mott = blur(fbm(H, W, 2.6, 51), 10 * S)
    peel = fbm(H, W, 0.8, 52)
    lum = 0.50 + 0.07 * mott + 0.01 * peel
    base = gradient_map(np.clip(lum - 0.08, 0, 1), [(0, '#0a1823'), (0.5, '#3a5668'), (1, '#7494a3')])

    # joints
    def line(coord, period, w):
        d = np.abs(((coord + period / 2) % period) - period / 2)
        return 1 - smoothstep(0, w, d)
    fade = smoothstep(0, 0.10 * H, yy)
    jt = np.maximum(line(X + 0.0, 2.4, 0.012 * (1 + 0 * X)), line(Z, 3.4, 0.014 * (Z / 6 + 1))) * fade
    base *= (1 - 0.40 * jt)[..., None]
    # amber safety lane
    lane = (np.abs(X - 1.25) < 0.095) * 1.0
    lane = blur(lane.astype(np.float32), 0.6) * fade
    lane2 = (np.abs(X + 2.55) < 0.07) * 1.0
    lane2 = blur(lane2.astype(np.float32), 0.6) * fade
    amber = np.array([0.96, 0.66, 0.06], dtype=np.float32)
    base = base * (1 - lane[..., None]) + amber * lane[..., None] * (0.92 + 0.1 * peel[..., None] * 0.3)
    base = base * (1 - lane2[..., None]) + amber * lane2[..., None] * 0.9

    # mirror reflection of the ceiling light rows
    Hc = 5.2
    Xr = (XS - cx) * (1 + Hc) / yyc
    Zr = f * (1 + Hc) / yyc
    refl = np.zeros((H, W), dtype=np.float32)
    for xi in (-9.0, -3.2, 3.2, 9.0):
        strip = np.exp(-((Xr - xi) / 0.85) ** 4)
        # long panels with short gaps
        seg = ((Zr + 2.2 * (abs(xi) % 4)) % 14.0) < 11.2
        refl += strip * seg
    refl = cv2.GaussianBlur(refl, (0, 0), sigmaX=5 * S, sigmaY=10 * S)
    # wide, soft rough reflection: stretch vertically
    refl_soft = cv2.GaussianBlur(refl, (0, 0), sigmaX=10 * S, sigmaY=46 * S)
    fres = 0.28 + 0.72 * smoothstep(0.0, 0.16 * H, 0.16 * H - yy) ** 1.0   # stronger near horizon
    fres = np.where(below, fres, 0)
    col = base + (refl * 0.50 + refl_soft * 1.25)[..., None] * fres[..., None] * np.array([0.9, 1.0, 1.0], dtype=np.float32)
    # window glow on right
    glow = np.exp(-((XS - 0.86 * W) / (0.10 * W)) ** 2) * smoothstep(0, 0.5 * H, yy) * 0.5
    glow = blur(glow.astype(np.float32), 8 * S)
    col += glow[..., None] * np.array([0.30, 0.55, 0.70], dtype=np.float32) * below[..., None]
    # top: dim factory interior
    sky = np.clip(1 - np.maximum(yy, 0) / 1, 0, 1)
    interior = gradient_map(np.clip(0.10 + 0.22 * (1 - np.clip(-yy / (yh), 0, 1)) ** 1.4, 0, 1),
                            [(0, '#050c14'), (0.5, '#0f2234'), (1, '#27465e')])
    # bokeh lights + columns
    rng = np.random.default_rng(5)
    bok = np.zeros((H, W, 3), dtype=np.float32)
    for row in range(3):
        for k in range(14):
            bx = (k + 0.5 + 0.35 * (rng.random() - 0.5)) / 14 * W
            by = yh - (0.035 + row * 0.07 + rng.random() * 0.01) * H
            br = (5 + row * 4 + rng.random() * 4) * S
            warm = rng.random() < 0.4
            c = (1.0, 0.86, 0.62) if warm else (0.80, 0.95, 1.0)
            cv2.circle(bok, (int(bx), int(by)), int(br), c, -1, cv2.LINE_AA)
    bok = blur(bok, 2.4 * S) * 0.48
    cols_mask = np.zeros((H, W), dtype=np.float32)
    for cxp in (0.12, 0.31, 0.57, 0.93):
        cv2.rectangle(cols_mask, (int((cxp - 0.018) * W), 0), (int((cxp + 0.018) * W), int(yh)), 1, -1)
    cols_mask = blur(cols_mask, 5 * S)
    interior = interior + bok * 0.9
    interior *= (1 - 0.7 * cols_mask)[..., None]
    horizon_glow = np.exp(-((YS - yh) / (0.035 * H)) ** 2)
    interior += horizon_glow[..., None] * np.array([0.45, 0.62, 0.72], dtype=np.float32) * 0.55
    img = np.where(below[..., None], col, interior)
    # soften transition at horizon
    img = blur(img, 0.7)
    img *= vignette(H, W, 0.42, 2.0)[..., None]
    img = tone(img, 1.0, 1.08, 1.0)
    return grain(img, 0.015, 4)


# --------------------------------------------------------------- 3. CRACK + REPAIR
def repair():
    hgt0, low, fine, pores, pores2, agg = concrete_parts(61)
    edge = (0.56 + 0.07 * np.sin(YS / H * 5.2 + 0.6) + 0.04 * np.sin(YS / H * 13 + 2.0)) * W
    edge = edge + blur(fbm(H, W, 2.2, 65), 20 * S) * 14 * S
    Mraw = (XS > edge).astype(np.float32)
    M = blur(Mraw, 1.6 * S)
    rng = np.random.default_rng(8)

    def crack_path(p0, p1, depth, rough):
        pts = [p0, p1]
        for d in range(depth):
            new = []
            for a_, b_ in zip(pts[:-1], pts[1:]):
                mx, my = (a_[0] + b_[0]) / 2, (a_[1] + b_[1]) / 2
                nx, ny = -(b_[1] - a_[1]), (b_[0] - a_[0])
                L = np.hypot(nx, ny) + 1e-6
                disp = (rng.random() - 0.5) * rough * L
                new += [a_, (mx + nx / L * disp, my + ny / L * disp)]
            new.append(pts[-1])
            pts = new
        return pts
    crack = np.zeros((H, W), dtype=np.float32)
    main = crack_path((0.00 * W, 0.12 * H), (0.58 * W, 1.02 * H), 7, 0.50)
    branches = [crack_path((0.17 * W, 0.37 * H), (0.40 * W, 0.30 * H), 5, 0.7),
                crack_path((0.29 * W, 0.58 * H), (0.10 * W, 0.80 * H), 5, 0.7),
                crack_path((0.42 * W, 0.78 * H), (0.57 * W, 0.66 * H), 4, 0.7)]
    for pts in [main] + branches:
        n = len(pts)
        for i in range(n - 1):
            t = i / max(1, n - 1)
            th = 1 + int((6.0 if pts is main else 3.4) * S * (0.55 + 0.45 * np.sin(t * 9 + 1) ** 2) + 0.5)
            cv2.line(crack, (int(pts[i][0]), int(pts[i][1])), (int(pts[i + 1][0]), int(pts[i + 1][1])), 1.0, th, cv2.LINE_AA)
    crack = blur(crack, 1.0 * S + 0.3) * (1 - M)
    crack_soft = blur(crack, 9 * S)

    # repaired area: trowel-smoothed, cooler, soft sweeping marks
    trowel = blur(fbm(H, W, 2.4, 67, aniso=(0.22, 1.0)), 2.5 * S)
    amp = 1 - 0.85 * M
    height = hgt0 * amp - crack * 3.0 + trowel * 0.45 * M
    height += blur(M, 2.4 * S) * 0.9           # raised edge of the patch
    height = blur(height, 0.7 * S + 0.15)
    shade, _ = shade_from_height(height * 2.4, light=(0.55, -0.55, 0.62), strength=1.0)
    lum = 0.54 + 0.05 * low + 0.34 * (shade - 0.6) - 0.10 * pores * amp - 0.16 * pores2 * amp + 0.06 * agg * amp - 0.55 * crack
    lum += 0.10 * M + 0.04 * trowel * M
    col = gradient_map(np.clip(lum, 0, 1), [(0, '#101315'), (0.35, '#454c52'), (0.62, '#868d92'), (0.85, '#b9bfc2'), (1, '#e0e4e5')])
    # rust bleed beside the crack
    rust_n = smoothstep(-0.2, 1.1, fbm(H, W, 2.0, 66))
    rust = np.clip(crack_soft * 3.2, 0, 1) * rust_n * (1 - M)
    rust_col = gradient_map(np.clip(0.3 + rust * 0.7, 0, 1), [(0, '#7a3d18'), (1, '#e0801f')])
    col = col * (1 - 0.7 * rust[..., None]) + rust_col * 0.7 * rust[..., None] * (0.7 + 0.6 * shade[..., None])
    # patch tint + visible seam
    col = col * (1 - 0.5 * M[..., None]) + col * np.array([0.90, 1.0, 1.10], dtype=np.float32) * 0.5 * M[..., None]
    seam = np.exp(-((XS - edge) / (2.6 * S)) ** 2)
    col *= (1 - 0.55 * seam)[..., None]
    col += (np.exp(-((XS - edge - 5 * S) / (2.2 * S)) ** 2) * 0.10)[..., None]
    col *= vignette(H, W, 0.32, 2.0)[..., None]
    col = tone(col, 1.0, 1.1, 1.0)
    return grain(col, 0.012, 5)


# --------------------------------------------------------------- 4. ROOF COATING EDGE
def roof():
    hgt0, low, fine, pores, pores2, agg = concrete_parts(71)
    edge = (0.50 + 0.05 * np.sin(YS / H * 4.0 + 1.4) + 0.025 * np.sin(YS / H * 11 + 0.3)) * W
    edge = edge + blur(fbm(H, W, 2.4, 75), 16 * S) * 10 * S
    M = blur((XS > edge).astype(np.float32), 1.4 * S)
    # roller: stipple + diagonal lap bands
    stip = blur(fbm(H, W, 0.8, 76), 0.8 * S + 0.2)
    lap = np.sin((XS * 0.84 + YS * 0.54) / (26 * S) + 3 * blur(fbm(H, W, 2.4, 77), 12 * S)) * 0.5 + 0.5
    height = hgt0 * (1 - 0.8 * M) + stip * 0.42 * M + lap * 0.5 * M
    height += blur(M, 2.2 * S) * 1.1
    height = blur(height, 0.7 * S + 0.15)
    shade, _ = shade_from_height(height * 2.4, light=(-0.5, -0.5, 0.7), strength=1.0)
    lum_c = 0.62 + 0.05 * low + 0.34 * (shade - 0.62) - 0.12 * pores - 0.20 * pores2 + 0.07 * agg
    conc = gradient_map(np.clip(lum_c, 0, 1), [(0, '#32302c'), (0.4, '#77746c'), (0.7, '#b0aca1'), (1, '#e6e2d7')])
    coat_l = 0.84 + 0.30 * (shade - 0.62) + 0.05 * stip + 0.05 * lap
    coat = gradient_map(np.clip(coat_l, 0, 1), [(0, '#7f97ab'), (0.55, '#d3dee6'), (1, '#ffffff')])
    col = conc * (1 - M[..., None]) + coat * M[..., None]
    # expansion joint, bridged by reinforcement tape on the coated side
    jy = 0.64 * H + 0.04 * H * np.sin(XS / W * 2.2)
    jd = YS - jy
    joint = np.exp(-(jd / (3.4 * S)) ** 2)
    col *= (1 - 0.75 * joint * (1 - M))[..., None]
    tw = 24 * S
    tape = blur(((np.abs(jd) < tw) * M).astype(np.float32), 1.0 * S)
    weave = 0.5 + 0.5 * np.sin(XS / (2.2 * S)) * np.sin(YS / (2.2 * S))
    tape_col = np.array([0.90, 0.93, 0.95], dtype=np.float32) * (0.86 + 0.12 * weave[..., None])
    col = col * (1 - tape[..., None]) + tape_col * tape[..., None]
    col *= (1 - 0.22 * np.exp(-((np.abs(jd) - tw) / (2.2 * S)) ** 2) * M)[..., None]
    col *= (1 - 0.18 * np.exp(-((XS - edge) / (3 * S)) ** 2))[..., None]   # wet edge shadow line
    # parapet shadow (hard-edged, cool)
    u = (XS / W) * 0.55 + (YS / H) * 0.83
    sh = np.clip(smoothstep(0.80, 0.85, u) - smoothstep(1.0, 1.06, u), 0, 1)
    sh = blur(sh, 2.0 * S)
    col = col * (1 - 0.50 * sh[..., None]) * (1 + 0.0) + np.array([0.04, 0.10, 0.18], dtype=np.float32) * 0.16 * sh[..., None]
    sun = smoothstep(0.1, 1.0, 1 - np.hypot(XS / W - 0.15, YS / H - 0.05) * 1.3)
    col += sun[..., None] * np.array([0.12, 0.09, 0.03], dtype=np.float32)
    col *= vignette(H, W, 0.28, 2.0)[..., None]
    col = tone(col, 0.98, 1.08, 1.0)
    return grain(col, 0.012, 6)


# --------------------------------------------------------------- 5. COATED STEEL + WELD
def steel():
    brush = fbm(H, W, 1.3, 81, aniso=(0.03, 1.0))
    brush2 = fbm(H, W, 1.0, 82, aniso=(0.06, 1.0))
    sweep = np.sin((XS / W * 1.1 + YS / H * 0.9) * 3.1) * 0.5 + 0.5
    lum = 0.42 + 0.10 * brush + 0.05 * brush2 + 0.34 * sweep ** 2.0
    steel_col = gradient_map(np.clip(lum, 0, 1), [(0, '#10161d'), (0.4, '#3e4a56'), (0.7, '#7d8b98'), (1, '#d7e0e8')])
    # rust blooms on the bare upper zone
    rust_n = smoothstep(0.7, 1.7, fbm(H, W, 2.0, 83) + 0.5 * fbm(H, W, 1.0, 84))
    rust_n *= smoothstep(0.52, 0.12, YS / H)
    rust_col = gradient_map(np.clip(0.2 + rust_n * 0.8 + 0.1 * brush, 0, 1), [(0, '#4a2410'), (0.5, '#9a4a18'), (1, '#d97b25')])
    steel_col = steel_col * (1 - 0.8 * rust_n[..., None]) + rust_col * 0.8 * rust_n[..., None]
    # weld bead with ripples and temper colours
    wy = 0.50 * H + 0.012 * H * np.sin(XS / W * 6.0)
    wd = (YS - wy) / (0.034 * H)
    bead = np.clip(1 - wd ** 2, 0, 1)
    ripple = np.sin(XS / (6.0 * S) + 2.5 * blur(fbm(H, W, 2.0, 85), 6 * S) + wd * 2.2)
    bead_h = bead * (0.55 + 0.45 * ripple)
    temper = gradient_map(np.clip(np.abs(wd) / 3.0, 0, 1), [(0, '#8e8f93'), (0.32, '#c79a3c'), (0.5, '#5b6fa8'), (0.75, '#4a5a78'), (1.0, '#3e4a56')])
    tz = smoothstep(3.0, 0.7, np.abs(wd))
    steel_col = steel_col * (1 - 0.7 * tz[..., None]) + temper * 0.7 * tz[..., None] * (0.7 + 0.5 * sweep[..., None])
    hh = blur(bead_h * 7.0, 0.7 * S)
    shade, _ = shade_from_height(hh, light=(0.3, -0.8, 0.5), strength=1.0)
    steel_col *= (0.55 + 0.9 * shade[..., None]) * bead[..., None] + (1 - bead[..., None])
    steel_col += (bead * np.clip(shade - 0.8, 0, 1) * 2.5)[..., None] * 0.5
    # coating zone (amber) with brushed, irregular edge
    cedge = 0.67 * H + blur(fbm(H, W, 1.8, 86, aniso=(0.35, 1.0)), 5 * S) * 0.03 * H + 0.018 * H * np.sin(XS / W * 4)
    CM = blur((YS > cedge).astype(np.float32), 1.8 * S)
    peel = fbm(H, W, 0.9, 87)
    cl = 0.62 + 0.08 * peel + 0.10 * blur(fbm(H, W, 2.4, 88), 20 * S) + 0.30 * sweep ** 2.4
    coat_col = gradient_map(np.clip(cl, 0, 1), [(0, '#7a3a00'), (0.35, '#d9820a'), (0.65, '#f5a800'), (1, '#ffe08a')])
    # wet-edge ridge highlight
    ridge = np.exp(-((YS - cedge) / (3.5 * S)) ** 2)
    coat_col += (ridge * 0.25)[..., None]
    col = steel_col * (1 - CM[..., None]) + coat_col * CM[..., None]
    col *= vignette(H, W, 0.38, 2.0)[..., None]
    col = tone(col, 1.0, 1.08, 1.04)
    return grain(col, 0.012, 7)


# --------------------------------------------------------------- 6. METALLIC EPOXY
def metallic():
    def smooth(seed, sig, beta=2.8):
        a = blur(fbm(H, W, beta, seed), sig * S)
        return a / (a.std() + 1e-6)
    q1, q2 = smooth(91, 30), smooth(92, 30)
    t = smooth(93, 12)
    t = warp(t, q1 * 120 * S, q2 * 120 * S)
    t2 = warp(smooth(94, 8), q2 * 90 * S, q1 * 90 * S)
    veins = np.clip(1 - np.abs(np.sin(t * 1.5 + t2 * 0.9)), 0, 1) ** 5
    v2 = np.clip(1 - np.abs(np.sin(t2 * 1.7 - t * 0.6)), 0, 1) ** 14
    tt = norm01(t * 0.6 + t2 * 0.4)
    base = gradient_map(tt, [(0, '#041424'), (0.3, '#08334d'), (0.55, '#0e6b87'), (0.8, '#16a0b2'), (1, '#7fd4d8')])
    col = base * (0.85) + veins[..., None] * np.array([0.55, 0.78, 0.86], dtype=np.float32) * 0.55
    col += v2[..., None] * np.array([0.95, 0.66, 0.12], dtype=np.float32) * 0.55
    # metallic flecks
    fl = smoothstep(2.6, 3.4, fbm(H, W, 0.4, 95))
    col += fl[..., None] * np.array([1.0, 0.85, 0.5], dtype=np.float32) * 0.5
    # gloss: surface normal from the pattern + a soft window reflection
    hgt = blur(t * 1.2 + t2 * 0.8, 2.0 * S)
    shade, _ = shade_from_height(hgt * 8, light=(-0.4, -0.7, 0.55), strength=1.0)
    col *= 0.75 + 0.5 * shade[..., None]
    win = smoothstep(0.0, 1.0, 1 - np.abs((XS / W * 0.8 + YS / H * 0.6) - 0.62) / 0.16)
    win = blur(win, 22 * S)
    col += win[..., None] * np.array([0.40, 0.58, 0.68], dtype=np.float32) * 0.45
    col += (np.clip(shade - 0.82, 0, 1) ** 1.3 * 2.2)[..., None] * np.array([0.7, 0.85, 0.9], dtype=np.float32) * 0.35
    col *= vignette(H, W, 0.35, 2.0)[..., None]
    col = tone(col, 1.0, 1.06, 1.05)
    return grain(col, 0.012, 8)


SCENES = {'tank': tank, 'floor': floor, 'repair': repair, 'roof': roof, 'steel': steel, 'metallic': metallic}
for name, fn in SCENES.items():
    if want(name):
        img = fn()
        print(name, save(img, f'{OUTDIR}/{name}.webp', quality=80))
