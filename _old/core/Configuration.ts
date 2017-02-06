/**
 * "Global" configuration of giuseppe.
 * 
 * @interface Configuration
 */
export interface Configuration {
    versionHeaderName: string;
}

/**
 * IoC symbol for the routehandler interface.
 *
 * @type {Symbol}
 */
export const CONFIGURATION_SYMBOL = Symbol('RouteHandler');
