import 'reflect-metadata';

import { ControllerDefinition } from './controller/ControllerDefinition';
import { Giuseppe } from './Giuseppe';
import { ParameterDefinition } from './parameter/ParameterDefinition';
import { ReturnType } from './routes/ReturnType';
import { RouteDefinition } from './routes/RouteDefinition';
import { RouteModificator } from './routes/RouteModificator';

/**
 * Type for a constructor function that creates a {@link ControllerDefinition}.
 *
 * @type {new (...args: any[]) => ControllerDefinition}
 * @export
 */
export type ControllerDefinitionConstructor = new (...args: any[]) => ControllerDefinition;

/**
 * Type for a constructor function that creates a {@link RouteDefinition}.
 *
 * @type {new (...args: any[]) => RouteDefinition}
 * @export
 */
export type RouteDefinitionConstructor = new (...args: any[]) => RouteDefinition;

/**
 * Type for a constructor function that creates a {@link RouteModificator}.
 *
 * @type {new (...args: any[]) => RouteModificator}
 * @export
 */
export type RouteModificatorConstructor = new (...args: any[]) => RouteModificator;

/**
 * Type for a constructor function that creates a {@link ParameterDefinition}.
 *
 * @type {new (...args: any[]) => ParameterDefinition}
 * @export
 */
export type ParameterDefinitionConstructor = new (...args: any[]) => ParameterDefinition;

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
     * @memberof GiuseppePlugin
     */
    readonly name: string;

    /**
     * A list of return type handlers declared by this plugin (or null if none are registered).
     * This property is accessed by giuseppe after the initialize method is called on each plugin.
     * 
     * @type {(ReturnTypeHandler[] | null)}
     * @memberof GiuseppePlugin
     */
    readonly returnTypeHandler: ReturnType<any>[] | null;

    /**
     * A list of controller decorators declared by this plugin (or null if none are registered).
     * This property is accessed by giuseppe after the initialize method is called on each plugin.
     * 
     * @type {(ControllerDecorator[] | null)}
     * @memberof GiuseppePlugin
     */
    readonly controllerDefinitions: ControllerDefinitionConstructor[] | null;

    /**
     * A list of route decorators declared by this plugin (or null if none are registered).
     * This property is accessed by giuseppe after the initialize method is called on each plugin.
     * 
     * @type {(RouteDecorator[] | null)}
     * @memberof GiuseppePlugin
     */
    readonly routeDefinitions: RouteDefinitionConstructor[] | null;

    /**
     * A list of route / controller modificators declared by this plugin (or null if none are registered).
     * This property is accessed by giuseppe after the initialize method is called on each plugin.
     * 
     * @type {(RouteModificator[] | null)}
     * @memberof GiuseppePlugin
     */
    readonly routeModificators: RouteModificatorConstructor[] | null;

    /**
     * A list of parameter decorators declared by this plugin (or null if none are registered).
     * This property is accessed by giuseppe after the initialize method is called on each plugin.
     * 
     * @type {(ParameterDecorator[] | null)}
     * @memberof GiuseppePlugin
     */
    readonly parameterDefinitions: ParameterDefinitionConstructor[] | null;

    /**
     * Initialize hook for the plugin. Is called after the plugin is registered with giuseppe.
     * Due to the fact that decorators are executed when a file (or class) is loaded,
     * register all plugins first, before you load some controllers.
     * 
     * @param {Giuseppe} giuseppeInstance 
     * @memberof GiuseppePlugin
     */
    initialize(giuseppeInstance: Giuseppe): void;
}
