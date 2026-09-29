"""Extract the Krishna / Vyasa / offering characters from the design canvas
(.dc.html files) into standalone animated SVG files for the website."""
import re, os, sys

# usage: python tools/build_svgs.py <folder with Krishna/Vyasa/Item .dc.html> [assets folder]
SRC = sys.argv[1] if len(sys.argv) > 1 else 'canvas'
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), '..', 'assets')

ANIM_CSS = """
@keyframes b{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes br{0%,100%{transform:scale(1,1)}50%{transform:scale(1.015,.985)}}
@keyframes bl{0%,93%,100%{transform:scaleY(1)}96%{transform:scaleY(.08)}}
@keyframes tw{0%,100%{opacity:.25;transform:scale(.6) rotate(0deg)}50%{opacity:1;transform:scale(1) rotate(20deg)}}
@keyframes wv{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-16deg)}}
@keyframes rk{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}
@keyframes sw{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
@keyframes nt{0%{opacity:0;transform:translate(0,6px)}30%{opacity:1}100%{opacity:0;transform:translate(8px,-18px)}}
@keyframes fl{0%,100%{transform:scale(1,1) rotate(0deg)}30%{transform:scale(.94,1.06) rotate(-3deg)}60%{transform:scale(1.04,.95) rotate(2deg)}}
.a-bob{animation:b 3.4s ease-in-out infinite}
.a-breathe{animation:br 4s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}
.a-blink{animation:bl 4.2s infinite;transform-box:fill-box;transform-origin:center}
.a-twinkle{animation:tw 1.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.a-wave{animation:wv 1s ease-in-out infinite}
.a-rock{animation:rk 2.8s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}
.a-sway{animation:sw 2.4s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}
.a-note{animation:nt 1.8s ease-out infinite}
.a-flicker{animation:fl .9s ease-in-out infinite}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}
""".strip().replace('\n', '')


def svg_inner(path):
    s = open(path, encoding='utf-8').read()
    m = re.search(r'<svg viewBox="([^"]+)"[^>]*>(.*?)</svg>\s*</div>\s*</x-dc>', s, re.S)
    return m.group(1), m.group(2)


def resolve(body, vals):
    pat = re.compile(r'<sc-if value="\{\{(\w+)\}\}"[^>]*>((?:(?!<sc-if).)*?)</sc-if>', re.S)
    while True:
        m = pat.search(body)
        if not m:
            break
        body = body[:m.start()] + (m.group(2) if vals.get(m.group(1)) else '') + body[m.end():]
    return body


def tidy(body):
    body = re.sub(r'\n\s*\n+', '\n', body)
    return body.strip()


def write(name, viewbox, body, title):
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}">'
           f'<title>{title}</title><style>{ANIM_CSS}</style>\n{tidy(body)}\n</svg>\n')
    with open(os.path.join(OUT, name), 'w', encoding='utf-8') as f:
        f.write(svg)


# Krishna, six ages (+ waving toddler)
vb, inner = svg_inner(f'{SRC}/Krishna.dc.html')
AGES = ['newborn', 'toddler', 'boy', 'teen', 'youth', 'adult']
NAMES = {'newborn': 'Shishu', 'toddler': 'Bal', 'boy': 'Gopal', 'teen': 'Kishore', 'youth': 'Yuva', 'adult': 'Parthasarathi'}
for age in AGES:
    for mood in (['happy', 'wave'] if age == 'toddler' else ['happy']):
        vals = {a: a == age for a in AGES}
        vals.update(wave=mood == 'wave', notWave=mood != 'wave')
        fn = f'krishna/{age}{"-wave" if mood == "wave" else ""}.svg'
        write(fn, vb, resolve(inner, vals), f'{NAMES[age]} Krishna')

# Vyasa
vb, inner = svg_inner(f'{SRC}/Vyasa.dc.html')
for mood in ['idle', 'bless']:
    vals = dict(talk=False, notTalk=True, bless=mood == 'bless', notBless=mood != 'bless')
    write(f'vyasa/{mood}.svg', vb, resolve(inner, vals), 'Vyasa')

# Offerings
vb, inner = svg_inner(f'{SRC}/Item.dc.html')
KINDS = ['venna', 'laddoo', 'milk', 'calf', 'cow', 'peacock', 'garland', 'mala', 'anklets', 'crown', 'flute', 'ball', 'diya', 'jhoola', 'conch']
for k in KINDS:
    write(f'items/{k}.svg', vb, resolve(inner, {x: x == k for x in KINDS}), k)

print('done')
