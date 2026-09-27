import fs from "node:fs";
import zlib from "node:zlib";

const width = 1280;
const height = 640;
const pixels = Buffer.alloc((width * 3 + 1) * height);

const colors = {
  bg: [7, 31, 45],
  panel: [250, 252, 253],
  line: [198, 211, 220],
  ink: [18, 39, 52],
  muted: [88, 108, 120],
  mutedOnDark: [188, 210, 220],
  blue: [18, 91, 127],
  blueSoft: [225, 240, 247],
  mint: [131, 216, 189],
  green: [16, 119, 86],
  greenSoft: [225, 244, 237],
  white: [248, 252, 253],
};

function main() {
  fill(colors.bg);
  rect(0, 0, 18, height, colors.mint);

  rect(72, 58, 52, 52, colors.mint);
  strokeRect(83, 69, 30, 30, colors.bg, 4);
  rect(91, 77, 14, 14, colors.greenSoft);
  text(148, 67, "AI HARDWARE FIT", 3, colors.white);
  text(148, 101, "OPEN SOURCE / NO SIGNUP", 2, colors.mutedOnDark);

  rect(72, 164, 72, 5, colors.mint);
  text(72, 192, "CAN MY GPU", 5, colors.white);
  text(72, 254, "RUN THIS?", 5, colors.white);
  text(72, 326, "3 MODELS / QUANT / RUN COMMAND", 2, colors.mutedOnDark);
  text(72, 386, "151 GPU PRESETS / 332 AI MODELS", 3, colors.mint);
  rect(72, 448, 520, 1, [57, 82, 95]);
  text(72, 477, "MEASURED / REFERENCED / CALCULATED", 2, colors.white);

  rect(690, 58, 526, 524, colors.panel);
  strokeRect(690, 58, 526, 524, colors.line, 2);
  text(726, 91, "PICK A GPU. GET AN ANSWER.", 2, colors.blue);
  text(726, 126, "RTX 5070 TI / 16 GB", 3, colors.ink);
  rect(726, 174, 454, 2, colors.line);

  infoRow(726, 202, "01", "MODEL FIT", "CAN IT RUN?");
  infoRow(726, 302, "02", "QUANT", "WHICH SETTING?");
  infoRow(726, 402, "03", "SPEED", "WHAT TO EXPECT?");

  rect(726, 520, 454, 38, colors.blue);
  text(754, 531, "AI-HARDWARE-FIT / FREE ON GITHUB", 2, colors.white);

  writePng("docs/social-preview.png");
}

function infoRow(x, y, number, title, body) {
  rect(x, y, 48, 48, colors.greenSoft);
  text(x + 7, y + 14, number, 3, colors.green);
  text(x + 72, y + 2, title, 3, colors.ink);
  text(x + 72, y + 39, body, 2, colors.muted);
  rect(x, y + 76, 454, 1, colors.line);
}

function fill(color) {
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      setPixel(x, y, color);
    }
  }
}

function rect(x, y, w, h, color) {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      setPixel(xx, yy, color);
    }
  }
}

function strokeRect(x, y, w, h, color, size) {
  rect(x, y, w, size, color);
  rect(x, y + h - size, w, size, color);
  rect(x, y, size, h, color);
  rect(x + w - size, y, size, h, color);
}

function text(x, y, value, scale, color) {
  let cursor = x;
  for (const char of value.toUpperCase()) {
    if (char === " ") {
      cursor += 4 * scale;
      continue;
    }
    const glyph = FONT[char] || FONT["?"];
    for (let row = 0; row < glyph.length; row += 1) {
      for (let col = 0; col < glyph[row].length; col += 1) {
        if (glyph[row][col] === "1") {
          rect(cursor + col * scale, y + row * scale, scale, scale, color);
        }
      }
    }
    cursor += 6 * scale;
  }
}

function setPixel(x, y, color) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const rowStart = y * (width * 3 + 1) + 1;
  const offset = rowStart + x * 3;
  pixels[offset] = color[0];
  pixels[offset + 1] = color[1];
  pixels[offset + 2] = color[2];
}

function writePng(path) {
  const chunks = [
    chunk("IHDR", Buffer.concat([u32(width), u32(height), Buffer.from([8, 2, 0, 0, 0])])),
    chunk("IDAT", zlib.deflateSync(pixels)),
    chunk("IEND", Buffer.alloc(0)),
  ];
  fs.writeFileSync(path, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), ...chunks]));
}

function chunk(type, data) {
  const name = Buffer.from(type);
  return Buffer.concat([u32(data.length), name, data, u32(crc32(Buffer.concat([name, data])))]);
}

function u32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(value >>> 0);
  return buffer;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const FONT = {
  "A": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  "B": ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  "C": ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  "D": ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  "E": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  "F": ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  "G": ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
  "H": ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  "I": ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  "J": ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  "K": ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  "L": ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  "M": ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  "N": ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  "O": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  "P": ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  "Q": ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  "R": ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  "S": ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  "T": ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  "U": ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  "V": ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  "W": ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  "X": ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  "Y": ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  "Z": ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
  "6": ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  "/": ["00001", "00001", "00010", "00100", "01000", "10000", "10000"],
  "?": ["01110", "10001", "00001", "00010", "00100", "00000", "00100"],
};

main();
