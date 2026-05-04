"""
Processa mockups oficiais Argho da pasta NOVOS MOCKUPS.
Remove fundo branco/cinza via rembg + salva PNG transparente em apps/website/public/products/.

Mapping: arquivo → slug do produto (espelho do products.ts)
Mockups sem produto correspondente em products.ts são processados mas
salvos com nome em kebab-case para uso futuro.
"""
import sys
import time
from pathlib import Path

from PIL import Image
from rembg import remove, new_session

SRC_DIR = Path(r"C:\Users\Usuario\Desktop\ARGHO AGROSCIENCES\MARKETING\mockups\NOVOS MOCKUPS")
DST_DIR = Path(r"C:\Users\Usuario\Desktop\colheita\apps\website\public\products")

# Filename → product slug
MAPPING = {
    "BIOVAS- 1L.png": "biovas",
    "BOVEX - 1L.png": "bovex",
    "CONTROX - 1L.png": "controx",
    "DEFON - 1L.png": "defon",
    "GROW CALCIUM - 1L.png": "grow-calcium",
    "Impuch - 1L.png": "impuch",
    "LIFEON - 1L.png": "lifeon",  # slug do produto é 'life-on' mas arquivo fica 'lifeon.png' por convenção da app
    "NEMAX - 1L.png": "nemax",
    "OPERATE 4EM1 - 1L.png": "operate-4em1",
    "OPERATE CITRONELA - 1L.png": "operate-citronela",
    "OPERATE ORANGE - 1L.png": "operate-orange",
    "OPERATE PLUS - 1L.png": "operate-plus",
    "STRON - 1L.png": "stron",
    "TROIAN - 1L.png": "troian",
}

def process(session, src: Path, dst: Path) -> tuple[int, int]:
    """Process one image. Returns (input_size, output_size) in bytes."""
    in_size = src.stat().st_size
    img = Image.open(src)
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    cut = remove(img, session=session)
    # Optimize: convert palette if mostly transparent and quantize
    cut.save(dst, format="PNG", optimize=True, compress_level=9)
    out_size = dst.stat().st_size
    return in_size, out_size

def main():
    if not SRC_DIR.exists():
        print(f"ERRO: pasta de origem não existe: {SRC_DIR}", file=sys.stderr)
        sys.exit(1)
    DST_DIR.mkdir(parents=True, exist_ok=True)

    # Use the smaller, faster general-purpose model
    print("Carregando modelo isnet-general-use…")
    session = new_session("isnet-general-use")
    print("Modelo pronto.")

    total_in = 0
    total_out = 0
    processed = 0
    for filename, slug in MAPPING.items():
        src = SRC_DIR / filename
        dst = DST_DIR / f"{slug}.png"
        if not src.exists():
            print(f"  ! arquivo não encontrado: {filename} (slug {slug})")
            continue
        t0 = time.time()
        try:
            in_size, out_size = process(session, src, dst)
        except Exception as e:
            print(f"  ! erro processando {filename}: {e}")
            continue
        dt = time.time() - t0
        total_in += in_size
        total_out += out_size
        processed += 1
        ratio = (out_size / in_size) * 100
        print(f"  ✓ {slug:22s} {in_size/1024/1024:5.2f}MB -> {out_size/1024/1024:5.2f}MB ({ratio:5.1f}%)  {dt:5.1f}s")

    print()
    print(f"Total: {processed}/{len(MAPPING)} arquivos.")
    print(f"Input:  {total_in/1024/1024:6.2f} MB")
    print(f"Output: {total_out/1024/1024:6.2f} MB")
    print(f"Saved:  {(total_in - total_out)/1024/1024:+6.2f} MB ({100 - (total_out/total_in)*100:.1f}% reduction)")

if __name__ == "__main__":
    main()
