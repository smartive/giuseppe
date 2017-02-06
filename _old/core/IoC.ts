import { InitialConfiguration } from './InitialConfiguration';
import { DefaultParamHandler } from './DefaultParamHandler';
import { DefaultRegistrar } from './DefaultRegistrar';
import { DefaultRouteHandler } from './DefaultRouteHandler';
import { IoCSymbols } from './IoCSymbols';
import { Kernel } from 'inversify';

const kernel = new Kernel();

kernel.bind(IoCSymbols.registrar).to(DefaultRegistrar).inSingletonScope();
kernel.bind(IoCSymbols.paramHandler).to(DefaultParamHandler).inSingletonScope();
kernel.bind(IoCSymbols.routeHandler).to(DefaultRouteHandler).inSingletonScope();
kernel.bind(IoCSymbols.configuration).to(InitialConfiguration).inSingletonScope();

export const IocContainer = kernel;
