import os, urllib.request

dir_path = 'e:/风险管控0618/pages/webfonts'
os.makedirs(dir_path, exist_ok=True)

base = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts'
files = [
    'fa-brands-400.woff2', 'fa-brands-400.ttf',
    'fa-regular-400.woff2', 'fa-regular-400.ttf',
    'fa-solid-900.woff2', 'fa-solid-900.ttf',
    'fa-v4compatibility.woff2', 'fa-v4compatibility.ttf'
]

for f in files:
    url = f'{base}/{f}'
    out = os.path.join(dir_path, f)
    urllib.request.urlretrieve(url, out)
    print(f'Downloaded {f}')

for f in os.listdir(dir_path):
    print(f, os.path.getsize(os.path.join(dir_path, f)))
