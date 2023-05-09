type Constructor<T> = new (...args: any[]) => T;

export interface Component {
    template?: string;
    settings?: { section: string; config: Modding.Settings.SettingConfig | Modding.Settings.SettingConfig[] };
    init(): void;
}

export class ComponentMaker {
    public static create<T extends Constructor<Component>>(
        context: Modding.ModContext,
        constructor: T
    ): InstanceType<T> {
        const component = new constructor(context) as InstanceType<T>;

        if (component.template) {
            context.loadTemplates(component.template);
        }

        if (component.settings) {
            context.settings.section(component.settings.section).add(component.settings.config);
        }

        component.init();

        return component;
    }
}
