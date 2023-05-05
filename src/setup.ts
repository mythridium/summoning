import { App } from './app/main';
import packageJson from '../package.json';

export function setup(context: Modding.ModContext) {
    const app = new App(context);
    app.init();
    console.log(`[Myth] Summoning Tools - Initialised v${packageJson.version}`);
}
