import './create.scss';
import { Component } from 'src/framework/component';
import { Renderer, Component as RendererComponent } from 'src/framework/renderer';

export class Create implements Component {
    public readonly template = 'app/create/create.html';
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

    private readonly renderer: RendererComponent<{ amount: number; isEnabled: boolean }>;

    constructor(private readonly context: Modding.ModContext) {
        this.renderer = new Renderer(this.context).create<{ amount: number; isEnabled: boolean }>({
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
    }

    public init() {
        this.context.onInterfaceReady(() => {
            // @ts-ignore // TODO: TYPES
            ui.create(this.renderer, summoningArtisanMenu.haves.parentElement.parentElement);
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
        // @ts-ignore // TODO: TYPES
        const minimumCreatable = summoningArtisanMenu.haves.icons.items
            .filter((icon: ItemCurrentIcon) => icon.item?.type !== 'Shard')
            .map((icon: ItemCurrentIcon) => Math.floor(icon.currentQuantity / (icon.requiredQuantity || 1)));

        if (!minimumCreatable.length) {
            return 0;
        }

        return Math.min(...minimumCreatable);
    }
}
