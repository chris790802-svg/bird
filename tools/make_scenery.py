"""產生背景森林的 SVG（src/scenery.html）。用法：python3 tools/make_scenery.py"""
import random, math
from pathlib import Path
R = random.Random(2026)
W, H = 1200, 300

def hill(y0, amp, seed_phase, step=40):
    pts = []
    for x in range(-40, W + 41, step):
        y = y0 + amp * math.sin(x / 140 + seed_phase) + amp * .5 * math.sin(x / 57 + seed_phase * 2)
        pts.append((x, y))
    d = f'M{pts[0][0]},{H} ' + ' '.join(f'L{x:.0f},{y:.1f}' for x, y in pts) + f' L{pts[-1][0]},{H} Z'
    return d, pts

def y_at(pts, x):
    for (x1, y1), (x2, y2) in zip(pts, pts[1:]):
        if x1 <= x <= x2:
            return y1 + (y2 - y1) * (x - x1) / (x2 - x1)
    return pts[-1][1]

def pine(x, base, h):
    w = h * .42
    tiers = []
    for k in range(3):
        top = base - h + k * h * .24
        bot = base - h * (.42 - k * .18) if k < 2 else base - h * .06
        ww = w * (.55 + k * .25)
        tiers.append(f'M{x:.1f},{top:.1f} L{x+ww:.1f},{bot:.1f} L{x-ww:.1f},{bot:.1f} Z')
    trunk = f'M{x-h*.04:.1f},{base-h*.08:.1f} h{h*.08:.1f} v{h*.1:.1f} h{-h*.08:.1f} Z'
    return ' '.join(tiers) + ' ' + trunk

def round_tree(x, base, h):
    r = h * .32
    cy = base - h + r
    parts = [f'M{x-h*.05:.1f},{cy:.1f} h{h*.1:.1f} V{base+4:.1f} h{-h*.1:.1f} Z']
    for dx, dy, rr in [(0, 0, 1), (-.7, .45, .72), (.7, .45, .72), (0, .55, .8)]:
        cx_, cy_, r_ = x + dx * r, cy + dy * r, r * rr
        parts.append(f'M{cx_-r_:.1f},{cy_:.1f} a{r_:.1f},{r_:.1f} 0 1,0 {2*r_:.1f},0 a{r_:.1f},{r_:.1f} 0 1,0 {-2*r_:.1f},0 Z')
    return ' '.join(parts)

layers = []
d, far = hill(150, 14, .3)
trees = [pine(x, y_at(far, x) + 6, R.uniform(60, 110)) for x in range(-20, W + 30, 26) if R.random() < .85]
layers.append(('forest-far', d + ' ' + ' '.join(trees)))
d, mid = hill(205, 12, 2.1)
trees = []
for x in range(-10, W + 30, 46):
    x2 = x + R.uniform(-10, 10)
    trees.append((round_tree if R.random() < .55 else pine)(x2, y_at(mid, x2) + 6, R.uniform(70, 115)))
layers.append(('forest-mid', d + ' ' + ' '.join(trees)))
d, near = hill(262, 8, 4.4)
trees = []
for x in range(10, W, 150):
    x2 = x + R.uniform(-30, 30)
    trees.append((pine if R.random() < .5 else round_tree)(x2, y_at(near, x2) + 4, R.uniform(80, 120)))
# 灌木
for x in range(0, W, 70):
    x2 = x + R.uniform(-15, 15); b = y_at(near, x2) + 2; r = R.uniform(10, 18)
    trees.append(f'M{x2-r:.1f},{b:.1f} a{r:.1f},{r:.1f} 0 0,1 {2*r:.1f},0 Z')
layers.append(('forest-near', d + ' ' + ' '.join(trees)))

# 近景的小鳥屋（插在地上）
bx = 600; by = y_at(near, bx) + 2
house = (f'<g class="sc-house"><rect x="{bx-3}" y="{by-58}" width="6" height="58" fill="var(--forest-near)"/>'
         f'<path d="M{bx-20},{by-66} L{bx},{by-84} L{bx+20},{by-66} Z" fill="var(--forest-near)"/>'
         f'<rect x="{bx-15}" y="{by-66}" width="30" height="24" fill="var(--forest-near)"/>'
         f'<circle cx="{bx}" cy="{by-55}" r="5" fill="var(--forest-mid)"/></g>')

svg = (f'<svg class="sc-forest" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMax slice">'
       + ''.join(f'<path d="{d}" fill="var(--{c})"/>' for c, d in layers) + house + '</svg>')

stars = ''.join(f'<circle cx="{R.uniform(0,100):.1f}%" cy="{R.uniform(2,55):.1f}%" r="{R.choice([1,1,1.4,1.8])}"/>' for _ in range(46))
stars = f'<svg class="sc-stars">{stars}</svg>'

flyer = '<svg viewBox="0 0 24 10"><path d="M1 6 Q6 0 12 6 Q18 0 23 6" fill="none" stroke="var(--flyer)" stroke-width="2.2" stroke-linecap="round"/></svg>'
flock = ''.join(f'<span class="sc-fly" style="top:{t}%;animation-duration:{d}s;animation-delay:-{dl}s;width:{w}px">{flyer}</span>'
                for t, d, dl, w in [(12, 46, 4, 22), (15, 46, 6, 16), (30, 62, 30, 18), (22, 54, 18, 14)])

out = f'<div class="scenery" aria-hidden="true"><div class="sc-orb"></div>{stars}{flock}{svg}</div>\n'
Path(__file__).parent.parent.joinpath('src', 'scenery.html').write_text(out, encoding='utf-8')
print('scenery.html', len(out))
