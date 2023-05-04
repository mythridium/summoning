import '../css/styles.css';

export function setup(ctx) {
    const getSummoningStatusContainer = () => $('<div id="summoning-status"></div>');
    const getSummon1 = () => {
        const summon = game.combat.player.equipment.slots.Summon1;

        return {
            id: summon.id,
            quantity: summon.quantity,
            element: $('#combat-equipment-slot-12-1').parent().clone()
        };
    };
    const getSummon2 = () => {
        const summon = game.combat.player.equipment.slots.Summon2;

        return {
            id: summon.id,
            quantity: summon.quantity,
            element: $('#combat-equipment-slot-13-1').parent().clone()
        };
    };
    const getCompletionLogSubItems = () => sidebar.category('General')?.item('Completion Log')?.subitems() ?? [];

    const update = mainContainer => {
        $('#summoning-status').remove();

        // Don't render in golbin raid or on disabled pages.
        if (game.isGolbinRaid || isHidden || !mainContainer) {
            return;
        }

        const summoningStatusContainer = getSummoningStatusContainer();

        const summon1 = getSummon1();
        const summon2 = getSummon2();

        summoningStatusContainer.append(summon1.element);
        summoningStatusContainer.append(summon2.element);

        mainContainer.append(summoningStatusContainer);

        summon1Cache = { id: summon1.id, quantity: summon1.quantity };
        summon2Cache = { id: summon2.id, quantity: summon2.quantity };
    };

    const toggleStatus = () => {
        switch (game.openPage.id) {
            case 'melvorD:Shop':
            case 'melvorD:Combat':
            case 'melvorD:GolbinRaid':
            case 'melvorD:Lore':
            case 'melvorD:Statistics':
            case 'melvorD:Settings':
                isHidden = true;
                break;
            default:
                isHidden = false;
        }
    };

    const isDifferent = () => {
        const summon1 = getSummon1();
        const summon2 = getSummon2();

        return (
            summon1.id !== summon1Cache.id ||
            summon1.quantity !== summon1Cache.quantity ||
            summon2.id !== summon2Cache.id ||
            summon2.quantity !== summon2Cache.quantity
        );
    };

    let mainContainer;
    let isHidden = false;
    let summon1Cache = { id: '', quantity: 0 };
    let summon2Cache = { id: '', quantity: 0 };

    const completionLogListenerClick = () => {
        isHidden = true;
        update(mainContainer);
    };

    ctx.onInterfaceReady(() => {
        mainContainer = $('#main-container');
        toggleStatus();
        update(mainContainer);

        ctx.patch(Summoning, 'render').after(() => {
            if (isDifferent()) {
                update(mainContainer);
            }
        });

        ctx.patch(SidebarItem, 'click').after(() => {
            toggleStatus();
            update(mainContainer);
        });

        getCompletionLogSubItems().forEach(item => {
            item.subitemEl.addEventListener('click', completionLogListenerClick);
        });
    });

    ctx.onCharacterSelectionLoaded(() => {
        // Not sure if needed, but clean up the listeners if we go out to character selection.
        getCompletionLogSubItems().forEach(item => {
            item.subitemEl.removeEventListener('click', completionLogListenerClick);
        });
    });
}
