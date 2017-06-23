/**
 * Error that is thrown when a plugin with the same name as another plugin is registered.
 * 
 * @export
 * @class DuplicatePluginError
 * @extends {Error}
 */
export class DuplicatePluginError extends Error {
    constructor(name: string) {
        super(`A plugin with the name '${name}' is already registered.`);
    }
}
