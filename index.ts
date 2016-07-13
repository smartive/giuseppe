import {RouteHandler} from './core/RouteHandler';
import {ParamHandler} from './core/ParamHandler';
import {Registrar} from './core/Registrar';
import {Router} from 'express';

export * from './controllers/ControllerDecorator';
export * from './errors/ErrorHandlerDecorator';
export * from './errors/ControllerErrorHandler';
export * from './errors/Errors';
export * from './params/ParamDecorators';
export * from './routes/RouteDecorators';
export * from './validators/Validators';

// core
const paramHandler = new ParamHandler();
const routeHandler = new RouteHandler(paramHandler);
const registrar = new Registrar(routeHandler, paramHandler);

export const registerControllersFromFolder = registrar.registerControllersFromFolder;
export const registerControllers = registrar.registerControllers;
