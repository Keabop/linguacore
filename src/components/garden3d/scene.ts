// The 3D garden of the home screen: one raised bed per unit of the level along a trail, the
// level's tree at the end. Plain three.js, loaded only with this screen. Built once per
// level, theme and species; the page drives the camera with its scroll and draws the labels.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { CEFRLevel } from '../../lib/db';
import type { SpeciesId } from '../garden/species';
import type { GardenUnitState } from './states';

export interface GardenOptions {
    states: GardenUnitState[];
    level: CEFRLevel;
    species: SpeciesId;
    night: boolean;
    reducedMotion: boolean;
    /** Index of a unit just completed: its plant grows when the garden opens. */
    grow?: number;
}

/** Where each unit's label goes on screen, every frame. */
export interface Anchor { x: number; y: number; visible: boolean }

export interface GardenHandle {
    /** 0 at the first unit, 1 at the level's tree. */
    setProgress(k: number): void;
    /** Camera dive toward a unit before opening it. */
    dive(index: number): Promise<void>;
    dispose(): void;
}

type Palette = typeof DAY;
const DAY = {
    skyTop: 0x9fd0ee, skyHorizon: 0xfbf0d6, fog: 0xf3ead2, ground: [0xb8d27e, 0xa6c96f, 0xc9d98a], soil: 0xb98a5c, soilDark: 0x8a6240, path: 0xe2c995, pathEdge: 0xc9a874,
    wood: 0x9a6b44, moss: 0x8cbf68, dry: 0xd6cf8a, water: 0x7cc0d8, mushroom: 0xe0574a, lanternOn: 0xffe2a0, leaf: 0x3f9a5c, leafLight: 0x6cbf7c, lime: 0xb7d957, limeDeep: 0x7fb33a,
    seed: 0x9a7a55, stone: 0xbdb8a8, trunk: 0x8a6142, canopy: [0x5fae5f, 0x76bd62, 0x4f9a55], hill: [0xcfe0a4, 0xb6d390], grass: [0x7fae5c, 0x93bb6a, 0x6f9f55, 0xa8c47a],
    flowers: [0xf5c242, 0xf28bb0, 0xffffff, 0xb79cf0, 0xf08a4b], sunCol: 0xfff1d0, hemiSky: 0xfff6e2, hemiGround: 0x9cc27a, sunI: 2.2, hemiI: 1.0, exposure: 1.0,
};
const NIGHT: Palette = {
    skyTop: 0x0f2040, skyHorizon: 0x3a5272, fog: 0x2a3a52, ground: [0x456e4c, 0x557f55, 0x3b6346], soil: 0x5c4630, soilDark: 0x3d2d1f, path: 0x6b5a44, pathEdge: 0x4a3c2c,
    wood: 0x6a4a30, moss: 0x2e5a3c, dry: 0x5a6a42, water: 0x2a4a6a, mushroom: 0xc0504a, lanternOn: 0xffc870, leaf: 0x3f8a55, leafLight: 0x5aa86a, lime: 0x9cc24c, limeDeep: 0x6c9a33,
    seed: 0x8a6a48, stone: 0x6d7268, trunk: 0x5a4030, canopy: [0x2f6b45, 0x3d7d4f, 0x285c3c], hill: [0x22382f, 0x1c3029], grass: [0x3a6a42, 0x4a7c48, 0x2f5a3a],
    flowers: [0xd8c060, 0xc0a0d0, 0xf0f0e0], sunCol: 0xe8ecff, hemiSky: 0x7088b8, hemiGround: 0x22382a, sunI: 1.5, hemiI: 1.0, exposure: 1.3,
};

/** Each level's landscape: Semilla early greens, Brote fresh lime, Hoja deep green, Flor in blossom. */
function paletteFor(level: CEFRLevel, night: boolean): Palette {
    const p = { ...(night ? NIGHT : DAY) };
    const tint = (hexes: number[], to: number, k: number) => hexes.map(h => new THREE.Color(h).lerp(new THREE.Color(to), k).getHex());
    if (level === 'A2') {
        p.ground = tint(p.ground, night ? 0x5a8a3a : 0xc6e07a, 0.35); p.canopy = tint(p.canopy, night ? 0x4a8a3a : 0x9ccf5a, 0.3);
        p.flowers = night ? p.flowers : [0xffffff, 0xd8ef7a, 0xf5c242, 0xb79cf0];
    } else if (level === 'B1') {
        p.ground = tint(p.ground, night ? 0x2f5a38 : 0x7fb05a, 0.35); p.canopy = tint(p.canopy, night ? 0x1f5030 : 0x2f7f45, 0.35);
        p.grass = tint(p.grass, night ? 0x2f5a38 : 0x5c9a4a, 0.3);
    } else if (level === 'B2') {
        p.canopy = [p.canopy[0], night ? 0x8a5a7a : 0xf2a7c3, p.canopy[2]];
        p.flowers = night ? [0xd890b8, 0xf0f0e0, 0xc0a0d0] : [0xf28bb0, 0xffffff, 0xf6b7cf, 0xb79cf0];
    }
    return p;
}

/** Bloom colors per species, near the 2D garden's tokens. */
const BLOOM: Record<SpeciesId, { petal: number; inner: number; core: number }> = {
    girasol: { petal: 0xf5c242, inner: 0xf0a830, core: 0x5c3b1e },
    tulipan: { petal: 0xe8506a, inner: 0xd23c58, core: 0xf5c242 },
    margarita: { petal: 0xffffff, inner: 0xf3f0e6, core: 0xf5c242 },
    cactus: { petal: 0xf28bb0, inner: 0xf6b7cf, core: 0xf5c242 },
    rosa: { petal: 0xd8445a, inner: 0xe8687a, core: 0xb83048 },
    lavanda: { petal: 0x9c7ad8, inner: 0xb79cf0, core: 0x7a5ab8 },
    bonsai: { petal: 0xf6b7cf, inner: 0xffffff, core: 0x5f9a5a },
    orquidea: { petal: 0xd98ad6, inner: 0xf3d6f0, core: 0xf5c242 },
};

export function createGarden(canvas: HTMLCanvasElement, opts: GardenOptions, onFrame: (anchors: Anchor[]) => void): GardenHandle {
    const P = paletteFor(opts.level, opts.night);
    const bloom = BLOOM[opts.species];
    const units = opts.states;
    const N = units.length;
    const motion = !opts.reducedMotion;

    // Dense screens get resolution, not MSAA: both at once is the costliest pair on a laptop GPU
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: devicePixelRatio < 1.5, powerPreference: 'high-performance' });
    const MAX_DPR = Math.min(devicePixelRatio, 1.5);
    let dpr = MAX_DPR;
    renderer.setPixelRatio(dpr);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = P.exposure;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    // Shadows are redrawn only when the view moves enough, not every frame
    renderer.shadowMap.autoUpdate = false;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(P.fog, 38, 95);
    const camera = new THREE.PerspectiveCamera(40, 1, 0.5, 220);
    const clock = new THREE.Clock();
    const uTime = { value: 0 };
    const bakedMaterial = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, side: THREE.DoubleSide });

    /* ---------- Helpers ---------- */
    const mats = new Map<string, THREE.MeshLambertMaterial>();
    const mat = (color: number, extra: THREE.MeshLambertMaterialParameters = {}) => {
        const key = color + JSON.stringify(extra);
        if (!mats.has(key)) mats.set(key, new THREE.MeshLambertMaterial({ color, flatShading: true, ...extra }));
        return mats.get(key)!;
    };
    const shadowed = <T extends THREE.Object3D>(o: T, cast = true, receive = true) => { o.castShadow = cast; o.receiveShadow = receive; return o; };
    const hash = (x: number, y: number) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
    const noise = (x: number, y: number) => {
        const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
        const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
        return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    };
    const fbm = (x: number, y: number) => noise(x, y) * 0.6 + noise(x * 2.1, y * 2.1) * 0.28 + noise(x * 4.3, y * 4.3) * 0.12;
    // Seeded: the same level always grows the same garden
    let seedState = 7 + ['A1', 'A2', 'B1', 'B2'].indexOf(opts.level) * 101;
    const rand = () => (seedState = (seedState * 16807) % 2147483647) / 2147483647;

    /* ---------- Trail and plots ---------- */
    const STEP = 9;
    const bends = units.map((_, i) => new THREE.Vector3(i % 2 ? 4.2 : -4.2, 0, -i * STEP));
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 10), new THREE.Vector3(-1.5, 0, 5), ...bends.slice(0, -1),
        new THREE.Vector3(0, 0, -(N - 1) * STEP + 3), new THREE.Vector3(0, 0, -(N - 1) * STEP - 18)], false, 'catmullrom', 0.5);
    const samples = curve.getSpacedPoints(400);
    // Garden extent: X_HALF covers a 31:9 screen at the front of the view; Z_END goes well past the level's tree
    const X_HALF = 64, Z_START = 14, Z_END = -(N - 1) * STEP - 80;
    // Detail per metre tuned on an 8-unit level (~102 m of trail); longer levels get proportionally more
    const CORE = (Z_START - Z_END) / 102;
    const distToPath = (x: number, z: number) => {
        if (Math.abs(x) > 10) return Math.abs(x) - 6;
        let m = 1e9; for (const p of samples) { const d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < m) m = d; } return Math.sqrt(m);
    };
    // Ponds sit in clearings: nothing else is placed on them
    const ponds = ([[-11, -10, 3.2], [16, -48, 3.6]] as const).filter(([, z]) => z > Z_END + 20);
    const wet = (x: number, z: number) => ponds.some(([px, pz, r]) => Math.hypot((x - px) / 1.35, z - pz) < r + 1.6);
    const plots = units.map((s, i) => s.startsWith('exam') ? new THREE.Vector3(0, 0, -(N - 1) * STEP - 6) : new THREE.Vector3(bends[i].x + Math.sign(bends[i].x) * 3.4, 0, bends[i].z));

    /* ---------- Terrain ---------- */
    const heightAt = (x: number, z: number) => {
        let h = (fbm(x * 0.06, z * 0.06) - 0.5) * 2.2;
        h += Math.max(0, Math.abs(x) - 16) ** 1.35 * 0.09; // the valley rises on both sides
        const flat = THREE.MathUtils.smoothstep(distToPath(x, z), 1.6, 5.5);
        let plotFlat = 1; for (const p of plots) plotFlat = Math.min(plotFlat, THREE.MathUtils.smoothstep(Math.hypot(p.x - x, p.z - z), 2.2, 5));
        return h * (0.2 + 0.8 * flat) * (0.15 + 0.85 * plotFlat);
    };
    {
        const g = new THREE.PlaneGeometry(200, 300, 100, 160); g.rotateX(-Math.PI / 2); g.translate(0, 0, -(N * STEP) / 2);
        const pos = g.attributes.position, col: number[] = [], c = new THREE.Color(), cg = P.ground.map(h => new THREE.Color(h)), cs = new THREE.Color(P.pathEdge);
        const moss = new THREE.Color(P.moss), dry = new THREE.Color(P.dry);
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i), z = pos.getZ(i); pos.setY(i, heightAt(x, z));
            c.copy(cg[0]).lerp(cg[1], fbm(x * 0.15 + 30, z * 0.15)).lerp(cg[2], Math.max(0, noise(x * 0.05, z * 0.05) - 0.5));
            const m = noise(x * 0.09 + 7, z * 0.09 - 3), d = noise(x * 0.07 - 11, z * 0.07 + 5);
            if (m > 0.62) c.lerp(moss, (m - 0.62) * 2.2);
            if (d > 0.66) c.lerp(dry, (d - 0.66) * 1.8);
            const dp = distToPath(x, z); if (dp < 2.6) c.lerp(cs, THREE.MathUtils.smoothstep(2.6 - dp, 0, 0.9) * 0.55);
            col.push(c.r, c.g, c.b);
        }
        g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
        scene.add(shadowed(new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })), false, true));
    }

    /* ---------- Path ribbon with stepping stones ---------- */
    {
        const n = 600, pos: number[] = [], col: number[] = [], idx: number[] = [], cc = new THREE.Color(P.path), ce = new THREE.Color(P.pathEdge), lanes = 6, width = 2.3;
        for (let i = 0; i <= n; i++) {
            const t = i / n, p = curve.getPointAt(t), tan = curve.getTangentAt(t), side = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
            for (let k = 0; k <= lanes; k++) {
                const s = (k / lanes - 0.5) * width * (1 + 0.08 * Math.sin(t * 80 + k));
                const x = p.x + side.x * s, z = p.z + side.z * s; pos.push(x, heightAt(x, z) + 0.06, z);
                const edge = Math.abs(k / lanes - 0.5) * 2, cl = cc.clone().lerp(ce, edge ** 2 * 0.9 + hash(i, k) * 0.12); col.push(cl.r, cl.g, cl.b);
            }
            if (i < n) for (let k = 0; k < lanes; k++) { const a = i * (lanes + 1) + k, b = a + lanes + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
        }
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
        g.setIndex(idx); g.computeVertexNormals();
        scene.add(shadowed(new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })), false, true));
        const count = 80, stones = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.3, 0.34, 0.1, 7), mat(P.stone), count), m = new THREE.Matrix4();
        for (let i = 0; i < count; i++) {
            const t = (i + 0.5) / count, p = curve.getPointAt(t), tan = curve.getTangentAt(t);
            const side = new THREE.Vector3(-tan.z, 0, tan.x).normalize().multiplyScalar((i % 2 ? 0.35 : -0.35) + (rand() - 0.5) * 0.2);
            m.compose(new THREE.Vector3(p.x + side.x, heightAt(p.x, p.z) + 0.1, p.z + side.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rand() * 6, 0)), new THREE.Vector3(0.8 + rand() * 0.5, 1, 0.7 + rand() * 0.4));
            stones.setMatrixAt(i, m);
        }
        stones.receiveShadow = true; scene.add(stones);
    }

    /* ---------- Grass with wind, in strips so off-screen ones are culled ---------- */
    {
        const blade = new THREE.BufferGeometry();
        blade.setAttribute('position', new THREE.Float32BufferAttribute([-0.045, 0, 0, 0.045, 0, 0, -0.025, 0.2, 0, 0.025, 0.2, 0, 0, 0.42, 0], 3));
        blade.setIndex([0, 1, 2, 1, 3, 2, 2, 3, 4]); blade.computeVertexNormals();
        const material = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide });
        material.onBeforeCompile = sh => {
            sh.uniforms.uTime = uTime;
            sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
                float w = sin(uTime * 1.7 + instanceMatrix[3].x * 0.45 + instanceMatrix[3].z * 0.3) + 0.4 * sin(uTime * 3.1 + instanceMatrix[3].z);
                transformed.x += w * 0.09 * position.y * position.y * 4.0; transformed.z += w * 0.05 * position.y;`);
        };
        const CHUNKS = Math.round(10 * CORE), per = 1300, zLen = Z_START - Z_END, m = new THREE.Matrix4(), c = new THREE.Color(), greens = P.grass.map(h => new THREE.Color(h));
        for (let k = 0; k < CHUNKS; k++) for (const [x0, x1, share] of [[-22, 22, 1], [-X_HALF, -22, 0.2], [22, X_HALF, 0.2]]) {
            const n = Math.round(per * share), grass = new THREE.InstancedMesh(blade, material, n);
            for (let placed = 0; placed < n;) {
                const x = x0 + rand() * (x1 - x0), z = Z_START - (k + rand()) * zLen / CHUNKS;
                if (distToPath(x, z) < 1.7 || plots.some(p => Math.hypot(p.x - x, p.z - z) < 2.1)) continue;
                const sc = 0.55 + rand() * 0.6;
                m.compose(new THREE.Vector3(x, heightAt(x, z), z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rand() * Math.PI, (rand() - 0.5) * 0.3)), new THREE.Vector3(sc, sc * (0.8 + rand() * 0.6), sc));
                grass.setMatrixAt(placed, m); grass.setColorAt(placed, c.copy(greens[Math.floor(rand() * greens.length)])); placed++;
            }
            grass.computeBoundingSphere(); scene.add(grass);
        }
    }

    /* ---------- Wildflowers, rocks, trees and bushes ---------- */
    const tree = (x: number, z: number, scale = 1, pine = false) => {
        if (wet(x, z)) return;
        const g = new THREE.Group();
        g.add(shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 1.6, 6), mat(P.trunk)).translateY(0.8)));
        if (pine) [0, 1, 2].forEach(k => g.add(shadowed(new THREE.Mesh(new THREE.ConeGeometry(1.25 - k * 0.3, 1.5, 7), mat(P.canopy[2])).translateY(1.8 + k * 0.85))));
        else { const k = Math.floor(rand() * 3); [[0, 2.5, 0, 1.25], [0.6, 2.1, 0.3, 0.85], [-0.6, 2.2, -0.2, 0.9]].forEach(([a, b, cc, r]) => g.add(shadowed(new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), mat(P.canopy[k])).translateX(a).translateY(b).translateZ(cc)))); }
        g.position.set(x, heightAt(x, z), z); g.scale.setScalar(scale); g.rotation.y = rand() * 6; scene.add(g);
    };
    {
        const head = new THREE.OctahedronGeometry(0.12, 0), m = new THREE.Matrix4(), c = new THREE.Color();
        for (const [x0, x1, count] of [[-20, 20, Math.round(1600 * CORE)], [-X_HALF, -20, 450], [20, X_HALF, 450]]) {
            const fl = new THREE.InstancedMesh(head, mat(0xffffff), count);
            for (let i = 0; i < count; i++) {
                let x: number, z: number; do { x = x0 + rand() * (x1 - x0); z = Z_START - rand() * (Z_START - Z_END); } while (distToPath(x, z) < 2 || plots.some(p => Math.hypot(p.x - x, p.z - z) < 2.4));
                if (noise(x * 0.25, z * 0.25) < 0.45) { i--; continue; } // wildflowers grow in patches
                m.compose(new THREE.Vector3(x, heightAt(x, z) + 0.35 + rand() * 0.2, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rand() * 3, 0)), new THREE.Vector3(1, 0.6, 1));
                fl.setMatrixAt(i, m); fl.setColorAt(i, c.setHex(P.flowers[Math.floor(rand() * P.flowers.length)]));
            }
            fl.computeBoundingSphere(); scene.add(fl);
        }
        const ROCKS = Math.round(70 * CORE) + 50, rocks = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.5, 0), mat(P.stone), ROCKS);
        for (let i = 0; i < ROCKS; i++) {
            let x: number, z: number; do { x = i < 70 * CORE ? (rand() - 0.5) * 50 : (rand() < 0.5 ? -1 : 1) * (25 + rand() * (X_HALF - 25)); z = Z_START - rand() * (Z_START - Z_END); } while (distToPath(x, z) < 2.4 || plots.some(p => Math.hypot(p.x - x, p.z - z) < 3));
            const sc = 0.3 + rand() * 0.9; m.compose(new THREE.Vector3(x, heightAt(x, z) + 0.1 * sc, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rand(), rand() * 6, rand())), new THREE.Vector3(sc, sc * 0.6, sc)); rocks.setMatrixAt(i, m);
        }
        rocks.castShadow = true; rocks.computeBoundingSphere(); scene.add(rocks);
        // Groves to the sides, a sparser layer to the 31:9 edge, and a forest past the level's tree
        for (let i = 0; i < Math.round(46 * CORE); i++) tree((rand() < 0.5 ? -1 : 1) * (12 + rand() * 18), 8 - rand() * (8 - Z_END), 0.9 + rand() * 1.1, rand() < 0.35);
        for (let i = 0; i < 55; i++) tree((rand() < 0.5 ? -1 : 1) * (30 + rand() * (X_HALF - 30)), 8 - rand() * (8 - Z_END), 1 + rand() * 1.3, rand() < 0.4);
        const exam = plots[N - 1];
        for (let i = 0; i < 60; i++) {
            const x = (rand() - 0.5) * X_HALF * 1.8, z = exam.z - 8 - rand() * (exam.z - 8 - Z_END);
            if (Math.hypot(x - exam.x, (z - (exam.z - 7)) * 1.3) >= 11) tree(x, z, 1 + rand() * 1.3, rand() < 0.45);
        }
        const bush = new THREE.IcosahedronGeometry(0.6, 1);
        for (let i = 0; i < Math.round(40 * CORE) + 30; i++) {
            let x: number, z: number; do { x = i < 40 * CORE ? (rand() - 0.5) * 26 : (rand() < 0.5 ? -1 : 1) * (13 + rand() * (X_HALF - 13)); z = Z_START - rand() * (Z_START - Z_END); } while (distToPath(x, z) < 2.8 || plots.some(p => Math.hypot(p.x - x, p.z - z) < 3.3));
            if (wet(x, z)) continue;
            const b = shadowed(new THREE.Mesh(bush, mat(P.canopy[Math.floor(rand() * 3)]))); b.position.set(x, heightAt(x, z) + 0.3, z); b.scale.set(1 + rand(), 0.7 + rand() * 0.5, 1 + rand()); scene.add(b);
        }
    }

    /* ---------- Garden details: all static, baked below into a few meshes ---------- */
    const spot = (minX: number, maxX: number, path: number, plot: number): [number, number] | null => {
        for (let k = 0; k < 40; k++) {
            const x = (rand() < 0.5 ? -1 : 1) * (minX + rand() * (maxX - minX)), z = Z_START - rand() * (Z_START - Z_END);
            if (distToPath(x, z) > path && !wet(x, z) && plots.every(p => Math.hypot(p.x - x, p.z - z) > plot)) return [x, z];
        }
        return null;
    };
    const put = (mesh: THREE.Mesh, x: number, z: number, y = 0) => { mesh.position.set(x, heightAt(x, z) + y, z); scene.add(shadowed(mesh)); return mesh; };
    const lanterns: THREE.Vector3[] = [];
    {
        for (let k = 0; k < Math.round(15 * CORE / 1.5); k++) {
            const n = Math.round(15 * CORE / 1.5), t = (k + 0.5) / n, p = curve.getPointAt(t), tan = curve.getTangentAt(t), side = new THREE.Vector3(-tan.z, 0, tan.x).normalize().multiplyScalar(k % 2 ? 1.9 : -1.9);
            const x = p.x + side.x, z = p.z + side.z; if (!plots.every(q => Math.hypot(q.x - x, q.z - z) > 2.6)) continue;
            const g = new THREE.Group();
            g.add(shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.3, 0.12), mat(P.wood))).translateY(0.65));
            g.add(shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.42), mat(P.trunk))).translateY(1.34));
            g.add(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), new THREE.MeshLambertMaterial({ color: P.lanternOn, emissive: P.lanternOn, emissiveIntensity: opts.night ? 1.6 : 0.25 })).translateY(1.15));
            g.add(shadowed(new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.22, 4), mat(P.trunk))).translateY(1.45).rotateY(Math.PI / 4));
            g.position.set(x, heightAt(x, z), z); scene.add(g); lanterns.push(new THREE.Vector3(x, heightAt(x, z) + 1.15, z));
        }
        for (let k = 0; k < Math.round(18 * CORE) + 10; k++) {
            const at = k < 18 * CORE ? spot(3, 15, 2.5, 3) : spot(15, 45, 2.5, 3); if (!at) continue;
            for (let j = 0; j < 3 + Math.floor(rand() * 4); j++) {
                const a = rand() * 6, r = rand() * 0.7, x = at[0] + Math.cos(a) * r, z = at[1] + Math.sin(a) * r, sc = 0.6 + rand() * 0.7;
                put(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.3, 6), mat(0xf2ead8)), x, z, 0.15).scale.setScalar(sc);
                put(new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), mat(j % 3 ? P.mushroom : 0xd9a066)), x, z, 0.28 * sc).scale.set(sc, sc * 0.8, sc);
            }
        }
        for (let k = 0; k < Math.round(10 * CORE) + 8; k++) {
            const at = k < 10 * CORE ? spot(4, 16, 3, 3.6) : spot(16, 50, 3, 3.6); if (!at) continue;
            if (k % 2) put(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 2.2 + rand(), 8), mat(P.trunk)), at[0], at[1], 0.25).rotation.set(0, rand() * 6, Math.PI / 2);
            else { put(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.55, 0.5, 9), mat(P.trunk)), at[0], at[1], 0.25); put(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.03, 9), mat(0xd9b98a)), at[0], at[1], 0.51); }
        }
        const frond = new THREE.ConeGeometry(0.1, 0.9, 4);
        for (let k = 0; k < Math.round(70 * CORE) + 40; k++) {
            const at = k < 70 * CORE ? spot(2.6, 22, 2.2, 2.8) : spot(22, 58, 2.2, 2.8); if (!at) continue;
            for (let j = 0; j < 6; j++) put(new THREE.Mesh(frond, mat(j % 2 ? P.leaf : P.leafLight)), at[0], at[1], 0.35).rotation.set(Math.cos(j) * 0.7, j, Math.sin(j) * 0.7);
        }
        const blossom = new THREE.IcosahedronGeometry(0.11, 0);
        for (let k = 0; k < Math.round(24 * CORE) + 12; k++) {
            const at = k < 24 * CORE ? spot(3.2, 18, 3, 3.4) : spot(18, 50, 3, 3.4); if (!at) continue;
            put(new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 1), mat(P.canopy[k % 3])), at[0], at[1], 0.35).scale.set(1.2, 0.85, 1.1);
            const col = P.flowers[k % P.flowers.length];
            for (let j = 0; j < 12; j++) { const a = rand() * 6, e = rand() * 1.1; put(new THREE.Mesh(blossom, mat(col)), at[0] + Math.cos(a) * Math.cos(e) * 0.8, at[1] + Math.sin(a) * Math.cos(e) * 0.75, 0.35 + Math.sin(e) * 0.6); }
        }
        // Wooden fence along stretches of the trail
        for (let k = 0; k < Math.round(6 * CORE / 1.5); k++) {
            const t0 = 0.08 + k * 0.15 * 1.5 / CORE, side = k % 2 ? 2.6 : -2.6;
            for (let j = 0; j < 7; j++) {
                const t = t0 + j * 0.006; if (t > 0.97) break;
                const p = curve.getPointAt(t), tan = curve.getTangentAt(t), n = new THREE.Vector3(-tan.z, 0, tan.x).normalize().multiplyScalar(side), x = p.x + n.x, z = p.z + n.z;
                if (!plots.every(q => Math.hypot(q.x - x, q.z - z) > 2.4)) continue;
                put(new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.1), mat(P.wood)), x, z, 0.4);
                if (j) {
                    const q = curve.getPointAt(t - 0.006), tq = curve.getTangentAt(t - 0.006), nq = new THREE.Vector3(-tq.z, 0, tq.x).normalize().multiplyScalar(side), x0 = q.x + nq.x, z0 = q.z + nq.z, len = Math.hypot(x - x0, z - z0);
                    for (const h of [0.3, 0.6]) put(new THREE.Mesh(new THREE.BoxGeometry(len, 0.07, 0.05), mat(P.wood)), (x + x0) / 2, (z + z0) / 2, h).rotation.y = -Math.atan2(z - z0, x - x0);
                }
            }
        }
        // Ponds with stones and lily pads
        for (const [px, pz, r] of ponds) {
            const water = new THREE.Mesh(new THREE.CircleGeometry(r, 28), new THREE.MeshLambertMaterial({ color: P.water, transparent: true, opacity: 0.85 }));
            water.rotation.x = -Math.PI / 2; water.position.set(px, heightAt(px, pz) + 0.08, pz); water.scale.set(1.35, 1, 1); water.receiveShadow = true; scene.add(water);
            for (let k = 0; k < 22; k++) { const a = k / 22 * Math.PI * 2, rr = r + 0.2 + rand() * 0.4; put(new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 0), mat(P.stone)), px + Math.cos(a) * rr * 1.35, pz + Math.sin(a) * rr, 0.1).scale.y = 0.55; }
            for (let k = 0; k < 6; k++) { const pad = new THREE.Mesh(new THREE.CircleGeometry(0.35, 10, 0.3, 5.6), mat(P.leafLight)); pad.rotation.x = -Math.PI / 2; pad.position.set(px + (rand() - 0.5) * r * 1.6, heightAt(px, pz) + 0.1, pz + (rand() - 0.5) * r); scene.add(pad); }
        }
        for (let k = 0; k < Math.round(16 * CORE); k++) { const at = spot(8, 12, 5.5, 5.5); if (at) tree(at[0], at[1], 0.7 + rand() * 0.5, rand() < 0.3); }
    }

    /* ---------- Hills, sky, sun or moon, clouds or stars ---------- */
    const clouds: THREE.Mesh[] = [];
    {
        for (const [x, z, r, c] of [[-70, -170, 40, P.hill[0]], [-10, -185, 46, P.hill[0]], [60, -175, 42, P.hill[0]], [-95, -90, 34, P.hill[1]], [95, -95, 34, P.hill[1]], [-100, -10, 30, P.hill[1]], [100, -20, 30, P.hill[1]]]) {
            const h = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 12), mat(c)); h.position.set(x, -r * 0.55, z); scene.add(h);
        }
        scene.add(new THREE.Mesh(new THREE.SphereGeometry(200, 32, 16), new THREE.ShaderMaterial({
            side: THREE.BackSide, depthWrite: false,
            uniforms: { top: { value: new THREE.Color(P.skyTop) }, bottom: { value: new THREE.Color(P.skyHorizon) } },
            vertexShader: 'varying vec3 vp; void main(){ vp = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
            fragmentShader: 'uniform vec3 top; uniform vec3 bottom; varying vec3 vp; void main(){ float h = smoothstep(-0.05, 0.55, vp.y); gl_FragColor = vec4(mix(bottom, top, h), 1.); }',
        })));
        const glow = document.createElement('canvas'); glow.width = glow.height = 128;
        const gx = glow.getContext('2d')!, gr = gx.createRadialGradient(64, 64, 4, 64, 64, 64);
        gr.addColorStop(0, 'rgba(255,248,225,1)'); gr.addColorStop(0.25, 'rgba(255,236,190,.55)'); gr.addColorStop(1, 'rgba(255,236,190,0)'); gx.fillStyle = gr; gx.fillRect(0, 0, 128, 128);
        const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(glow), color: opts.night ? 0xdfe6ff : 0xfff0c8, depthWrite: false, fog: false }));
        sunSprite.scale.setScalar(opts.night ? 26 : 40); sunSprite.position.set(30, 40, -150); scene.add(sunSprite);
        if (!opts.night) {
            const puff = new THREE.IcosahedronGeometry(1, 1), white = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true, fog: false });
            for (let i = 0; i < 9; i++) {
                const parts = []; for (let k = 0; k < 5; k++) { const sc = 1.1 + Math.sin(k * 1.7) * 0.5; parts.push(puff.clone().applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(k * 1.4 - 2.8, Math.sin(k) * 0.4, rand() * 0.6), new THREE.Quaternion(), new THREE.Vector3(sc, sc, sc)))); }
                const c = new THREE.Mesh(mergeGeometries(parts), white);
                c.position.set((rand() - 0.5) * 140, 26 + rand() * 14, -60 - rand() * 120); c.scale.setScalar(1.6 + rand() * 1.4); c.userData = { speed: 0.4 + rand() * 0.5, dynamic: true }; scene.add(c); clouds.push(c);
            }
        } else {
            const p: number[] = []; for (let i = 0; i < 700; i++) { const a = rand() * Math.PI * 2, e = 0.15 + rand() * 1.2; p.push(Math.cos(a) * 160 * Math.cos(e), 160 * Math.sin(e), Math.sin(a) * 160 * Math.cos(e) - 40); }
            const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
            scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 1.1, fog: false })));
        }
    }

    /* ---------- Light: a warm low sun (or moonlight) whose shadows follow the view ---------- */
    scene.add(new THREE.HemisphereLight(P.hemiSky, P.hemiGround, P.hemiI));
    const sun = new THREE.DirectionalLight(P.sunCol, P.sunI);
    sun.castShadow = true; sun.shadow.mapSize.set(3072, 1536); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
    Object.assign(sun.shadow.camera, { left: -72, right: 72, top: 62, bottom: -40, near: 1, far: 160 });
    scene.add(sun, sun.target);

    /* ---------- Bake helpers: meshes merged by vertex color ---------- */
    const colored = (o: THREE.Mesh, matrix: THREE.Matrix4) => {
        const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
        for (const name of Object.keys(g.attributes)) if (name !== 'position' && name !== 'normal') g.deleteAttribute(name);
        g.clearGroups(); g.applyMatrix4(matrix);
        const c = (o.material as THREE.MeshLambertMaterial).color, n = g.attributes.position.count, cs = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) { cs[i * 3] = c.r; cs[i * 3 + 1] = c.g; cs[i * 3 + 2] = c.b; }
        g.setAttribute('color', new THREE.BufferAttribute(cs, 3)); return g;
    };
    /** A moving group (a flower head) becomes one mesh: one draw instead of one per petal. */
    const mergeGroup = (group: THREE.Group) => {
        group.updateMatrixWorld(true); const inv = group.matrixWorld.clone().invert(), parts: THREE.BufferGeometry[] = [];
        group.traverse(o => { if ((o as THREE.Mesh).isMesh) parts.push(colored(o as THREE.Mesh, inv.clone().multiply(o.matrixWorld))); });
        group.clear(); group.add(shadowed(new THREE.Mesh(mergeGeometries(parts), bakedMaterial), true, false)); return group;
    };

    /* ---------- Raised beds and their plants ---------- */
    const shape = (w: number, h: number) => { const s = new THREE.Shape(); s.moveTo(0, 0); s.bezierCurveTo(w, h * 0.2, w, h * 0.7, 0, h); s.bezierCurveTo(-w, h * 0.7, -w, h * 0.2, 0, 0); return s; };
    const leafGeo = new THREE.ExtrudeGeometry(shape(0.24, 0.62), { depth: 0.02, bevelEnabled: false });
    const petalGeo = new THREE.ExtrudeGeometry(shape(0.09, 0.36), { depth: 0.015, bevelEnabled: false });
    const bed = (group: THREE.Group) => {
        group.add(shadowed(new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.5, 0.42, 20), mat(P.soilDark))).translateY(0.21));
        group.add(shadowed(new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.06, 20), mat(P.soil)), false, true).translateY(0.44));
        for (let k = 0; k < 16; k++) {
            const a = k / 16 * Math.PI * 2, stake = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.6 + (k % 3) * 0.06, 0.12), mat(P.wood)));
            stake.position.set(Math.cos(a) * 1.55, 0.3, Math.sin(a) * 1.55); stake.rotation.y = -a; group.add(stake);
        }
    };
    const stem = (h: number, color: number, bend = 0.15) => shadowed(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(bend, h * 0.5, 0), new THREE.Vector3(-bend * 0.5, h, 0)]), 10, 0.055, 6), mat(color)));
    const leaf = (color: number, y: number, side: number, scale = 1) => {
        const l = shadowed(new THREE.Mesh(leafGeo, mat(color, { side: THREE.DoubleSide })));
        l.position.set(0, y, 0); l.rotation.set(0.2, side > 0 ? 0 : Math.PI, side * 1.1); l.scale.setScalar(scale); return l;
    };
    const ring = (head: THREE.Group, count: number, color: number, radius: number, scale: number, z = 0, offset = 0) => {
        for (let k = 0; k < count; k++) {
            const p = new THREE.Mesh(petalGeo, mat(color, { side: THREE.DoubleSide })), a = (k + offset) / count * Math.PI * 2;
            p.position.set(Math.cos(a) * radius, Math.sin(a) * radius, z); p.rotation.z = a - Math.PI / 2; p.scale.setScalar(scale); head.add(p);
        }
    };
    const heads: THREE.Group[] = [];
    /** The bloom of the chosen species, facing the camera, at the top of the stem. */
    const flowerHead = (): THREE.Group => {
        const h = new THREE.Group();
        const core = (r: number, color: number) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.9, 0.12, 16), mat(color)); c.rotation.x = Math.PI / 2; h.add(c); };
        const ball = (r: number, color: number, x = 0, y = 0, z = 0) => { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), mat(color)); b.position.set(x, y, z); h.add(b); };
        switch (opts.species) {
            case 'margarita': ring(h, 16, bloom.petal, 0.2, 1.05); core(0.18, bloom.core); break;
            case 'tulipan': for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2, p = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), mat(k % 2 ? bloom.petal : bloom.inner)); p.scale.set(0.7, 1.4, 0.5); p.position.set(Math.cos(a) * 0.14, 0.12, Math.sin(a) * 0.14); p.rotation.set(Math.sin(a) * 0.25, 0, -Math.cos(a) * 0.25); h.add(p); } h.rotation.x = 0.35; break;
            case 'rosa': ball(0.3, bloom.petal); ball(0.2, bloom.inner, 0, 0.12, 0.08); ball(0.12, bloom.core, 0.03, 0.2, 0.12); h.rotation.x = 0.35; break;
            case 'lavanda': for (let k = 0; k < 12; k++) ball(0.08 - k * 0.003, k % 2 ? bloom.petal : bloom.inner, Math.sin(k * 2.4) * 0.06, k * 0.07 - 0.2, Math.cos(k * 2.4) * 0.06); h.rotation.x = 0.35; break;
            case 'orquidea': ring(h, 5, bloom.petal, 0.14, 1.2); ring(h, 3, bloom.inner, 0.06, 0.6, 0.02, 0.5); core(0.07, bloom.core); break;
            case 'bonsai': ball(0.45, bloom.core, 0, 0, 0); ball(0.32, bloom.core, 0.35, -0.12, 0); for (let k = 0; k < 10; k++) ball(0.07, k % 2 ? bloom.petal : bloom.inner, Math.cos(k) * 0.4, Math.sin(k * 1.7) * 0.25 + 0.15, Math.sin(k) * 0.3); h.rotation.x = 0.35; break;
            default: ring(h, 14, bloom.inner, 0.26, 1.25, -0.02); ring(h, 14, bloom.petal, 0.26, 1.13, 0, 0.5); core(0.27, bloom.core);
        }
        return h;
    };
    const fullPlant = (height: number): THREE.Group => {
        const g = new THREE.Group();
        if (opts.species === 'cactus') {
            const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 1.6, 10), mat(P.leaf)); body.position.y = 0.8; g.add(shadowed(body));
            g.add(shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 6), mat(P.leaf))).translateY(1.6));
            for (const [s, y] of [[1, 0.8], [-1, 1.1]]) {
                const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.6, 8), mat(P.leafLight)); arm.position.set(s * 0.45, y + 0.25, 0); g.add(shadowed(arm));
                g.add(shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.3, 8), mat(P.leafLight))).translateX(s * 0.3).translateY(y));
            }
            const head = flowerHead(); head.position.y = 1.95; head.scale.setScalar(0.6); mergeGroup(head); head.userData.dynamic = true; g.add(head); heads.push(head);
            return g;
        }
        g.add(stem(height, P.leaf));
        g.add(leaf(P.leafLight, height * 0.35, 1, 1.4), leaf(P.leaf, height * 0.55, -1, 1.25), leaf(P.leafLight, height * 0.75, 1, 0.9));
        const head = flowerHead(); head.position.set(-0.05, height + 0.05, 0.05); head.rotation.x += -0.35;
        mergeGroup(head); head.userData.dynamic = true; g.add(head); heads.push(head);
        return g;
    };
    const sprout = () => { const g = new THREE.Group(); g.add(stem(0.7, P.limeDeep, 0.05), leaf(P.lime, 0.62, 1, 1.15), leaf(P.limeDeep, 0.66, -1, 1.05)); return g; };
    const seed = () => {
        const g = new THREE.Group();
        g.add(shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat(P.soilDark)))); g.children[0].scale.y = 0.45;
        const s = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), mat(P.seed))); s.position.y = 0.2; s.scale.set(1.3, 0.8, 1); g.add(s); return g;
    };
    /** A wooden sign by a unit with its speaking left for later. */
    const signpost = () => {
        const g = new THREE.Group();
        g.add(shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.1, 0.1), mat(P.wood))).translateY(0.55));
        g.add(shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.06), mat(0xe9d3a6))).translateY(1.05));
        // A microphone mark painted on the board
        g.add(new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.12, 4, 8), mat(0x7a4e1e)).translateY(1.1).translateZ(0.04));
        g.add(new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.02, 4, 12, Math.PI), mat(0x7a4e1e)).translateY(1.06).translateZ(0.04).rotateZ(Math.PI));
        return g;
    };

    const plantGroups: THREE.Group[] = [];
    let currentRing: THREE.Mesh | null = null, currentPlant: THREE.Object3D | null = null, growing: THREE.Object3D | null = null;
    units.forEach((state, i) => {
        const at = plots[i], g = new THREE.Group(); g.position.set(at.x, heightAt(at.x, at.z), at.z);
        if (state.startsWith('exam')) {
            // The level's tree, which blooms when the exam is passed, and an arch toward the next level
            g.add(shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.8, 4.2, 9), mat(P.trunk))).translateY(2.1));
            [[0, 5.6, 0, 2.6], [-1.9, 4.8, 0.4, 1.8], [1.9, 5, -0.3, 1.9], [0.4, 6.8, -0.4, 1.7], [-0.8, 4.3, 1.4, 1.4]].forEach(([x, y, z, r], k) =>
                g.add(shadowed(new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), mat(P.canopy[k % 3]))).translateX(x).translateY(y).translateZ(z)));
            const lit = state !== 'exam-locked';
            for (let k = 0; k < 6; k++) {
                const a = k / 6 * Math.PI * 2, lan = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 8), new THREE.MeshLambertMaterial({ color: 0xffd27a, emissive: 0xffb84a, emissiveIntensity: lit ? (opts.night ? 2.2 : 0.6) : 0.05 }));
                lan.position.set(Math.cos(a) * 2.3, 3.6 + Math.sin(k * 2) * 0.3, Math.sin(a) * 2.3); g.add(lan);
                g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.6), mat(0x3a2a1a)).translateX(lan.position.x).translateY(lan.position.y + 0.4).translateZ(lan.position.z));
            }
            if (opts.night && lit) { const light = new THREE.PointLight(0xffc070, 18, 14, 1.6); light.position.y = 3.5; g.add(light); }
            const blossom = new THREE.IcosahedronGeometry(0.2, 0), blossoms = state === 'exam-done' ? 140 : 70;
            for (let k = 0; k < blossoms; k++) {
                const a = rand() * Math.PI * 2, e = rand() * 1.2, r = 2.2 + rand() * 0.6;
                g.add(new THREE.Mesh(blossom, mat(k % 3 ? 0xf6b7cf : 0xffffff)).translateX(Math.cos(a) * Math.cos(e) * r).translateY(5.4 + Math.sin(e) * r * 0.8).translateZ(Math.sin(a) * Math.cos(e) * r));
            }
            for (let k = 0; k < 18; k++) {
                const a = k / 18 * Math.PI * 2, st = shadowed(new THREE.Mesh(new THREE.DodecahedronGeometry(0.32, 0), mat(P.stone)));
                st.position.set(Math.cos(a) * 3.1, 0.15, Math.sin(a) * 3.1); st.scale.y = 0.6; g.add(st);
                g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 0), mat(P.flowers[k % P.flowers.length])).translateX(Math.cos(a + 0.17) * 2.6).translateY(0.35).translateZ(Math.sin(a + 0.17) * 2.6));
            }
            g.add(shadowed(new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.22, 8, 28, Math.PI), mat(P.wood))).translateZ(-7));
            for (let k = 0; k < 14; k++) { const a = k / 13 * Math.PI; g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.26, 0), mat(k % 2 ? 0xc6e86a : 0xffffff)).translateX(Math.cos(a) * 2.4).translateY(Math.sin(a) * 2.4).translateZ(-7)); }
        } else {
            bed(g);
            const plant = state === 'locked' ? seed() : state === 'current' ? sprout() : fullPlant(2.1 + (i % 3) * 0.25);
            if (state === 'current') { plant.scale.setScalar(1.6); currentPlant = plant; plant.userData.dynamic = true; }
            plant.position.y = 0.46; g.add(plant);
            if (state === 'pending') { const s = signpost(); s.position.set(1.1, 0.4, 0.9); s.rotation.y = -0.5; g.add(s); }
            if (state === 'current') {
                currentRing = new THREE.Mesh(new THREE.RingGeometry(1.75, 1.95, 48), new THREE.MeshBasicMaterial({ color: 0xc6e86a, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
                currentRing.rotation.x = -Math.PI / 2; currentRing.position.y = 0.08; g.add(currentRing);
                const glow = new THREE.PointLight(0xd8f08a, opts.night ? 10 : 4, 6, 1.6); glow.position.y = 1.3; g.add(glow);
            }
            if (state === 'locked') g.traverse(o => {
                const m = o as THREE.Mesh; if (m.isMesh && (m.material as THREE.MeshLambertMaterial).color) { m.material = (m.material as THREE.MeshLambertMaterial).clone(); (m.material as THREE.MeshLambertMaterial).color.lerp(new THREE.Color(P.fog), 0.35); }
            });
            // The unit just completed grows when the garden opens
            if (motion && i === opts.grow && (state === 'done' || state === 'pending')) { growing = plant; plant.userData.dynamic = true; plant.scale.setScalar(0.25); }
            g.scale.setScalar(1.35);
        }
        scene.add(g); plantGroups.push(g);
    });

    /* ---------- Lantern glows at night: soft sprites, one draw ---------- */
    if (opts.night && lanterns.length) {
        const cv = document.createElement('canvas'); cv.width = cv.height = 64;
        const x = cv.getContext('2d')!, gr = x.createRadialGradient(32, 32, 2, 32, 32, 32);
        gr.addColorStop(0, 'rgba(255,220,150,.95)'); gr.addColorStop(1, 'rgba(255,200,120,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
        scene.add(new THREE.Points(new THREE.BufferGeometry().setFromPoints(lanterns), new THREE.PointsMaterial({ map: new THREE.CanvasTexture(cv), size: 2.6, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
    }

    /* ---------- Bake: static meshes merge by zone into a few draw calls ---------- */
    {
        const buckets: Record<string, THREE.BufferGeometry[]> = {}, kill: THREE.Object3D[] = [];
        scene.updateMatrixWorld(true);
        scene.traverse(o => {
            const mesh = o as THREE.Mesh;
            if (!mesh.isMesh || (mesh as THREE.InstancedMesh).isInstancedMesh || mesh.geometry.attributes.color) return;
            for (let p: THREE.Object3D | null = o; p; p = p.parent) if (p.userData.dynamic) return;
            const m = mesh.material as THREE.MeshLambertMaterial;
            if (!m.isMeshLambertMaterial || m.map || m.transparent || m.vertexColors) return;
            const glow = m.emissive && m.emissive.getHex(), p = new THREE.Vector3().setFromMatrixPosition(o.matrixWorld);
            const zone = `${p.x < -16 ? 'L' : p.x > 16 ? 'R' : 'C'}${Math.floor(p.z / 30)}`;
            const key = glow ? `glow:${glow}:${m.emissiveIntensity}` : `${o.castShadow ? 'cast' : 'still'}:${zone}`;
            (buckets[key] ||= []).push(colored(mesh, o.matrixWorld)); kill.push(o);
        });
        for (const o of kill) o.removeFromParent();
        for (const [name, list] of Object.entries(buckets)) {
            let material: THREE.Material = bakedMaterial;
            if (name.startsWith('glow:')) { const [, hex, k] = name.split(':'); material = new THREE.MeshLambertMaterial({ vertexColors: true, emissive: +hex, emissiveIntensity: +k }); }
            const mesh = new THREE.Mesh(mergeGeometries(list), material); mesh.castShadow = name.startsWith('cast'); mesh.receiveShadow = !name.startsWith('glow:');
            mesh.geometry.computeBoundingSphere(); scene.add(mesh);
        }
    }

    /* ---------- Life: butterflies by day, fireflies by night ---------- */
    let flies: THREE.Points | null = null, flyBase: Float32Array | null = null, wings: THREE.InstancedMesh | null = null;
    const butterflies: { cx: number; cz: number; y: number; ph: number; rad: number }[] = [];
    if (opts.night) {
        const n = 160, p = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) { p[i * 3] = (rand() - 0.5) * 30; p[i * 3 + 1] = 0.6 + rand() * 2.4; p[i * 3 + 2] = 10 - rand() * (N * STEP + 20); }
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
        flies = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xf6f08a, size: 0.26, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
        flyBase = p.slice(); scene.add(flies);
    } else {
        const count = 14; wings = new THREE.InstancedMesh(new THREE.CircleGeometry(0.16, 6).translate(0.13, 0, 0), new THREE.MeshLambertMaterial({ side: THREE.DoubleSide }), count * 2);
        wings.frustumCulled = false;
        for (let i = 0; i < count; i++) {
            const col = new THREE.Color(P.flowers[i % P.flowers.length]); wings.setColorAt(i * 2, col); wings.setColorAt(i * 2 + 1, col);
            const cx = (rand() - 0.5) * 22, cz = 6 - rand() * (N * STEP); butterflies.push({ cx, cz, y: heightAt(cx, cz), ph: rand() * 6, rad: 1 + rand() * 2 });
        }
        scene.add(wings);
    }

    renderer.shadowMap.needsUpdate = true;

    /* ---------- Camera, driven by the page's scroll ---------- */
    let progress = 0, camZ = plots[0].z + 12, camX = 0, shadowAt = Number.NaN, slowFrames = 0, fastFrames = 0, lastMove = 0, lastFrame = 0, raf = 0;
    let diving: { index: number; start: number; done: () => void } | null = null;
    const growStart = performance.now() + 700;
    const look = new THREE.Vector3(), v = new THREE.Vector3(), anchors: Anchor[] = units.map(() => ({ x: 0, y: 0, visible: false }));
    const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1);

    const resize = () => {
        const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
        renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = h > w ? 52 : 40; camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize); observer.observe(canvas); resize();

    const frame = () => {
        raf = requestAnimationFrame(frame);
        const now = performance.now();
        // Still (no scroll for a while): 30 fps is enough for the wind and the critters
        if (now - lastMove > 1500 && !diving && now - lastFrame < 30) return;
        const frameMs = now - lastFrame; lastFrame = now;
        // Too slow for a while: lower the resolution a step; fast again: raise it back
        if (frameMs > 26 && frameMs < 200) { if (++slowFrames > 40 && dpr > 0.75) { dpr = Math.max(0.75, dpr - 0.25); renderer.setPixelRatio(dpr); resize(); slowFrames = 0; } }
        else if (frameMs < 18) { if (++fastFrames > 240 && dpr < MAX_DPR) { dpr = Math.min(MAX_DPR, dpr + 0.25); renderer.setPixelRatio(dpr); resize(); fastFrames = 0; } slowFrames = Math.max(0, slowFrames - 1); }

        const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime; uTime.value = motion ? t : 0;
        const w = canvas.clientWidth, h = canvas.clientHeight, portrait = h > w;
        const focusIndex = diving ? diving.index : Math.round(progress * (N - 1));
        const targetZ = diving ? plots[diving.index].z + 4 : THREE.MathUtils.lerp(plots[0].z, plots[N - 1].z, progress);
        const ease = motion ? Math.min(1, dt * (diving ? 6 : 4)) : 1;
        camZ += (targetZ - camZ) * ease; camX += ((plots[focusIndex]?.x ?? 0) * (diving ? 0.9 : portrait ? 0.75 : 0.35) - camX) * ease;
        const height = diving ? 7 : portrait ? 24 : 15.5;
        camera.position.set(camX + (motion ? Math.sin(t * 0.2) * 0.3 : 0), camera.position.y ? camera.position.y + (height - camera.position.y) * ease : height, camZ + (diving ? 8 : 17));
        look.set(camX * (diving ? 1 : 0.6), 0, camZ - (portrait ? 6 : 5)); camera.lookAt(look);
        if (diving && now - diving.start > 650) { const d = diving.done; diving = null; d(); }

        if (Number.isNaN(shadowAt) || Math.abs(look.z - shadowAt) > 4) {
            shadowAt = look.z; sun.position.set(look.x + 30, 45, look.z + 6); sun.target.position.set(look.x, 0, look.z - 14); sun.target.updateMatrixWorld();
            renderer.shadowMap.needsUpdate = true;
        }
        if (motion) {
            if (currentRing) { const s = 1 + Math.sin(t * 2.2) * 0.05; currentRing.scale.set(s, s, s); (currentRing.material as THREE.MeshBasicMaterial).opacity = 0.55 + Math.sin(t * 2.2) * 0.3; }
            if (currentPlant) currentPlant.rotation.z = Math.sin(t * 1.3) * 0.05;
            heads.forEach((hd, i) => { hd.rotation.z = Math.sin(t * 0.9 + i * 1.7) * 0.06; });
            clouds.forEach(c => { c.position.x += c.userData.speed * dt; if (c.position.x > 90) c.position.x = -90; });
            if (flies && flyBase) {
                const p = flies.geometry.attributes.position as THREE.BufferAttribute;
                for (let i = 0; i < p.count; i++) { p.setY(i, flyBase[i * 3 + 1] + Math.sin(t * 1.3 + i) * 0.35); p.setX(i, flyBase[i * 3] + Math.sin(t * 0.5 + i * 2) * 0.4); }
                p.needsUpdate = true; (flies.material as THREE.PointsMaterial).opacity = 0.6 + Math.sin(t * 3) * 0.3;
            }
            if (wings) {
                butterflies.forEach((d, i) => {
                    const a = t * 0.6 + d.ph, flap = Math.sin(t * 18 + d.ph) * 0.9;
                    _p.set(d.cx + Math.cos(a) * d.rad, d.y + 1.2 + Math.sin(t * 2 + d.ph) * 0.4, d.cz + Math.sin(a * 1.3) * d.rad);
                    for (const side of [0, 1]) wings!.setMatrixAt(i * 2 + side, _m.compose(_p, _q.setFromEuler(_e.set(0, -a + (side ? Math.PI - flap : flap), 0)), _s));
                });
                wings.instanceMatrix.needsUpdate = true;
            }
        }
        // The plant of the unit just completed grows with a spring: the third achievement moment
        if (growing) {
            const k = THREE.MathUtils.clamp((now - growStart) / 1400, 0, 1), c = 1.70158;
            const s = k <= 0 ? 0.25 : 0.25 + 0.75 * (1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2);
            growing.scale.setScalar(s); if (k >= 1) { growing.scale.setScalar(1); growing = null; renderer.shadowMap.needsUpdate = true; }
            lastMove = now;
        }

        plantGroups.forEach((g, i) => {
            v.copy(g.position); v.y += units[i].startsWith('exam') ? 3 : units[i] === 'locked' ? 2 : 4.4; v.project(camera);
            const x = THREE.MathUtils.clamp((v.x * 0.5 + 0.5) * w, 76, w - 76), y = (-v.y * 0.5 + 0.5) * h;
            anchors[i].x = x; anchors[i].y = y; anchors[i].visible = v.z < 1 && y > 120 && y < h - 40;
        });
        renderer.render(scene, camera);
        onFrame(anchors);
    };
    raf = requestAnimationFrame(frame);

    return {
        setProgress(k) { progress = THREE.MathUtils.clamp(k, 0, 1); lastMove = performance.now(); },
        dive(index) {
            if (!motion) return Promise.resolve();
            return new Promise(resolve => { diving = { index, start: performance.now(), done: resolve }; lastMove = performance.now(); });
        },
        dispose() {
            cancelAnimationFrame(raf); observer.disconnect();
            scene.traverse(o => {
                const m = o as THREE.Mesh; if (!m.geometry) return; m.geometry.dispose();
                // Instance matrices and colors are buffers of their own
                if ((m as THREE.InstancedMesh).isInstancedMesh) (m as THREE.InstancedMesh).dispose();
                for (const material of Array.isArray(m.material) ? m.material : [m.material]) { (material as THREE.MeshLambertMaterial).map?.dispose(); material.dispose(); }
            });
            sun.shadow.map?.dispose();
            renderer.dispose();
            // Give the context back now instead of waiting for the garbage collector
            renderer.forceContextLoss();
        },
    };
}
