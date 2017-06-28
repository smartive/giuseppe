import 'reflect-metadata';

// Basic types and interfaces for giuseppe
export * from './Giuseppe';
export * from './GiuseppePlugin';
export * from './controller/ControllerDefinition';
export { ErrorHandler, ErrorHandlerFunction } from './errors';
export { ParameterDefinition } from './parameter/ParameterDefinition';
export { GiuseppeRoute } from './routes/GiuseppeRoute';
export { ReturnType } from './routes/ReturnType';
export { HttpMethod, RouteDefinition } from './routes/RouteDefinition';
export { RouteModificator } from './routes/RouteModificator';
export * from './utilities/ControllerMetadata';

// Core giuseppe functionallity
export { Controller } from './core/controller/GiuseppeApiController';

export { Body } from './core/parameters/Body';
export { Cookie } from './core/parameters/Cookie';
export { Header } from './core/parameters/Header';
export {
    isArray,
    isNumber,
    isString,
    ParameterFactory,
    ParameterValidator,
    Validator,
} from './core/parameters/ParameterAdditions';
export { Query } from './core/parameters/Query';
export { UrlParam } from './core/parameters/UrlParam';

export { Delete } from './core/routes/Delete';
export { Get } from './core/routes/Get';
export { Route } from './core/routes/GiuseppeBaseRoute';
export { Head } from './core/routes/Head';
export { Post } from './core/routes/Post';
export { Put } from './core/routes/Put';
