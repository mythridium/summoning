import { ComponentMaker } from '../framework/component';
import { Status } from './status/status';
import { Create } from './create/create';
import { Opacity } from './opacity/opacity';

export class App {
    constructor(private readonly context: Modding.ModContext) {}

    public init() {
        ComponentMaker.create(this.context, Status);
        ComponentMaker.create(this.context, Create);
        ComponentMaker.create(this.context, Opacity);
    }
}
