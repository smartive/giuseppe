export const ROUTE_DECORATOR_KEY = 'giuseppe:RouteDecorator';

export interface RouteDecorator {
    readonly httpMethod: string;
    routeId(): string;
    register(): any;
}
