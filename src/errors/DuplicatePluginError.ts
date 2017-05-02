export class DuplicatePluginError extends Error {
    constructor(name: string) {
        super(`A plugin with the name '${name}' is already registered.`);
    }
}
