"""把 src/icon.svg 轉成各種尺寸的 PNG 圖示。用法：python3 tools/make_icons.py"""
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image
root = Path(__file__).resolve().parent.parent
svg = (root / 'src' / 'icon.svg').read_text(encoding='utf-8')
big = root / 'icon-1024.png'
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1024, 'height': 1024})
    pg.set_content(f'<html><body style="margin:0">{svg}</body></html>')
    pg.locator('svg').first.screenshot(path=str(big)); b.close()
im = Image.open(big).convert('RGB')
for s in (512, 192, 180):
    im.resize((s, s), Image.LANCZOS).save(root / f'icon-{s}.png', optimize=True)
print('icons done')
