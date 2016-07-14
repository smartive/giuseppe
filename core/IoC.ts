import {Kernel} from 'inversify';
import {REGISTRAR_SYMBOL} from './Registrar';
import {DefaultRegistrar} from './DefaultRegistrar';

const kernel = new Kernel();

kernel.bind(REGISTRAR_SYMBOL).to(DefaultRegistrar).inSingletonScope();

export const IocContainer = kernel;

export const Symbols = {
    registrar: REGISTRAR_SYMBOL
};
