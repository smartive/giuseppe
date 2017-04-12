/**
 * Basic interface for any plugin. Defines the minimal methods that should be provided to actually be pluggable
 * into giuseppe.
 * 
 * @export
 * @interface GiuseppePlugin
 */
export interface GiuseppePlugin {
    /**
     * The name of the plugin. Used to register a plugin to the giuseppe core.
     * 
     * @type {string}
     * @memberOf GiuseppePlugin
     */
    readonly name: string;

    getReturnTypeHandler(): void;
}
