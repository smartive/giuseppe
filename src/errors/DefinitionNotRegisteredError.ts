/**
 * Error that is thrown when a used definition (route, controller or param definition) is not registered in the
 * giuseppe core. Each definition must be registered within a plugin.
 * 
 * @export
 * @class DefinitionNotRegisteredError
 * @extends {Error}
 */
export class DefinitionNotRegisteredError extends Error {
    constructor(name: string) {
        super(`The definition with the name '${name}' is not registered as a plugin within giuseppe.`);
    }
}
