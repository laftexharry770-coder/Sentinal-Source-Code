#!/usr/bin/env python3
"""pack.py - turns a render from tools/icons/render.html into the small PNG
that ships in assets/icons/.

    python3 tools/icons/pack.py <render.png> <size> <out.png>

The render is drawn at twice the size; this scales it down, then holds it to
a palette of 256 colours with error diffusion. That takes a 512px icon from
about 230 KB to under 90 KB, which matters: every phone that opens the site
fetches the icons, at whatever speed its connection has. ffmpeg chooses the
palette (it gave the smoothest chrome of everything tried). Its palette
cannot hold partial transparency, so the tile's soft rounded corners get 16
entries of their own here. Run twice, it writes the same bytes.

Needs Pillow (pip install pillow) and ffmpeg (set FFMPEG if it is not on the
PATH). The exact line for each shipped file is in assets/img/README.md.
"""
import os
import subprocess
import sys
import tempfile

from PIL import Image

INK = (7, 8, 12)          # --bg at Night, under everything the shader leaves clear
FFMPEG = os.environ.get('FFMPEG', 'ffmpeg')


def palette(rgb, colours):
    """ffmpeg's palette and dithering for an opaque picture; returns (indices, rgb palette)."""
    with tempfile.TemporaryDirectory() as tmp:
        src, out = os.path.join(tmp, 'in.png'), os.path.join(tmp, 'out.png')
        rgb.save(src)
        subprocess.run([FFMPEG, '-loglevel', 'error', '-y', '-i', src, '-vf',
                        'split[a][b];[a]palettegen=max_colors=%d:reserve_transparent=0:stats_mode=full[p];'
                        '[b][p]paletteuse=dither=sierra2_4a' % colours, out], check=True)
        q = Image.open(out)
        q.load()
        return list(q.tobytes()), q.getpalette()[:3 * colours]


def main(src, size, dst):
    im = Image.open(src).convert('RGBA').resize((size, size), Image.LANCZOS)
    alpha = list(im.getchannel('A').tobytes())
    rgb = Image.new('RGB', im.size, INK)
    rgb.paste(im, mask=im.getchannel('A'))

    if min(alpha) == 255:                       # full-bleed: one palette, nothing see-through
        idx, pal = palette(rgb, 256)
        out = Image.frombytes('P', im.size, bytes(idx))
        out.putpalette(pal)
        out.save(dst, optimize=True)
        return

    # A tile: 239 colours for the picture, one fully clear entry for the
    # corners, and 16 partly clear ones for the edge between them: eight
    # even steps of clearness, each in two colours, for the lit top edge and
    # for the darker sides.
    idx, pal = palette(rgb, 239)
    data = im.tobytes()
    groups = {}
    for i, a in enumerate(alpha):
        if a == 0:
            idx[i] = 239
        elif a < 255:
            key = (i // size < size // 2, round(a * 7 / 255))
            groups.setdefault(key, []).append(i)
    rgb_pal = pal + [0, 0, 0]
    trns = [255] * 239 + [0]
    for n, key in enumerate(sorted(groups)):
        members = groups[key]
        mean = [round(sum(data[4 * i + c] for i in members) / len(members)) for c in range(4)]
        rgb_pal += mean[:3]
        trns.append(mean[3])
        for i in members:
            idx[i] = 240 + n
    out = Image.frombytes('P', im.size, bytes(idx))
    out.putpalette(rgb_pal)
    out.save(dst, optimize=True, transparency=bytes(trns))


if __name__ == '__main__':
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    main(sys.argv[1], int(sys.argv[2]), sys.argv[3])
