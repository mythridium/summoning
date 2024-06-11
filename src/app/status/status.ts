import './status.scss';
import { Component } from 'src/framework/component';
import { Renderer } from 'src/framework/renderer';
import { Component as RendererComponent } from 'src/framework/renderer';

interface SummoningStatus {
    img: string;
    quantity: number;
}

interface RendererContext {
    summon1: SummoningStatus;
    summon2: SummoningStatus;
    isEnabled: boolean;
    position: Position;
}

type Position = 'left' | 'center';

enum Type {
    Summon1 = 'melvorD:Summon1',
    Summon2 = 'melvorD:Summon2'
}

export class Status implements Component {
    public readonly template = 'app/status/status.html';
    public readonly settings = {
        section: 'General',
        config: [
            {
                type: 'switch',
                name: 'status',
                label: 'Enable Summoning Tablet Display [Desktop]',
                hint: 'Display the currently equipped summoning tablets on the interface.',
                default: true,
                onChange: (value: boolean) => {
                    this.renderer.update({
                        summon1: this.getSummon(Type.Summon1),
                        summon2: this.getSummon(Type.Summon2),
                        isEnabled: value,
                        position: this.position
                    });
                }
            },
            {
                type: 'dropdown',
                name: 'position',
                label: 'Summoning Tablet Position [Desktop]',
                hint: 'Position of the summoning tablet.',
                default: 'left',
                options: [
                    {
                        value: 'left',
                        display: 'Left'
                    },
                    {
                        value: 'center',
                        display: 'Center'
                    }
                ],
                onChange: (value: Position) => {
                    this.renderer.update({
                        summon1: this.getSummon(Type.Summon1),
                        summon2: this.getSummon(Type.Summon2),
                        isEnabled: this.isEnabled,
                        position: value
                    });
                }
            }
        ]
    };

    private readonly emptyIcon = 'assets/media/bank/misc_summon.png';

    private get isEnabled() {
        return (
            this.isVisible() &&
            (this.context.settings.section(this.settings.section).get(this.settings.config[0].name) as boolean)
        );
    }

    private get position() {
        return this.context.settings.section(this.settings.section).get(this.settings.config[1].name) as Position;
    }

    private readonly renderer: RendererComponent<RendererContext>;

    constructor(private readonly context: Modding.ModContext) {
        this.renderer = new Renderer(this.context).create<RendererContext>({
            shouldRender: () =>
                // @ts-ignore // TODO: TYPES
                game.combat.player.renderQueue.equipment ||
                game.summoning.renderQueue.synergyQuantities ||
                game.potions.renderRequired,
            getUpdateState: () => this.getState(),
            component: {
                $template: '#myth-summoning-status',
                summon1: { img: '', quantity: 0 },
                summon2: { img: '', quantity: 0 },
                isEnabled: false,
                position: 'left',
                update({ isEnabled, position, summon1, summon2 }) {
                    this.isEnabled = isEnabled;
                    this.position = position;
                    this.summon1 = summon1;
                    this.summon2 = summon2;
                }
            }
        });
    }

    public init() {
        this.context.onInterfaceReady(() => {
            ui.create(this.renderer, document.querySelector('#page-container'));
            this.renderer.update(this.getState());
        });
    }

    private getState() {
        return {
            summon1: this.getSummon(Type.Summon1),
            summon2: this.getSummon(Type.Summon2),
            isEnabled: this.isEnabled,
            position: this.position
        };
    }

    private getSummon(type: Type) {
        // @ts-ignore // TODO: TYPES
        const summon = game.combat.player.equipment.equippedItems[type];

        return { img: summon.isEmpty ? this.emptyIcon : summon.item.media, quantity: summon.quantity };
    }

    private isVisible() {
        if (nativeManager.isMobile) {
            return false;
        }

        if (game.isGolbinRaid) {
            return false;
        }

        switch (game.openPage.id) {
            case 'melvorD:Shop':
            case 'melvorD:Combat':
            case 'melvorD:GolbinRaid':
            case 'melvorD:CompletionLog':
            case 'melvorD:Lore':
            case 'melvorD:Statistics':
            case 'melvorD:Settings':
            case 'melvorAoD:Cartography':
            case 'melvorAoD:Archaeology':
                return false;
            default:
                return true;
        }
    }
}
