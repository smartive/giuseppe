export class DuplicatePluginError {
    public readonly message: string;

    constructor(name: string) {
        this.message = `A plugin with the name '${name}' is already registered.`;
    }
}
