interface CacheItem {
    id: string;
    quantity: number;
}

interface Cache {
    requirements: CacheItem[];
    ingredients: CacheItem[];
    enabled: boolean;
}

export class Creatable {
    private readonly id = 'summoning-status-you-can-create-recipe';
    private cache: Cache = { requirements: [], ingredients: [], enabled: true };

    constructor(private readonly context: Modding.ModContext) {}

    public init() {
        this.context.onInterfaceReady(() => {
            this.context.patch(Summoning, 'render').after(() => {
                if (this.isDifferent()) {
                    this.update();
                }
            });
        });
    }

    private update() {
        $(`#${this.id}`).remove();

        const isEnabled = this.context.settings.section('General').get('creatable') as boolean;

        this.cache.enabled = isEnabled;

        if (!isEnabled) {
            return;
        }

        const creatable = this.getCreatableQuantity();

        const element = $(
            `<div class="col-12 mt-1 mb-1" id="${this.id}"><small>You can create this recipe <b>${creatable}</b> times</small></div>`
        );

        summoningArtisanMenu.ingredientsCol.append(element[0]);

        this.cache.requirements = this.getRequirements();
        this.cache.ingredients = this.getIngredients();
    }

    private getCreatableQuantity() {
        const result = [];
        const requires = summoningArtisanMenu.requires.icons.filter(
            (icon: ItemQtyIcon) => icon.item?.type !== 'Shard'
        ) as ItemQtyIcon[];

        for (const require of requires) {
            const have = summoningArtisanMenu.haves.icons.find(
                (icon: ItemCurrentIcon) => icon.item.id === require.item?.id
            );

            if (have && have.currentQuantity) {
                result.push(Math.floor(have.currentQuantity / (require.qty || 1)));
            }
        }

        return result.length ? Math.min(...result) : 0;
    }

    private isDifferent() {
        const isEnabled = this.context.settings.section('General').get('creatable') as boolean;

        if (isEnabled !== this.cache.enabled) {
            return true;
        }

        const isRequirementSame = this.isEqual(this.getRequirements(), this.cache.requirements);
        const isIngredientSame = this.isEqual(this.getIngredients(), this.cache.ingredients);

        return !isRequirementSame || !isIngredientSame;
    }

    private getRequirements() {
        return summoningArtisanMenu.requires.icons
            .filter((icon: ItemQtyIcon) => icon.item?.type !== 'Shard')
            .map((icon: ItemQtyIcon) => ({ id: icon.item?.id, quantity: icon.qty }));
    }

    private getIngredients() {
        return summoningArtisanMenu.haves.icons
            .filter((icon: ItemCurrentIcon) => icon.item?.type !== 'Shard')
            .map((icon: ItemCurrentIcon) => ({ id: icon.item?.id, quantity: icon.currentQuantity }));
    }

    private isEqual(obj: CacheItem[], cache: CacheItem[]) {
        return obj.every(item =>
            cache.find(cachedItem => cachedItem.id === item.id && cachedItem.quantity === item.quantity)
        );
    }
}
