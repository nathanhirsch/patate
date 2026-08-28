#!/usr/bin/env python3
"""Generate neutral placeholder pack images so the app is testable before the
real artwork exists. Each file is a flat muted colour with a big letter so the
two packs in a duel are visually distinguishable.

Run from the repo root:  python3 designs/_generate_placeholders.py
No dependencies — writes PNGs by hand with zlib + struct.
"""
import os
import struct
import zlib

W, H = 800, 1000

# 5x7 bitmap font, just the glyphs we need.
FONT = {
    "A": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    "B": ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    "C": ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
    "D": ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
    "E": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
}

# id -> (background rgb, band rgb, letter rgb)
DESIGNS = {
    "a": ((217, 203, 179), (185, 166, 126), (44, 40, 32)),
    "b": ((196, 208, 193), (147, 166, 141), (34, 46, 38)),
    "c": ((207, 195, 212), (168, 146, 176), (46, 36, 52)),
    "d": ((211, 191, 191), (176, 142, 142), (52, 32, 32)),
    "e": ((188, 204, 214), (143, 174, 192), (30, 44, 52)),
}


def make_pixels(bg, band, letter_rgb, glyph):
    rows = []
    band_top, band_bottom = int(H * 0.62), int(H * 0.74)
    scale = 70
    gw, gh = 5 * scale, 7 * scale
    gx, gy = (W - gw) // 2, int(H * 0.22)
    for y in range(H):
        row = bytearray()
        for x in range(W):
            if band_top <= y < band_bottom:
                r, g, b = band
            else:
                r, g, b = bg
            # border
            if x < 6 or x >= W - 6 or y < 6 or y >= H - 6:
                r, g, b = band
            # glyph
            if gx <= x < gx + gw and gy <= y < gy + gh:
                col = (x - gx) // scale
                rowi = (y - gy) // scale
                if glyph[rowi][col] == "1":
                    r, g, b = letter_rgb
            row += bytes((r, g, b))
        rows.append(bytes(row))
    return rows


def write_png(path, rows):
    def chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data
                + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF))

    raw = b"".join(b"\x00" + r for r in rows)
    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", W, H, 8, 2, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(raw, 9))
    png += chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    for did, (bg, band, letter_rgb) in DESIGNS.items():
        rows = make_pixels(bg, band, letter_rgb, FONT[did.upper()])
        out = os.path.join(here, f"{did}.png")
        write_png(out, rows)
        print("wrote", out)


if __name__ == "__main__":
    main()
