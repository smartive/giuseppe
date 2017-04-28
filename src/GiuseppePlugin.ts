import { RouteDefinition } from './routes/RouteDefinition';
import { ControllerDefinition } from './controller/ControllerDefinition';
import { Giuseppe } from './Giuseppe';
import { ReturnTypeHandler } from './routes/ReturnTypeHandler';
import { RouteModificator } from './routes/RouteModificator';

/**
 * Basic interface for any plugin. Defines the minimal methods that should be provided to actually be pluggable
 * into giuseppe. The plugins need to be registered with giuseppe before any controllers are loaded.
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

    /**
     * A list of return type handlers declared by this plugin (or null if none are registered).
     * This property is accessed by giuseppe after the initialize method is called on each plugin.
     * 
     * @type {(ReturnTypeHandler[] | null)}
     * @memberOf GiuseppePlugin
     */
    readonly returnTypeHandler: ReturnTypeHandler[] | null;

    /**
     * A list of controller decorators declared by this plugin (or null if none are registered).
     * This property is accessed by giuseppe after the initialize method is called on each plugin.
     * 
     * @type {(ControllerDecorator[] | null)}
     * @memberOf GiuseppePlugin
     */
    readonly controllerDecorators: ControllerDefinition[] | null;

    /**
     * A list of route decorators declared by this plugin (or null if none are registered).
     * This property is accessed by giuseppe after the initialize method is called on each plugin.
     * 
     * @type {(RouteDecorator[] | null)}
     * @memberOf GiuseppePlugin
     */
    readonly routeDecorators: RouteDefinition[] | null;

    /**
     * A list of route / controller modificators declared by this plugin (or null if none are registered).
     * This property is accessed by giuseppe after the initialize method is called on each plugin.
     * 
     * @type {(RouteModificator[] | null)}
     * @memberOf GiuseppePlugin
     */
    readonly routeModificators: RouteModificator[] | null;

    /**
     * A list of parameter decorators declared by this plugin (or null if none are registered).
     * This property is accessed by giuseppe after the initialize method is called on each plugin.
     * 
     * @type {(ParameterDecorator[] | null)}
     * @memberOf GiuseppePlugin
     */
    readonly parameterDecorators: ParameterDecorator[] | null;

    /**
     * Initialize hook for the plugin. Is called after the plugin is registered with giuseppe.
     * Due to the fact that decorators are executed when a file (or class) is loaded,
     * register all plugins first, before you load some controllers.
     * 
     * @param {Giuseppe} giuseppeInstance 
     * 
     * @memberOf GiuseppePlugin
     */
    initialize(giuseppeInstance: Giuseppe): void;
}
