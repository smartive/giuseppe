import { GiuseppeRoute } from './GiuseppeRoute';

export const ROUTE_MODIFICATOR_KEY = 'giuseppe:RouteModificator';

export interface RouteModificator {
    modifyRoute(route: GiuseppeRoute[]): GiuseppeRoute[];
}
