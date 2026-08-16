from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "public" / "images"
DIRS = [
    ROOT / "myactiv",
    ROOT / "catalog-menu",
    ROOT / "payouts-menu",
    ROOT / "services-menu",
    ROOT / "support-menu",
]

THRESHOLD = 22
MAX_SIZE = 256
WEBP_QUALITY = 82


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


def process(path: Path) -> str | None:
    if path.name == "6.png" and path.parent.name == "payouts-menu":
        return None
    im = Image.open(path)
    out = remove_black_bg(im)
    out.thumbnail((MAX_SIZE, MAX_SIZE), Image.Resampling.LANCZOS)
    webp = path.with_suffix(".webp")
    out.save(webp, "WEBP", quality=WEBP_QUALITY, method=6)
    png_kb = path.stat().st_size / 1024
    webp_kb = webp.stat().st_size / 1024
    return f"{path.parent.name}/{path.name}: {png_kb:.0f}KB -> {webp.name} {webp_kb:.0f}KB"


def main() -> None:
    results: list[str] = []
    for d in DIRS:
        if not d.exists():
            continue
        for p in sorted(d.glob("*.png")):
            try:
                r = process(p)
                if r:
                    results.append(r)
            except Exception as e:  # noqa: BLE001
                results.append(f"ERR {p}: {e}")
    print("\n".join(results))
    print(f"\nDone: {len(results)} files")


if __name__ == "__main__":
    main()
