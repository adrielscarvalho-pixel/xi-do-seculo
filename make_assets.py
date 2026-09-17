import sys, os, tempfile, urllib.request
from PIL import Image, ImageDraw, ImageFont
out = sys.argv[1] if len(sys.argv) > 1 else 'public'
os.makedirs(out, exist_ok=True)
F = {'bs': 'https://github.com/google/fonts/raw/main/ofl/bigshouldersdisplay/BigShouldersDisplay%5Bwght%5D.ttf', 'ar': 'https://github.com/google/fonts/raw/main/ofl/archivo/Archivo%5Bwdth,wght%5D.ttf'}
TMP = tempfile.gettempdir()
def font_path(k): return os.path.join(TMP, f'xi-{k}.ttf')
for k, u in F.items():
    if not os.path.exists(font_path(k)):
        urllib.request.urlretrieve(u, font_path(k))
G1, G2, INK, WHITE, GOLD = (29, 94, 63), (26, 85, 57), (16, 38, 27), (255, 255, 255), (246, 210, 88)
def bs(size, w=800):
    f = ImageFont.truetype(font_path('bs'), size); f.set_variation_by_axes([w]); return f
def ar(size, w=600):
    f = ImageFont.truetype(font_path('ar'), size); f.set_variation_by_axes([100, w]); return f
S = 512
img = Image.new('RGBA', (S, S)); d = ImageDraw.Draw(img)
for i in range(8): d.rectangle([0, i * S / 8, S, (i + 1) * S / 8], fill=G1 if i % 2 == 0 else G2)
ov = Image.new('RGBA', (S, S), (0, 0, 0, 0)); o = ImageDraw.Draw(ov); a = (255, 255, 255, 120)
o.line([0, S / 2, S, S / 2], fill=a, width=8); o.ellipse([S / 2 - 154, S / 2 - 154, S / 2 + 154, S / 2 + 154], outline=a, width=8)
img.alpha_composite(ov); d = ImageDraw.Draw(img)
d.ellipse([S / 2 - 120, S / 2 - 120, S / 2 + 120, S / 2 + 120], fill=WHITE, outline=INK, width=5)
d.text((S / 2, S / 2 + 6), 'XI', font=bs(154), fill=INK, anchor='mm')
rgb = img.convert('RGB')
rgb.save(f'{out}/icon-512.png'); rgb.save(f'{out}/icon-maskable-512.png')
for n, s in [('icon-192.png', 192), ('apple-touch-icon.png', 180), ('favicon-32.png', 32)]:
    rgb.resize((s, s), Image.LANCZOS).save(f'{out}/{n}')
W, H = 1200, 630
og = Image.new('RGBA', (W, H), INK); pitch = Image.new('RGBA', (660, H)); p = ImageDraw.Draw(pitch)
for i in range(10): p.rectangle([i * 66, 0, (i + 1) * 66, H], fill=G1 if i % 2 == 0 else G2)
ov = Image.new('RGBA', (660, H), (0, 0, 0, 0)); o = ImageDraw.Draw(ov); a = (255, 255, 255, 125)
o.rectangle([22, 22, 638, 608], outline=a, width=3); o.line([330, 22, 330, 608], fill=a, width=3)
o.ellipse([268, 253, 392, 377], outline=a, width=3); o.rectangle([22, 170, 122, 460], outline=a, width=3); o.rectangle([538, 170, 638, 460], outline=a, width=3)
pitch.alpha_composite(ov); og.alpha_composite(pitch, (540, 0)); d = ImageDraw.Draw(og)
d.text((56, 70), 'O XI do', font=bs(132), fill=WHITE); d.text((56, 196), 'século', font=bs(132), fill=WHITE)
for i, l in enumerate(['Títulos e prêmios de 2001 a 2026', 'viram pontos, com peso para a força', 'da liga e a hegemonia do clube.']):
    d.text((58, 372 + i * 42), l, font=ar(30, 500), fill=(214, 226, 217))
d.text((58, 548), 'Índice de legado — 97 jogadores avaliados', font=ar(26, 600), fill=GOLD)
X = [('Casillas', 407, 600, 315, True), ('Marcelo', 375, 712, 112, False), ('Sergio Ramos', 607, 712, 244, False), ('Piqué', 473, 712, 386, False), ('Daniel Alves', 411, 712, 518, False),
     ('Iniesta', 646, 890, 150, False), ('Modrić', 576, 890, 315, False), ('Xavi', 542, 890, 480, False), ('C. Ronaldo', 1423, 1085, 150, False), ('Benzema', 413, 1085, 315, False), ('Messi', 1985, 1085, 480, False)]
for name, pts, x, y, gk in X:
    d.ellipse([x - 30, y - 30, x + 30, y + 30], fill=GOLD if gk else WHITE, outline=INK, width=2)
    d.text((x, y + 1), f"{pts:,}".replace(',', '.'), font=bs(26), fill=INK, anchor='mm')
    tf = ar(19, 600); tw = d.textlength(name, font=tf)
    d.rounded_rectangle([x - tw / 2 - 6, y + 36, x + tw / 2 + 6, y + 62], radius=4, fill=(8, 26, 17)); d.text((x, y + 49), name, font=tf, fill=WHITE, anchor='mm')
og.convert('RGB').save(f'{out}/og.png', optimize=True)
print('imagens geradas em', out)
