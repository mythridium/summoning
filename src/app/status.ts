enum Type {
    Summon1 = 'Summon1',
    Summon2 = 'Summon2'
}

export class Status {
    private isHidden = false;
    private mainContainer?: JQuery<HTMLElement>;
    private cache = { summon1: { id: '', quantity: 0 }, summon2: { id: '', quantity: 0 }, enabled: true };

    private get completionLogSubItems() {
        return sidebar.category('General')?.item('Completion Log')?.subitems() ?? [];
    }

    constructor(private readonly context: Modding.ModContext) {}

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

        const isEnabled = this.context.settings.section('General').get('status') as boolean;

        this.cache.enabled = isEnabled;

        // Don't render in golbin raid or on disabled pages.
        if (game.isGolbinRaid || this.isHidden || !this.mainContainer || !isEnabled) {
            return;
        }

        const summoningStatusContainer = this.getSummoningStatusContainer();

        const summon1 = this.getSummonWithElement(Type.Summon1);
        const summon2 = this.getSummonWithElement(Type.Summon2);

        summoningStatusContainer.append(summon1.element);
        summoningStatusContainer.append(summon2.element);

        this.mainContainer.append(summoningStatusContainer);

        this.cache.summon1 = { id: summon1.id, quantity: summon1.quantity };
        this.cache.summon2 = { id: summon2.id, quantity: summon2.quantity };
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

            return {
                id: slot.id,
                quantity: slot.quantity,
                index
            };
        }
    }

    private getSummonWithElement(type: Type) {
        const summon = this.getSummon(type);
        const element = $(`#combat-equipment-slot-${summon.index}-1`).parent().clone();

        element.find('[data-tippy-root]').remove();

        return { ...summon, element };
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
        const isEnabled = this.context.settings.section('General').get('status') as boolean;

        return (
            isEnabled !== this.cache.enabled ||
            summon1.id !== this.cache.summon1.id ||
            summon1.quantity !== this.cache.summon1.quantity ||
            summon2.id !== this.cache.summon2.id ||
            summon2.quantity !== this.cache.summon2.quantity
        );
    }
}
