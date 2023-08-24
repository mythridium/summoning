import { Component } from '../../framework/component';
import { Renderer } from '../../framework/renderer';
import './status.scss';

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
    Summon1 = 'Summon1',
    Summon2 = 'Summon2'
}

export class Status implements Component {
    public readonly template = 'status/status.html';
    public readonly settings = {
        section: 'General',
        config: [
            {
                type: 'switch',
                name: 'status',
                label: 'Enable Summoning Tablet Display',
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
                label: 'Summoning Tablet Position',
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

    private readonly renderer = new Renderer(this.context).create<RendererContext>({
        shouldRender: () =>
            game.combat.player.rendersRequired.equipment ||
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

    constructor(private readonly context: Modding.ModContext) {}

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
        const summon = game.combat.player.equipment.slots[type];

        return { img: summon.isEmpty ? this.emptyIcon : summon.item.media, quantity: summon.quantity };
    }

    private isVisible() {
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
