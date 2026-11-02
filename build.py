"""把 src/ 裡的檔案組成單一的 index.html。用法：python3 build.py"""
from pathlib import Path
d = Path(__file__).parent / 'src'
head = (d / 'head.html').read_text(encoding='utf-8')
css = (d / 'style.css').read_text(encoding='utf-8') + (d / 'style2.css').read_text(encoding='utf-8')
body = (d / 'scenery.html').read_text(encoding='utf-8') + (d / 'body.html').read_text(encoding='utf-8')
parts = ['01-core.js','02-logic.js','03-gen.js','04-birds.js','05-meta.js','06-ui.js','07-modes.js','08-tutorial.js','09-boot.js']
js = ''.join((d / f).read_text(encoding='utf-8') for f in parts)
reset = (':root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
         'body{margin:0;font:14px/1.5 system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}')
html = ('<!doctype html>\n<html lang="zh-Hant">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
        '<meta name="description" content="鳥巢數獨：用小鳥當線索的數字推理遊戲，100 關、8 種鳥規則、每日一題、圖鑑與鳥園。">\n'
        "<script>try{var t=JSON.parse(localStorage.getItem('kp4-prog')||'{}').theme;if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>\n"
        f'<style>{reset}</style>\n{head}<style>{css}</style>\n</head>\n<body>\n{body}\n'
        f'<script>\n(()=>{{\n{js}\n}})();\n</script>\n</body>\n</html>\n')
import hashlib
build = hashlib.sha1(html.encode('utf-8')).hexdigest()[:10]
html = html.replace('<meta charset="utf-8">\n', f'<meta charset="utf-8">\n<meta name="build" content="{build}">\n', 1)
(Path(__file__).parent / 'index.html').write_text(html, encoding='utf-8')
print('index.html', len(html.encode('utf-8')), 'bytes')
