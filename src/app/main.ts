import './styles.scss';

enum Type {
    Summon1 = 'Summon1',
    Summon2 = 'Summon2'
}

export class App {
    private isHidden = false;
    private mainContainer?: JQuery<HTMLElement>;
    private cache = { summon1: { id: '', quantity: 0 }, summon2: { id: '', quantity: 0 } };

    constructor(private readonly context: Modding.ModContext) {}

    private get completionLogSubItems() {
        return sidebar.category('General')?.item('Completion Log')?.subitems() ?? [];
    }

    public init() {
        this.context.onInterfaceReady(() => {
            this.mainContainer = $('#main-container');
            this.toggleVisibility();
            this.update();

            this.context.patch(Summoning, 'render').after(() => {
                if (this.isDifferent()) {
                    this.update();
                }
            });

            this.context.patch(SidebarItem, 'click').after(() => {
                this.toggleVisibility();
                this.update();
            });

            this.completionLogSubItems.forEach(item => {
                item.subitemEl.addEventListener('click', () => {
                    this.isHidden = true;
                    this.update();
                });
            });
        });
    }

    private update() {
        $('#summoning-status').remove();

        // Don't render in golbin raid or on disabled pages.
        if (game.isGolbinRaid || this.isHidden || !this.mainContainer) {
            return;
        }

        const summoningStatusContainer = this.getSummoningStatusContainer();

        const summon1 = this.getSummon(Type.Summon1);
        const summon2 = this.getSummon(Type.Summon2);

        summoningStatusContainer.append(summon1.element);
        summoningStatusContainer.append(summon2.element);

        this.mainContainer.append(summoningStatusContainer);

        this.cache = {
            summon1: { id: summon1.id, quantity: summon1.quantity },
            summon2: { id: summon2.id, quantity: summon2.quantity }
        };
    }

    private getSummoningStatusContainer() {
        return $('<div id="summoning-status"></div>');
    }

    private getSummon(type: Type) {
        let index = -1;

        for (const slot of game.combat.player.equipment.slotArray) {
            index += 1;

            if (slot.type !== type) {
                continue;
            }

            const element = $(`#combat-equipment-slot-${index}-1`).parent().clone();

            element.find('[data-tippy-root]').remove();

            return {
                id: slot.id,
                quantity: slot.quantity,
                element
            };
        }
    }

    private toggleVisibility() {
        switch (game.openPage.id) {
            case 'melvorD:Shop':
            case 'melvorD:Combat':
            case 'melvorD:GolbinRaid':
            case 'melvorD:Lore':
            case 'melvorD:Statistics':
            case 'melvorD:Settings':
                this.isHidden = true;
                break;
            default:
                this.isHidden = false;
        }
    }

    private isDifferent() {
        const summon1 = this.getSummon(Type.Summon1);
        const summon2 = this.getSummon(Type.Summon2);

        return (
            summon1.id !== this.cache.summon1.id ||
            summon1.quantity !== this.cache.summon1.quantity ||
            summon2.id !== this.cache.summon2.id ||
            summon2.quantity !== this.cache.summon2.quantity
        );
    }
}
