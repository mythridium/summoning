import { Settings } from './settings';
import { Creatable } from './creatable';
import { Status } from './status';
import './styles.scss';

export class App {
    constructor(private readonly context: Modding.ModContext) {}

    public init() {
        const settings = new Settings(this.context);
        const status = new Status(this.context);
        const creatable = new Creatable(this.context);

        settings.init();
        status.init();
        creatable.init();
    }
}
