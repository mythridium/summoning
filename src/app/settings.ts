export class Settings {
    constructor(private readonly context: Modding.ModContext) {}

    public init() {
        this.context.onInterfaceReady(() => {
            const isOpacityEnabled = this.context.settings.section('General').get('opacity') as boolean;
            summoningArtisanMenu.container.classList.toggle('myth-summoning-status-opacity-enabled', isOpacityEnabled);
        });

        this.context.settings.section('General').add([
            {
                type: 'switch',
                name: 'status',
                label: 'Enable Summoning Status Display',
                hint: 'Display the currently equipped summoning tablets on the interface.',
                default: true
            },
            {
                type: 'switch',
                name: 'creatable',
                label: 'Enable Create Amount Display',
                hint: 'Display the amount of times you can create a summoning recipe based on your materials.',
                default: true
            },
            {
                type: 'switch',
                name: 'opacity',
                label: 'Enable Opacity Reduction',
                hint: 'Reduces opacity on summoning recipes that you do not have materials for.',
                default: true,
                onChange: (value: boolean) => {
                    summoningArtisanMenu.container.classList.toggle('myth-summoning-status-opacity-enabled', value);
                }
            }
        ]);
    }
}
