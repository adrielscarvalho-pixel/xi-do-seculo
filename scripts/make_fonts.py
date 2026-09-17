"""Gera as fontes estáticas usadas pelo site a partir das variáveis do Google Fonts.

Fontes estáticas custam bem menos para diagramar no celular do que as variáveis:
nos testes do Lighthouse, o tempo de bloqueio caiu pela metade.

    pip install fonttools brotli
    python scripts/make_fonts.py
"""
import os
import tempfile
import urllib.request

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'fonts')
BASE = 'https://fonts.gstatic.com/s'
SOURCES = {
    ('archivo', 'latin'): f'{BASE}/archivo/v25/k3kPo8UDI-1M0wlSV9XAw6lQkqWY8Q82sLydOxI.woff2',
    ('archivo', 'latin-ext'): f'{BASE}/archivo/v25/k3kPo8UDI-1M0wlSV9XAw6lQkqWY8Q82sLyTOxK-vA.woff2',
    ('big-shoulders', 'latin'): f'{BASE}/bigshouldersdisplay/v24/fC1_PZJEZG-e9gHhdI4-NBbfd2ys3SjJCx1czNDu.woff2',
    ('big-shoulders', 'latin-ext'): f'{BASE}/bigshouldersdisplay/v24/fC1_PZJEZG-e9gHhdI4-NBbfd2ys3SjJCx1cwtDuHpM.woff2',
}
WEIGHTS = {'archivo': [400, 500, 600], 'big-shoulders': [700, 800]}

os.makedirs(OUT, exist_ok=True)
for (family, subset), url in SOURCES.items():
    src = os.path.join(tempfile.gettempdir(), f'xi-{family}-{subset}-var.woff2')
    if not os.path.exists(src):
        urllib.request.urlretrieve(url, src)
    for weight in WEIGHTS[family]:
        font = instantiateVariableFont(TTFont(src), {'wght': weight})
        font.flavor = 'woff2'
        path = os.path.join(OUT, f'{family}-{weight}-{subset}.woff2')
        font.save(path)
        print(f'{os.path.basename(path)}: {os.path.getsize(path) // 1024} KB')
