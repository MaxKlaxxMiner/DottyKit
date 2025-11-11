import './styles.css';

import {Dotty} from './dotty/dotty';

async function bootstrap() {
    const canvas = document.getElementById('dotty') as HTMLCanvasElement | null;
    if (!canvas) throw new Error('Canvas #dotty not found');

    const dotty = new Dotty(canvas);
    dotty.start();

    // Debug-Hook (praktisch beim frühen Prototyping)
    // @ts-expect-error
    window.__dotty = dotty;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { void bootstrap(); });
} else {
    void bootstrap();
}
