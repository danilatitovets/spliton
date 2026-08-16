from pathlib import Path

from PIL import Image

SRC = Path(r"C:\Users\danik\.cursor\projects\d-Projects-spliton\assets")
DEST = Path(r"d:\Projects\spliton\apps\frontend\public\images\secondary-market")

JOBS = [
    ("create-listing-empty-new.png", "create-listing-empty.webp", 320),
    ("create-listing-catalog-cta.png", "create-listing-catalog.webp", 128),
    ("create-listing-assets-cta.png", "create-listing-assets.webp", 128),
]

THRESHOLD = 24


def remove_black_bg(im: Image.Image, threshold: int = THRESHOLD) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    visited: set[tuple[int, int]] = set()
    stack: list[tuple[int, int]] = []
    for x in range(w):
        stack.append((x, 0))
        stack.append((x, h - 1))
    for y in range(h):
        stack.append((0, y))
        stack.append((w - 1, y))
    while stack:
        x, y = stack.pop()
        if (x, y) in visited or x < 0 or y < 0 or x >= w or y >= h:
            continue
        visited.add((x, y))
        r, g, b, a = px[x, y]
        if max(r, g, b) <= threshold and a > 0:
            px[x, y] = (0, 0, 0, 0)
            stack.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return im


def main() -> None:
    DEST.mkdir(parents=True, exist_ok=True)
    for src_name, dest_name, size in JOBS:
        src = SRC / src_name
        im = remove_black_bg(Image.open(src))
        im.thumbnail((size, size), Image.Resampling.LANCZOS)
        out = DEST / dest_name
        im.save(out, "WEBP", quality=85, method=6)
        a0 = sum(1 for p in im.getdata() if p[3] == 0)
        print(f"{dest_name}: {out.stat().st_size/1024:.1f}KB transparent={a0} corner={im.getpixel((0,0))}")


if __name__ == "__main__":
    main()
