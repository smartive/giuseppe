import { CONFIGURATION_SYMBOL } from './Configuration';
import { PARAMHANDLER_SYMBOL } from './ParamHandler';
import { REGISTRAR_SYMBOL } from './Registrar';
import { ROUTEHANDLER_SYMBOL } from './RouteHandler';

export const IoCSymbols = {
    registrar: REGISTRAR_SYMBOL,
    paramHandler: PARAMHANDLER_SYMBOL,
    routeHandler: ROUTEHANDLER_SYMBOL,
    configuration: CONFIGURATION_SYMBOL
};
