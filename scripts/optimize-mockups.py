"""
Otimiza os 16 mockups de produto via quantizacao paletizada (Pillow).
Reduz tamanho 60-75% mantendo alpha transparente e qualidade visual aceitavel.

Strategy:
- PNG RGBA atual (16-bit color depth, 256 alpha levels) → PNG paletizada P+alpha
- Quantize para 256 cores (palette mode) preservando transparencia
- pngquant-style approach via Pillow built-in (sem dependencias externas)

Roda da raiz do repo: python scripts/optimize-mockups.py
"""
import sys
from pathlib import Path

from PIL import Image

DIR = Path(r"C:\Users\Usuario\Desktop\colheita\apps\website\public\products")

def optimize(src: Path) -> tuple[int, int]:
    """Optimize one PNG. Returns (input_size, output_size) in bytes."""
    in_size = src.stat().st_size
    img = Image.open(src)

    # Garantir RGBA (algumas podem estar em modos diferentes)
    if img.mode != "RGBA":
        img = img.convert("RGBA")

    # Quantize com Pillow — Octree built-in (libimagequant nao compilado no build do Windows)
    # method=2 (FastOctree) preserva transparencia e da boa qualidade pra produtos com poucas cores dominantes
    quantized = img.quantize(colors=256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG)

    # Salvar otimizado com compressao maxima
    quantized.save(src, format="PNG", optimize=True, compress_level=9)
    out_size = src.stat().st_size
    return in_size, out_size

def main():
    if not DIR.exists():
        print(f"ERRO: {DIR} nao existe", file=sys.stderr)
        sys.exit(1)

    pngs = sorted(DIR.glob("*.png"))
    if not pngs:
        print(f"ERRO: nenhum PNG em {DIR}", file=sys.stderr)
        sys.exit(1)

    print(f"Otimizando {len(pngs)} mockups...")
    total_in = 0
    total_out = 0
    for png in pngs:
        try:
            in_size, out_size = optimize(png)
        except Exception as e:
            print(f"  ! erro {png.name}: {e}")
            continue
        total_in += in_size
        total_out += out_size
        ratio = (out_size / in_size) * 100
        print(f"  ok {png.name:32s} {in_size/1024:5.0f}KB -> {out_size/1024:5.0f}KB ({ratio:5.1f}%)")

    print()
    print(f"Total: {len(pngs)} arquivos")
    print(f"Input:  {total_in/1024/1024:6.2f} MB")
    print(f"Output: {total_out/1024/1024:6.2f} MB")
    print(f"Saved:  {(total_in - total_out)/1024/1024:+6.2f} MB ({100 - (total_out/total_in)*100:.1f}% reduction)")

if __name__ == "__main__":
    main()
