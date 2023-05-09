import { Component } from '../../framework/component';
import './opacity.scss';

export class Opacity implements Component {
    public readonly settings = {
        section: 'General',
        config: {
            type: 'switch',
            name: 'opacity',
            label: 'Enable Opacity Reduction',
            hint: 'Reduces the opacity on summoning recipes that you do not have materials for.',
            default: true,
            onChange: (value: boolean) => this.onChange(value)
        }
    };

    private readonly opacityClass = 'myth-summoning-opacity';

    constructor(private readonly context: Modding.ModContext) {}

    public init() {
        this.context.onInterfaceReady(() => {
            this.onChange(
                this.context.settings.section(this.settings.section).get(this.settings.config.name) as boolean
            );
        });
    }

    private onChange(value: boolean) {
        summoningArtisanMenu.container.classList.toggle(this.opacityClass, value);
    }
}
