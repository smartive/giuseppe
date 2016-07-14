import {Kernel} from 'inversify';
import {DefaultRegistrar} from './DefaultRegistrar';
import {DefaultParamHandler} from './DefaultParamHandler';
import {DefaultRouteHandler} from './DefaultRouteHandler';
import {IoCSymbols} from './IoCSymbols';

const kernel = new Kernel();

kernel.bind(IoCSymbols.registrar).to(DefaultRegistrar).inSingletonScope();
kernel.bind(IoCSymbols.paramHandler).to(DefaultParamHandler).inSingletonScope();
kernel.bind(IoCSymbols.routeHandler).to(DefaultRouteHandler).inSingletonScope();

export const IocContainer = kernel;
