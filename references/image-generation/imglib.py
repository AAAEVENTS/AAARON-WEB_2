"""Small procedural-rendering toolkit used to create the original AAARON site imagery.

Everything here is generated from noise + simple optics. No third-party photography is used.
"""
import numpy as np
import cv2
from PIL import Image
from scipy import ndimage as ndi


def hex2rgb(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float32) / 255.0


def fbm(h, w, beta=2.0, seed=0, aniso=(1.0, 1.0)):
    """Fractal (1/f^beta) noise via FFT. Output normalised to zero mean / unit std."""
    rng = np.random.default_rng(seed)
    n = rng.standard_normal((h, w)).astype(np.float32)
    F = np.fft.rfft2(n)
    fy = (np.fft.fftfreq(h)[:, None] * aniso[1]).astype(np.float32)
    fx = (np.fft.rfftfreq(w)[None, :] * aniso[0]).astype(np.float32)
    f = np.sqrt(fx ** 2 + fy ** 2)
    f[0, 0] = 1.0
    F *= (1.0 / (f ** (beta / 2.0))).astype(np.float32)
    F[0, 0] = 0
    out = np.fft.irfft2(F, s=(h, w)).astype(np.float32)
    return (out - out.mean()) / (out.std() + 1e-6)


def norm01(a, lo=None, hi=None):
    lo = np.percentile(a, 1) if lo is None else lo
    hi = np.percentile(a, 99) if hi is None else hi
    return np.clip((a - lo) / (hi - lo + 1e-9), 0, 1)


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0 + 1e-9), 0, 1)
    return t * t * (3 - 2 * t)


def gradient_map(t, stops):
    """t in 0..1 (H,W). stops: [(pos,'#hex'),...]. Returns (H,W,3)."""
    pos = np.array([s[0] for s in stops], dtype=np.float32)
    cols = np.stack([hex2rgb(s[1]) for s in stops])
    out = np.zeros(t.shape + (3,), dtype=np.float32)
    for c in range(3):
        out[..., c] = np.interp(t, pos, cols[:, c])
    return out


def shade_from_height(H, light=(0.55, -0.6, 0.6), strength=1.0, ambient=0.0):
    gy, gx = np.gradient(H)
    nx, ny, nz = -gx * strength, -gy * strength, np.ones_like(H)
    ln = np.sqrt(nx * nx + ny * ny + nz * nz)
    nx, ny, nz = nx / ln, ny / ln, nz / ln
    L = np.array(light, dtype=np.float32)
    L /= np.linalg.norm(L)
    return np.clip(nx * L[0] + ny * L[1] + nz * L[2], 0, 1) * (1 - ambient) + ambient, (nx, ny, nz)


def warp(img, dx, dy):
    """Backward-warp image by per-pixel offsets (pixels)."""
    h, w = dx.shape
    xs, ys = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
    return cv2.remap(img.astype(np.float32), xs + dx.astype(np.float32), ys + dy.astype(np.float32),
                     interpolation=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)


def blur(img, sigma):
    if sigma <= 0:
        return img
    return cv2.GaussianBlur(img.astype(np.float32), (0, 0), sigma)


def grain(img, amount=0.03, seed=1):
    rng = np.random.default_rng(seed)
    g = rng.standard_normal(img.shape[:2]).astype(np.float32)
    g = blur(g, 0.6)
    return img + (g[..., None] if img.ndim == 3 else g) * amount


def vignette(h, w, strength=0.35, power=2.2, cx=0.5, cy=0.5):
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.sqrt(((xs / w - cx) * 1.1) ** 2 + ((ys / h - cy) * 1.0) ** 2)
    return 1.0 - strength * np.clip(d * 1.25, 0, 1) ** power


def tone(img, exposure=1.0, contrast=1.0, saturation=1.0):
    x = img * exposure
    x = (x - 0.5) * contrast + 0.5
    if saturation != 1.0:
        l = (x[..., 0] * 0.299 + x[..., 1] * 0.587 + x[..., 2] * 0.114)[..., None]
        x = l + (x - l) * saturation
    return np.clip(x, 0, 1)


def save(img, path, quality=82, max_w=None):
    a = (np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8)
    im = Image.fromarray(a)
    if max_w and im.width > max_w:
        im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
    kw = {'quality': quality, 'method': 6} if path.endswith('.webp') else {'quality': quality, 'optimize': True}
    im.save(path, **kw)
    return im.size
