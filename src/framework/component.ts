type Constructor<T> = new (...args: any[]) => T;

export interface Component {
    template?: string;
    settings?: ComponentSettings;
    init(): void;
}

interface SettingConfig {
    /** Type of the setting. */
    type: string;
    /** Name of the setting. This is the value used for the HTML `id` attribute. */
    name: string;
    /** The default value, used for initial values and upon resetting defaults. */
    default: primitive | primitive[];
    /** Text label for the input. */
    label: string;
    /** Extra text to be displayed below the label in a smaller font. */
    hint: string;
    /** Stub for settings with dropdowns. */
    options?: unknown;
    /** Method responsible for generating the HTML for the input. */
    render?(name: string, onChange: () => void, config: SettingConfig): HTMLElement;
    /** Method that handles user input. Return `false` to prevent the value from changing. Return a string to prevent the value from changing and display a validation error. */
    onChange?(value: unknown, previousValue: unknown): void | boolean | string;
    /** Method responsible for retrieving the current value from the setting's HTML. Must return a value that can be converted to JSON. */
    get?(root: HTMLElement): unknown;
    /** Method responsible for handling how data is inserted into the setting's HTML. */
    set?(root: HTMLElement, value: unknown): void;
}

export interface ComponentSettings {
    section: string;
    config: SettingConfig | SettingConfig[];
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
            context.settings.section(component.settings.section).add(<any>component.settings.config);
        }

        component.init();

        return component;
    }
}
