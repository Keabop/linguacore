import * as THREE from 'three';

/**
 * The garden as pixel art: the scene is drawn small (one art pixel is a few screen pixels), every
 * pixel snaps to a short palette with an ordered dither between neighbouring colours, the edges
 * get a one-pixel ink outline, and the result is scaled up without smoothing. The palette borrows
 * the night print's inks (navy, cream, red, gold) and keeps the garden's greens. The scene, the
 * camera walk and the labels are untouched: this is only the last step.
 */

/** One art pixel, in CSS pixels */
export const ART_PIXEL = 3;

const NIGHT = [
    0x0a1328, 0x13234a, 0x1f3864, 0x34557e, 0x5a7896, // night blues, deepest to moonlit
    0xe8dab2, 0xb9a77f, // cream and its shade (moonlight, paths, stones)
    0x1e3f3c, 0x2f5d4c, 0x4f8560, 0x8db35e, // greens: shade to sprout
    0x5a3f30, 0x8a6244, // soil and wood
    0xe2522f, 0xe9b34a, 0xf6e7a8, // red, gold, lamp light
    0xc77aa8, // blossom
];
const DAY = [
    0x1f2f50, 0x3d5a7e, 0x7fa4c0, 0xb7d3e2, // ink navy to sky
    0xf4ead0, 0xe3d2a8, 0xc9b282, // paper, sand, path edge
    0x2f5e3f, 0x4f8a4e, 0x79ad58, 0xa9cc63, 0xd7e59a, // greens: shade to lime
    0x7a5236, 0xb0805a, // soil and wood
    0xe2522f, 0xf0b53c, 0xf28bb0, 0xb79cf0, 0xffffff, // red, gold, pink, lilac, white petals
];

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const fragmentShader = (count: number) => /* glsl */ `
uniform sampler2D tScene;
uniform vec2 uArt;
uniform float uExposure;
uniform float uSpread;
uniform vec3 uInk;
uniform vec3 uPalette[${count}];
varying vec2 vUv;

vec3 toSRGB(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
// No tone curve: the sprites are drawn in their final colours, and the scene's lights are set low enough not to clip
vec3 art(vec2 px) { return toSRGB(clamp(texture2D(tScene, (px + 0.5) / uArt).rgb * uExposure, 0.0, 1.0)); }
float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

// 4x4 ordered dither, one cell per art pixel: the classic checker between two palette colours
float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float bayer(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }

vec3 nearest(vec3 c) {
    vec3 best = uPalette[0];
    float bestD = 1e9;
    for (int i = 0; i < ${count}; i++) {
        vec3 d = (c - uPalette[i]) * vec3(0.3, 0.59, 0.11);
        float dist = dot(d, d) + dot(c - uPalette[i], c - uPalette[i]) * 0.2;
        if (dist < bestD) { bestD = dist; best = uPalette[i]; }
    }
    return best;
}

void main() {
    vec2 px = floor(vUv * uArt);
    vec3 col = art(px);
    vec3 pick = nearest(col + (bayer(px) - 0.5) * uSpread);

    // One-pixel ink outline on the darker side of a clear edge, as a sprite would have it
    float l = luma(col);
    float darker = max(luma(art(px + vec2(0.0, 1.0))) - l, luma(art(px - vec2(1.0, 0.0))) - l);
    pick = mix(pick, uInk, step(0.3, darker) * 0.9);

    gl_FragColor = vec4(pick, 1.0);
}
`;

export interface PixelPass {
    setSize(width: number, height: number): void;
    render(scene: THREE.Scene, camera: THREE.Camera): void;
    dispose(): void;
}

export function createPixelPass(renderer: THREE.WebGLRenderer, night: boolean, extra: number[] = []): PixelPass {
    // The sprites' own colours join the palette, so a drawn pixel comes out exactly as drawn
    const palette = [...new Set([...(night ? NIGHT : DAY), ...extra])];
    // Linear filtering inside the small picture keeps it stable while the camera walks; the upscale
    // reads one texel per art pixel, so the pixels stay crisp
    const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    const srgb = (hex: number) => new THREE.Color(hex).convertLinearToSRGB();
    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: fragmentShader(palette.length),
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
        uniforms: {
            tScene: { value: target.texture },
            uArt: { value: new THREE.Vector2(1, 1) },
            uExposure: { value: 1 },
            // A light dither: enough to break flat ground into pixels, not enough to move a sprite's colour
            uSpread: { value: night ? 0.035 : 0.045 },
            uInk: { value: srgb(night ? 0x060c1c : 0x1f2f50) },
            uPalette: { value: palette.map(srgb) },
        },
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    quad.frustumCulled = false;
    const pixelScene = new THREE.Scene();
    pixelScene.add(quad);
    const pixelCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    return {
        setSize(width, height) {
            const w = Math.max(1, Math.round(width / ART_PIXEL)), h = Math.max(1, Math.round(height / ART_PIXEL));
            target.setSize(w, h);
            material.uniforms.uArt.value.set(w, h);
        },
        render(scene, camera) {
            renderer.setRenderTarget(target);
            renderer.render(scene, camera);
            renderer.setRenderTarget(null);
            renderer.render(pixelScene, pixelCamera);
        },
        dispose() {
            target.dispose();
            material.dispose();
            quad.geometry.dispose();
        },
    };
}
