import {createPixelArtImage, PixelArtDefinition} from "@/dotty/pixelArt";
import {PIC_DOTTYKIT_SPLASH} from "@/dotty/pics";

export class Sprite {
    readonly pic: PixelArtDefinition;
    readonly img: HTMLImageElement;
    readonly w: number;
    readonly h: number;
    readonly layers: { [name: string]: Sprite }

    constructor(pic: PixelArtDefinition) {
        this.pic = pic;
        this.img = createPixelArtImage(pic);
        this.w = pic.w;
        this.h = pic.h;
        this.layers = {};
        for (const n in pic.layers) {
            this.layers[n] = new Sprite(pic.layers[n]);
        }
    }

    draw(ctx: CanvasRenderingContext2D, x: number, y: number, status: number = 0) {
        ctx.drawImage(this.img, x, y);
        if (status) {
            const st = 1 - Math.min(1, Math.max(0, status));
            const sv = this.layers.statusV;
            if (sv) {
                const ofsY = sv.pic.ofsY ?? 0;
                const cut = ofsY + (sv.h - ofsY) * st;
                ctx.drawImage(sv.img, 0, cut, sv.w, sv.h - cut, x, y + cut, sv.w, sv.h - cut);
            }
        }
    }
}

export class Sprites {
    static readonly dottyKitSplash = new Sprite(PIC_DOTTYKIT_SPLASH);
}
