import { Component } from '../../framework/component';
import { Renderer } from '../../framework/renderer';
import './create.scss';

export class Create implements Component {
    public readonly template = 'create/create.html';
    public readonly settings = {
        section: 'General',
        config: {
            type: 'switch',
            name: 'create',
            label: 'Enable Create Recipe Amount Display',
            hint: 'Display the amount of times you can create a summoning recipe based on your materials.',
            default: true,
            onChange: (value: boolean) => {
                this.renderer.update({ amount: this.getAmount(), isEnabled: value });
            }
        }
    };

    private get isEnabled() {
        return this.context.settings.section(this.settings.section).get(this.settings.config.name) as boolean;
    }

    private readonly renderer = new Renderer(this.context).create<{ amount: number; isEnabled: boolean }>({
        shouldRender: () => game.summoning.renderQueue.quantities || game.summoning.renderQueue.selectedRecipe,
        getUpdateState: () => this.getState(),
        component: {
            $template: '#myth-summoning-create',
            amount: 0,
            isEnabled: false,
            update({ amount, isEnabled }) {
                this.amount = amount;
                this.isEnabled = isEnabled;
            }
        }
    });

    constructor(private readonly context: Modding.ModContext) {}

    public init() {
        this.context.onInterfaceReady(() => {
            ui.create(this.renderer, summoningArtisanMenu.ingredientsCol);
            this.renderer.update(this.getState());
        });
    }

    private getState() {
        return {
            amount: this.getAmount(),
            isEnabled: this.isEnabled
        };
    }

    private getAmount() {
        const minimumCreatable = summoningArtisanMenu.haves.icons
            .filter((icon: ItemCurrentIcon) => icon.item.type !== 'Shard')
            .map((icon: ItemCurrentIcon) => Math.floor(icon.currentQuantity / (icon.requiredQuantity || 1)));

        if (!minimumCreatable.length) {
            return 0;
        }

        return Math.min(...minimumCreatable);
    }
}
