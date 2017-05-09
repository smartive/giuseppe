import 'reflect-metadata';
import { Giuseppe } from '../../../src/';
import { Controller } from '../../../src/core/controller/GiuseppeApiController';
import { Get } from '../../../src/core/routes';
import { GiuseppeGetRoute } from '../../../src/core/routes/Get';
import { HttpMethod } from '../../../src/routes/RouteDefinition';
import { ControllerMetadata } from '../../../src/utilities/ControllerMetadata';

describe('Core get routes', () => {

    describe('@Get decorator', () => {

        let giuseppe: Giuseppe;

        beforeEach(() => {
            giuseppe = new Giuseppe();
        });

        afterEach(() => {
            (Giuseppe.registrar as any).controller = [];
        });

        it('should return Route decorator', () => {
            expect(Get()).toBeInstanceOf(Function);
        });

        it('should register a route in a controller.', () => {
            class Ctrl {
                @Get()
                public get(): void { }
            }

            const meta = new ControllerMetadata(Ctrl.prototype);

            expect(meta.routes().length).toBe(1);

            const route = meta.routes()[0];
            expect(route).toBeInstanceOf(GiuseppeGetRoute);
        });

        it('should use the correct route', () => {
            class Ctrl {
                @Get('foobar')
                public get(): void { }
            }

            const meta = new ControllerMetadata(Ctrl.prototype);

            expect(meta.routes().length).toBe(1);

            const route = meta.routes()[0];
            expect(route.route).toBe('foobar');
        });

        it('should register the correct middlewares 1', () => {
            class Ctrl {
                @Get()
                public get(): void { }
            }

            const meta = new ControllerMetadata(Ctrl.prototype);

            expect(meta.routes().length).toBe(1);

            const route = meta.routes()[0];
            expect(route.middlewares.length).toBe(0);
        });

        it('should register the correct middlewares 2', () => {
            const fn = () => { };
            class Ctrl {
                @Get(fn)
                public get(): void { }
            }

            const meta = new ControllerMetadata(Ctrl.prototype);

            expect(meta.routes().length).toBe(1);

            const route = meta.routes()[0];
            expect(route.middlewares.length).toBe(1);
            expect(route.middlewares[0]).toBe(fn);
        });

        it('should register the correct middlewares 3', () => {
            const fn = () => { },
                fn2 = () => { };
            class Ctrl {
                @Get(fn, fn2)
                public get(): void { }
            }

            const meta = new ControllerMetadata(Ctrl.prototype);

            expect(meta.routes().length).toBe(1);

            const route = meta.routes()[0];
            expect(route.middlewares.length).toBe(2);
            expect(route.middlewares[0]).toBe(fn);
            expect(route.middlewares[1]).toBe(fn2);
        });

        it('should register the correct middlewares 4', () => {
            const fn = () => { },
                fn2 = () => { };
            class Ctrl {
                @Get('foobar', fn, fn2)
                public get(): void { }
            }

            const meta = new ControllerMetadata(Ctrl.prototype);

            expect(meta.routes().length).toBe(1);

            const route = meta.routes()[0];
            expect(route.middlewares.length).toBe(2);
            expect(route.route).toBe('foobar');
            expect(route.middlewares[0]).toBe(fn);
            expect(route.middlewares[1]).toBe(fn2);
        });

        it('should register the correct http method', () => {
            class Ctrl {
                @Get()
                public get(): void { }
            }

            const meta = new ControllerMetadata(Ctrl.prototype);

            expect(meta.routes().length).toBe(1);

            const route = meta.routes()[0];
            expect(route.httpMethod).toBe(HttpMethod.get);
        });

        it('should contain the correct function', () => {
            class Ctrl {
                @Get()
                public get(): void { }
            }

            const meta = new ControllerMetadata(Ctrl.prototype);

            expect(meta.routes().length).toBe(1);

            const route = meta.routes()[0];
            expect(route.routeFunction).toBe(Ctrl.prototype.get);
        });

    });

    describe('GiuseppeGetRoute class', () => {

        it('should generate the correct id', () => {
            class Ctrl {
                @Get('TheUrl')
                public get(): void { }
            }

            const meta = new ControllerMetadata(Ctrl.prototype);

            expect(meta.routes().length).toBe(1);

            const route = meta.routes()[0],
                generated = route.createRoutes(meta, '', [])[0];

            expect(generated.id).toBe('get_TheUrl');
        });

        it('should use the correct name', () => {
            class Ctrl {
                @Get('TheUrl')
                public yourFancyWordedFunction(): void { }
            }

            const meta = new ControllerMetadata(Ctrl.prototype);

            expect(meta.routes().length).toBe(1);

            const route = meta.routes()[0],
                generated = route.createRoutes(meta, '', [])[0];

            expect(generated.name).toBe('yourFancyWordedFunction');
        });

        it('should generate the correct url', () => {
            class Ctrl {
                @Get('TheUrl')
                public get(): void { }
            }

            const meta = new ControllerMetadata(Ctrl.prototype);

            expect(meta.routes().length).toBe(1);

            const route = meta.routes()[0];
            expect(route.createRoutes(meta, '', [])[0].url).toBe('TheUrl');
        });

        it('should generate the correct http method', () => {
            class Ctrl {
                @Get('TheUrl')
                public get(): void { }
            }

            const meta = new ControllerMetadata(Ctrl.prototype);

            expect(meta.routes().length).toBe(1);

            const route = meta.routes()[0],
                generated = route.createRoutes(meta, '', [])[0];

            expect(generated.method).toBe(HttpMethod.get);
        });

        it('should use the correct function', () => {
            class Ctrl {
                @Get('TheUrl')
                public get(): void { }
            }

            const meta = new ControllerMetadata(Ctrl.prototype);

            expect(meta.routes().length).toBe(1);

            const route = meta.routes()[0],
                generated = route.createRoutes(meta, '', [])[0];

            expect(generated.function).toBe(Ctrl.prototype.get);
        });

        it('should add the correct middlewares', () => {
            const fn = () => { };
            class Ctrl {
                @Get(fn)
                public get(): void { }
            }

            const meta = new ControllerMetadata(Ctrl.prototype);

            expect(meta.routes().length).toBe(1);

            const route = meta.routes()[0],
                generated = route.createRoutes(meta, '', [])[0];

            expect(generated.middlewares[0]).toBe(fn);
        });

    });

    describe('Giuseppe start', () => {

        let giuseppe: Giuseppe,
            spy: jest.SpyInstance<any>;

        beforeEach(() => {
            giuseppe = new Giuseppe();
            spy = jest.spyOn(giuseppe.router, 'get');
        });

        afterEach(() => {
            spy.mockRestore();
            (Giuseppe.registrar as any).controller = [];
        });

        it('should be registered in the router as a get method', () => {
            @Controller()    
            class Ctrl {
                @Get()
                public get(): void { }
            }

            giuseppe.start();

            expect(spy).toBeCalled();
        });

        it('should register the correct url', () => {
            @Controller('api')
            class Ctrl {
                @Get('foobar')
                public get(): void { }
            }

            giuseppe.start();

            expect(spy.mock.calls[0]).toContain('/api/foobar');
        });

        it('should register the correct middlewares', () => {
            const fn = () => { },
                fn2 = () => { };
            @Controller('api')
            class Ctrl {
                @Get('foobar', fn, fn2)
                public get(): void { }
            }

            giuseppe.start();

            expect(spy.mock.calls[0]).toContain('/api/foobar');
            expect(spy.mock.calls[0]).toContain(fn);
            expect(spy.mock.calls[0]).toContain(fn2);
        });

    });

});
