import { App } from './app/main';

export function setup(context: Modding.ModContext) {
    const app = new App(context);
    app.init();
}
