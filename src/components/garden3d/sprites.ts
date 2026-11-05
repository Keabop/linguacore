import * as THREE from 'three';

/**
 * Hand-drawn pixel art for the 3D garden: each sprite is a grid of characters, one per pixel,
 * and each character a colour role ('.' is empty). The sprites are packed into one texture read
 * without smoothing, and placed in the scene as cutouts leaning back toward the camera (it always
 * looks ahead and down), so the art keeps its pixels instead of being a filter over 3D shapes.
 *
 * Roles: o outline · g/G/l/L leaf shade to highlight · p/P/c petal, petal shade, core (the species)
 * · t/T trunk · d/s soil · r/R stone · w wood ink · y board · k/K blossom pink and white
 * · a flower colour (per variant) · A flower centre · m mushroom red.
 */

const STEM = [
    '.......oGo......',
    '.......oGo......',
    '..ooo..oGo......',
    '.oLllo.oGo......',
    '.oLlllooGo......',
    '..oolllGGo.ooo..',
    '....oooGGoollLo.',
    '.......oGolllLo.',
    '.......oGGoooo..',
    '.......oGo......',
    '......odGdo.....',
    '.....odsssdo....',
    '.....ooooooo....',
];

const HEADS = {
    round: [
        '......oooo......',
        '....ooppppoo....',
        '...oppPPPPppo...',
        '..oppPccccPppo..',
        '..opPccccccPpo..',
        '..opPccccccPpo..',
        '..oppPccccPppo..',
        '...oppPPPPppo...',
        '....ooppppoo....',
        '......oooo......',
    ],
    cup: [
        '....o..oo..o....',
        '...opooppoopo...',
        '...oppPppPppo...',
        '...opPPppPPpo...',
        '...oppPPPPppo...',
        '....oppPPppo....',
        '.....oppppo.....',
        '......oooo......',
    ],
    spike: [
        '.......oo.......',
        '......oppo......',
        '......oPpo......',
        '.....oppPpo.....',
        '.....oPppPo.....',
        '.....oppPpo.....',
        '.....oPppPo.....',
        '......oPpo......',
        '......oppo......',
        '......oPpo......',
        '.......oo.......',
    ],
};

const CACTUS = [
    '......oooo......',
    '.....oppppo.....',
    '.....opccpo.....',
    '......oooo......',
    '.....olLllo.....',
    '..oo.olLllo.....',
    '.oLlo.oLllo.oo..',
    '.oLlo.oLllo.oLo.',
    '.oLlooolLlloolo.',
    '..oLlllLllllllo.',
    '...ooolLlloooo..',
    '......oLllo.....',
    '......oLllo.....',
    '......oLllo.....',
    '.....odLlldo....',
    '....odsssssdo...',
    '.....ooooooo....',
];

const BONSAI = [
    '....oooooooo....',
    '..ooGGllGGlloo..',
    '.oGGlpllGlpllGo.',
    '.oGlllGGpllGllo.',
    '..ooGllGGllGoo..',
    '....ooottooo....',
    '......otto......',
    '.......oto......',
    '......otto......',
    '.....otTto......',
    '.....oTtto......',
    '....odssssdo....',
    '....oooooooo....',
];

const SPRITES: Record<string, string[]> = {
    seed: [
        '............',
        '....oooo....',
        '...odTTdo...',
        '..odssssdo..',
        '.odssssssdo.',
        'odssssssssdo',
        'oooooooooooo',
    ],
    sprout: [
        'oo.......oo',
        'oLLo...oLLo',
        'oLllo.olllo',
        '.oLlloollo.',
        '..oLlGGlo..',
        '...ooGGo...',
        '....oGo....',
        '....oGo....',
        '....oGo....',
        '...odGdo...',
        '..odsssdo..',
        '.ooooooooo.',
    ],
    tree: [
        '........oooooooo........',
        '......ooLLLlllGGoo......',
        '.....oLLlllllGGGGGo.....',
        '....oLLllllllGGGGGGo....',
        '...oLLlllllllGGGGGGGo...',
        '..oLlllllllGGGGGGGGGGo..',
        '..oLllllllGGGGGGGGGGgo..',
        '.oLlllllllGGGGGGGGGGggo.',
        '.olllllllGGGGGGGGGGgggo.',
        '.ollllllGGGGGGGGGGggggo.',
        '.oGlllllGGGGGGGGGgggggo.',
        '.oGGllGGGGGGGGGGggggggo.',
        '..oGGGGGGGGGGGGgggggo...',
        '...ooGGGGGGGGgggggoo....',
        '.....ooggGGGgggoo.......',
        '.......oooottoooo.......',
        '..........otTo..........',
        '..........otTo..........',
        '..........otTo..........',
        '.........ottTo..........',
        '........otttTTo.........',
        '.......oooooooo.........',
    ],
    pine: [
        '........oo........',
        '.......oLGo.......',
        '.......oLGo.......',
        '......oLlGGo......',
        '.....oLllGGgo.....',
        '......ooGGoo......',
        '.....oLlGGGgo.....',
        '....oLllGGGggo....',
        '...oLlllGGGgggo...',
        '.....oooGGgoo.....',
        '....oLllGGGggo....',
        '...oLlllGGGgggo...',
        '..oLllllGGGggggo..',
        '.oLlllllGGGgggggo.',
        '..oooooottoooooo..',
        '........tT........',
        '........tT........',
        '.......otTo.......',
    ],
    bush: [
        '.....oooooo.....',
        '...ooLLllGGoo...',
        '..oLllllGGGGGo..',
        '.oLlllllGGGGGgo.',
        '.olllllGGGGGggo.',
        '.oGllGGGGGgggo..',
        '..ooGGGGgggoo...',
        '....oooooooo....',
    ],
    tuftA: ['..l..L.', '.lG.lG.', 'lGGlGGl', '.GgGgG.'],
    tuftB: ['.L...l', '.lG.lG', 'GlGGlG', '.gGgG.'],
    stone: ['..ooooo..', '.oRRRrro.', 'oRRrrrrro', 'orrrrrrdo', '.ooooooo.'],
    mushroom: ['..ooo..', '.omKmo.', 'ommmKmo', 'ooooooo', '..oyo..', '..oyo..'],
    sign: [
        '.oooooooooo.',
        'oyyyyyyyyyyo',
        'oyyyywwyyyyo',
        'oyyyywwyyyyo',
        'oyyywyywyyyo',
        'oyyyywwyyyyo',
        'oyyyyywyyyyo',
        'oooooTtooooo',
        '.....tT.....',
        '.....tT.....',
        '.....tT.....',
        '....otTo....',
    ],
    flower: ['.oao.', 'oaAao', '.oao.', '..G..', '.GG..'],
};

export type Inks = Record<string, number>;

/** The colour of each role, by day and by night; the species' bloom fills p, P and c */
export function spriteInks(night: boolean, bloom: { petal: number; inner: number; core: number }): Inks {
    const shade = (hex: number, k: number) => new THREE.Color(hex).multiplyScalar(k).getHex();
    const b = night ? { petal: shade(bloom.petal, 0.72), inner: shade(bloom.inner, 0.72), core: shade(bloom.core, 0.72) } : bloom;
    return night
        ? { o: 0x0a1328, g: 0x1e3f3c, G: 0x2f5d4c, l: 0x4f8560, L: 0x8db35e, t: 0x5a3f30, T: 0x8a6244, d: 0x5a3f30, s: 0x8a6244,
            r: 0x34557e, R: 0x5a7896, w: 0x5a3f30, y: 0xb9a77f, k: 0xc77aa8, K: 0xe8dab2, A: 0xe9b34a, m: 0xe2522f, p: b.petal, P: b.inner, c: b.core }
        : { o: 0x1f2f50, g: 0x2f5e3f, G: 0x4f8a4e, l: 0x79ad58, L: 0xa9cc63, t: 0x7a5236, T: 0xb0805a, d: 0x7a5236, s: 0xb0805a,
            r: 0x7fa4c0, R: 0xb7d3e2, w: 0x7a5236, y: 0xe3d2a8, k: 0xf28bb0, K: 0xffffff, A: 0xf0b53c, m: 0xe2522f, p: b.petal, P: b.inner, c: b.core };
}

/** The grown plant of a species: its own body, or a stem under the bloom's head */
function grownPlant(species: string): string[] {
    if (species === 'cactus') return CACTUS;
    if (species === 'bonsai') return BONSAI;
    const head = species === 'tulipan' ? HEADS.cup : species === 'lavanda' ? HEADS.spike : HEADS.round;
    return [...head, ...STEM];
}

/** The level's tree in blossom: some leaves turn into pink and white flowers */
function inBlossom(rows: string[]): string[] {
    return rows.map((row, y) => [...row].map((ch, x) => {
        if (!'lG'.includes(ch)) return ch;
        const n = (x * 7 + y * 13) % 11;
        return n === 0 ? 'k' : n === 5 ? 'K' : ch;
    }).join(''));
}

export interface SpriteKit {
    /** Leaning cutouts that never move, drawn together at the end */
    add(name: string, x: number, y: number, z: number, scale?: number): void;
    /** One cutout of its own, for plants that sway, grow or change */
    mesh(name: string, scale?: number): THREE.Mesh;
    /** The static cutouts as one mesh */
    build(): THREE.Mesh | null;
    /** Every colour the sprites use, so the pixel pass keeps them as they are */
    colors: number[];
    dispose(): void;
}

/** Size of one sprite pixel in the world, before a sprite's own scale */
export const TEXEL = 0.075;
/** How far the cutouts lean back, so they face a camera that looks down at the garden */
const TILT = 0.55;

export function createSpriteKit(inks: Inks, species: string, flowerColors: number[]): SpriteKit {
    const art: Record<string, string[]> = { ...SPRITES, grown: grownPlant(species), examTree: SPRITES.tree, examTreeBloom: inBlossom(SPRITES.tree) };
    const flowerNames = flowerColors.map((_, i) => `flower${i}`);
    flowerColors.forEach((_, i) => { art[`flower${i}`] = SPRITES.flower; });

    // Shelf packing with a pixel of air around each sprite
    const ATLAS = 256;
    const frames: Record<string, { x: number; y: number; w: number; h: number }> = {};
    let cx = 1, cy = 1, row = 0;
    for (const [name, rows] of Object.entries(art)) {
        const w = rows[0].length, h = rows.length;
        if (cx + w + 1 > ATLAS) { cx = 1; cy += row + 1; row = 0; }
        frames[name] = { x: cx, y: cy, w, h };
        cx += w + 1; row = Math.max(row, h);
    }
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = ATLAS;
    const ctx = canvas.getContext('2d')!;
    const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`;
    for (const [name, rows] of Object.entries(art)) {
        const f = frames[name], flower = flowerNames.indexOf(name);
        rows.forEach((line, y) => [...line].forEach((ch, x) => {
            if (ch === '.') return;
            const color = ch === 'a' && flower >= 0 ? flowerColors[flower] : inks[ch];
            if (color === undefined) return;
            ctx.fillStyle = hex(color);
            ctx.fillRect(f.x + x, f.y + y, 1, 1);
        }));
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({ map: texture, alphaTest: 0.5, side: THREE.DoubleSide });

    const positions: number[] = [], uvs: number[] = [], index: number[] = [];
    const quad = (name: string, x: number, y: number, z: number, scale: number, pos: number[], uv: number[], idx: number[]) => {
        const f = frames[name];
        if (!f) return;
        const w = f.w * TEXEL * scale, h = f.h * TEXEL * scale, lean = Math.sin(TILT) * h, up = Math.cos(TILT) * h;
        const base = pos.length / 3;
        pos.push(x - w / 2, y, z, x + w / 2, y, z, x + w / 2, y + up, z - lean, x - w / 2, y + up, z - lean);
        const u0 = f.x / ATLAS, u1 = (f.x + f.w) / ATLAS, v0 = 1 - (f.y + f.h) / ATLAS, v1 = 1 - f.y / ATLAS;
        uv.push(u0, v0, u1, v0, u1, v1, u0, v1);
        idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    };
    const geometry = (pos: number[], uv: number[], idx: number[]) => {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
        g.setIndex(idx);
        g.computeBoundingSphere();
        return g;
    };

    const colors = new Set<number>(Object.values(inks));
    flowerColors.forEach(c => colors.add(c));

    return {
        add(name, x, y, z, scale = 1) { quad(name, x, y, z, scale, positions, uvs, index); },
        mesh(name, scale = 1) {
            const pos: number[] = [], uv: number[] = [], idx: number[] = [];
            quad(name, 0, 0, 0, scale, pos, uv, idx);
            const m = new THREE.Mesh(geometry(pos, uv, idx), material);
            m.castShadow = true;
            return m;
        },
        build() {
            if (!positions.length) return null;
            const m = new THREE.Mesh(geometry(positions, uvs, index), material);
            m.castShadow = true;
            return m;
        },
        colors: [...colors],
        dispose() { texture.dispose(); material.dispose(); },
    };
}

export const FLOWER_SPRITES = (count: number) => Array.from({ length: count }, (_, i) => `flower${i}`);
