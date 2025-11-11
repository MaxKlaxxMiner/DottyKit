import {Sprite, Sprites} from "@/dotty/Sprites";

const picMode = true;

export class Dotty {
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    private rafId: number | null = null;
    private readonly handleResize: () => void;

    constructor(canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('no canvas 2D context');

        this.canvas = canvas;
        this.ctx = ctx;
        this.handleResize = () => {
            this.onResize();
        };

        window.addEventListener('resize', this.handleResize);
        this.onResize();
    }

    // --- Update 60 pro Sekunde ---
    private update() {

    }

    pic?: Sprite;

    // --- Update per Frame ---
    private render() {
        const {width, height} = this.canvas;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, width, height);
        ctx.save();

        if (picMode) {
            if (!this.pic) this.pic = Sprites.dottyKitSplash;
            const sp = this.pic;
            const scaleW = width / (sp.w + 2);
            const scaleH = height / (sp.h * 2 + 2);
            const scale = Math.min(scaleW, scaleH);
            ctx.scale(scale, scale * 2);
            sp.draw(ctx, 1, 1);
        }
        ctx.restore();
    }

    public start() {
        const loop = () => {
            this.update();
            this.render();
            this.rafId = requestAnimationFrame(loop);
        };
        this.rafId = requestAnimationFrame(loop);
    }

    public stop() {
        if (this.rafId != null) cancelAnimationFrame(this.rafId);
        this.rafId = null;
    }

    private onResize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        const width = Math.max(1, Math.round(rect.width * dpr));
        const height = Math.max(1, Math.round(rect.height * dpr));

        if (this.canvas.width !== width) this.canvas.width = width;
        if (this.canvas.height !== height) this.canvas.height = height;

        this.ctx.imageSmoothingEnabled = false;
    }

    private isLocalhost(): boolean {
        try {
            const h = window.location.hostname;
            return h === 'localhost' || h === '127.0.0.1' || h === '::1';
        } catch {
            return false;
        }
    }
}
