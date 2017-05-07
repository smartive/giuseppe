export class DefinitionNotRegisteredError extends Error {
    constructor(name: string) {
        super(`The definition with the name '${name}' is not registered as a plugin within giuseppe.`);
    }
}
