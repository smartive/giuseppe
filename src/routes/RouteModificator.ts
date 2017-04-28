export const ROUTE_MODIFICATOR_KEY = 'giuseppe:RouteModificator';

// pre and post route hook (maybe modify the result?)

export interface RouteModificator {
    readonly routeFunction: Function;
}
