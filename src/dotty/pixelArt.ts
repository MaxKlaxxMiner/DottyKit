export interface PixelArtDefinition {
    w: number;
    h: number;
    ofsX?: number;
    ofsY?: number;
    pal: string[];
    pix: string[];
    layers: { [name: string]: PixelArtDefinition };
}

export function createPixelArtImage(definition: PixelArtDefinition | null): HTMLImageElement {
    if (!definition) {
        return new Image;
    }
    if (definition.pal.length === 0) {
        throw new Error('Pal!');
    }

    const palette = definition.pal.map(parseHexColor);
    const canvas = document.createElement('canvas');
    canvas.width = definition.w;
    canvas.height = definition.h;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D?');

    const imageData = ctx.createImageData(definition.w, definition.h);
    const data = imageData.data;

    const ofsX = definition.ofsX ?? 0;
    const ofsY = definition.ofsY ?? 0;

    for (let y = 0; y < definition.h; y++) {
        const encodedRow = definition.pix[y - ofsY] ?? '';
        const row = expandRow(encodedRow, ofsX, definition.w);
        for (let x = 0; x < definition.w; x++) {
            const symbol = row[x] ?? '0';
            const paletteIndex = symbolToIndex(symbol);
            const color = palette[paletteIndex] ?? palette[0];

            const offset = (y * definition.w + x) * 4;
            data[offset] = color[0];
            data[offset + 1] = color[1];
            data[offset + 2] = color[2];
            data[offset + 3] = color[3];
        }
    }
    ctx.putImageData(imageData, 0, 0);

    const result = new Image;
    result.src = canvas.toDataURL('image/png');
    return result;
}

function symbolToIndex(symbol: string): number {
    if (!symbol) return 0;
    return charToValue(symbol[0]);
}

function expandRow(input: string, ofsX: number, maxWidth: number): string {
    if (!input) return '';

    const cleaned = input.replace(/[ ,]/g, '');
    if (!cleaned) return '';

    let result = '0'.repeat(ofsX);
    for (let i = 0; i < cleaned.length && result.length < maxWidth; i += 2) {
        const countChar = cleaned[i];
        const symbolChar = cleaned[i + 1];

        if (!symbolChar) break;

        const count = charToValue(countChar);
        const repeats = Math.min(count, maxWidth - result.length);

        if (repeats > 0) {
            result += symbolChar.repeat(repeats);
        }
    }

    return result;
}

function charToValue(char: string): number {
    if (!char) return 0;
    const code = char.charCodeAt(0);

    // '0' - '9'
    if (code >= 48 && code <= 57) return code - 48;
    // 'a' - 'z'
    if (code >= 97 && code <= 122) return 10 + (code - 97);
    // 'A' - 'Z'
    if (code >= 65 && code <= 90) return 36 + (code - 65);

    return 0;
}

function parseHexColor(input: string): [number, number, number, number] {
    const trimmed = input.trim();
    if (!trimmed.startsWith('#')) throw new Error(`pal color error: ${input}`);

    let hex = trimmed.slice(1);
    const isShort = hex.length === 3 || hex.length === 4;
    if (![3, 4, 6, 8].includes(hex.length)) {
        throw new Error(`only supported hex value length: 3, 4, 6, 8: ${input}`);
    }

    if (isShort) {
        hex = hex.split('').map((c) => c + c).join('');
    }

    if (hex.length === 6) hex += 'ff';

    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = parseInt(hex.slice(6, 8), 16);

    if ([r, g, b, a].some((component) => Number.isNaN(component))) {
        throw new Error(`invalid hex-color: ${input}`);
    }

    return [r, g, b, a];
}
