import 'reflect-metadata';

import { Giuseppe } from '../../../src/';
import { Controller } from '../../../src/core/controller/GiuseppeApiController';
import { Delete, GiuseppeDeleteRoute } from '../../../src/core/routes/Delete';
import { Get, GiuseppeGetRoute } from '../../../src/core/routes/Get';
import { GiuseppeHeadRoute, Head } from '../../../src/core/routes/Head';
import { GiuseppePostRoute, Post } from '../../../src/core/routes/Post';
import { GiuseppePutRoute, Put } from '../../../src/core/routes/Put';
import { DefinitionNotRegisteredError } from '../../../src/errors';
import { HttpMethod } from '../../../src/routes/RouteDefinition';
import { ControllerMetadata } from '../../../src/utilities/ControllerMetadata';

const routeRuns = [
    {
        name: 'get',
        pascalName: 'Get',
        decorator: Get,
        method: HttpMethod.get,
        instanceOf: GiuseppeGetRoute,
    },
    {
        name: 'delete',
        pascalName: 'Delete',
        decorator: Delete,
        method: HttpMethod.delete,
        instanceOf: GiuseppeDeleteRoute,
    },
    {
        name: 'put',
        pascalName: 'Put',
        decorator: Put,
        method: HttpMethod.put,
        instanceOf: GiuseppePutRoute,
    },
    {
        name: 'post',
        pascalName: 'Post',
        decorator: Post,
        method: HttpMethod.post,
        instanceOf: GiuseppePostRoute,
    },
    {
        name: 'head',
        pascalName: 'Head',
        decorator: Head,
        method: HttpMethod.head,
        instanceOf: GiuseppeHeadRoute,
    },
];

describe('Core routes', () => {

    for (const run of routeRuns) {

        describe(`${run.pascalName} route`, () => {

            describe(`@${run.pascalName} decorator`, () => {

                let giuseppe: Giuseppe;

                beforeEach(() => {
                    giuseppe = new Giuseppe();
                });

                afterEach(() => {
                    (Giuseppe.registrar as any).controller = [];
                });

                it('should return Route decorator', () => {
                    expect(run.decorator()).toBeInstanceOf(Function);
                });

                it('should register a route in a controller.', () => {
                    class Ctrl {
                        @run.decorator()
                        public ctrlFunction(): void { }
                    }

                    const meta = new ControllerMetadata(Ctrl.prototype);

                    expect(meta.routes().length).toBe(1);

                    const route = meta.routes()[0];
                    expect(route).toBeInstanceOf(run.instanceOf);
                });

                it('should use the correct route', () => {
                    class Ctrl {
                        @run.decorator('foobar')
                        public ctrlFunction(): void { }
                    }

                    const meta = new ControllerMetadata(Ctrl.prototype);

                    expect(meta.routes().length).toBe(1);

                    const route = meta.routes()[0];
                    expect(route.route).toBe('foobar');
                });

                it('should register the correct middlewares 1', () => {
                    class Ctrl {
                        @run.decorator()
                        public ctrlFunction(): void { }
                    }

                    const meta = new ControllerMetadata(Ctrl.prototype);

                    expect(meta.routes().length).toBe(1);

                    const route = meta.routes()[0];
                    expect(route.middlewares.length).toBe(0);
                });

                it('should register the correct middlewares 2', () => {
                    const fn = () => { };
                    class Ctrl {
                        @run.decorator(fn)
                        public ctrlFunction(): void { }
                    }

                    const meta = new ControllerMetadata(Ctrl.prototype);

                    expect(meta.routes().length).toBe(1);

                    const route = meta.routes()[0];
                    expect(route.middlewares.length).toBe(1);
                    expect(route.middlewares[0]).toBe(fn);
                });

                it('should register the correct middlewares 3', () => {
                    const fn = () => { };
                    const fn2 = () => { };
                    class Ctrl {
                        @run.decorator(fn, fn2)
                        public ctrlFunction(): void { }
                    }

                    const meta = new ControllerMetadata(Ctrl.prototype);

                    expect(meta.routes().length).toBe(1);

                    const route = meta.routes()[0];
                    expect(route.middlewares.length).toBe(2);
                    expect(route.middlewares[0]).toBe(fn);
                    expect(route.middlewares[1]).toBe(fn2);
                });

                it('should register the correct middlewares 4', () => {
                    const fn = () => { };
                    const fn2 = () => { };
                    class Ctrl {
                        @run.decorator('foobar', fn, fn2)
                        public ctrlFunction(): void { }
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
                        @run.decorator()
                        public ctrlFunction(): void { }
                    }

                    const meta = new ControllerMetadata(Ctrl.prototype);

                    expect(meta.routes().length).toBe(1);

                    const route = meta.routes()[0];
                    expect(route.httpMethod).toBe(run.method);
                });

                it('should contain the correct function', () => {
                    class Ctrl {
                        @run.decorator()
                        public ctrlFunction(): void { }
                    }

                    const meta = new ControllerMetadata(Ctrl.prototype);

                    expect(meta.routes().length).toBe(1);

                    const route = meta.routes()[0];
                    expect(route.routeFunction).toBe(Ctrl.prototype.ctrlFunction);
                });

            });

            describe(`Giuseppe${run.pascalName}Route class`, () => {

                it('should generate the correct id', () => {
                    class Ctrl {
                        @run.decorator('TheUrl')
                        public ctrlFunction(): void { }
                    }

                    const meta = new ControllerMetadata(Ctrl.prototype);

                    expect(meta.routes().length).toBe(1);

                    const route = meta.routes()[0];
                    const generated = route.createRoutes(meta, '', [])[0];

                    expect(generated.id).toBe(`${run.name}__TheUrl`);
                });

                it('should use the correct name', () => {
                    class Ctrl {
                        @run.decorator('TheUrl')
                        public yourFancyWordedFunction(): void { }
                    }

                    const meta = new ControllerMetadata(Ctrl.prototype);

                    expect(meta.routes().length).toBe(1);

                    const route = meta.routes()[0];
                    const generated = route.createRoutes(meta, '', [])[0];

                    expect(generated.name).toBe('yourFancyWordedFunction');
                });

                it('should generate the correct url', () => {
                    class Ctrl {
                        @run.decorator('TheUrl')
                        public ctrlFunction(): void { }
                    }

                    const meta = new ControllerMetadata(Ctrl.prototype);

                    expect(meta.routes().length).toBe(1);

                    const route = meta.routes()[0];
                    expect(route.createRoutes(meta, '', [])[0].url).toBe('TheUrl');
                });

                it('should generate the correct http method', () => {
                    class Ctrl {
                        @run.decorator('TheUrl')
                        public ctrlFunction(): void { }
                    }

                    const meta = new ControllerMetadata(Ctrl.prototype);

                    expect(meta.routes().length).toBe(1);

                    const route = meta.routes()[0];
                    const generated = route.createRoutes(meta, '', [])[0];

                    expect(generated.method).toBe(run.method);
                });

                it('should use the correct function', () => {
                    class Ctrl {
                        @run.decorator('TheUrl')
                        public ctrlFunction(): void { }
                    }

                    const meta = new ControllerMetadata(Ctrl.prototype);

                    expect(meta.routes().length).toBe(1);

                    const route = meta.routes()[0];
                    const generated = route.createRoutes(meta, '', [])[0];

                    expect(generated.function).toBe(Ctrl.prototype.ctrlFunction);
                });

                it('should add the correct middlewares', () => {
                    const fn = () => { };
                    class Ctrl {
                        @run.decorator(fn)
                        public ctrlFunction(): void { }
                    }

                    const meta = new ControllerMetadata(Ctrl.prototype);

                    expect(meta.routes().length).toBe(1);

                    const route = meta.routes()[0];
                    const generated = route.createRoutes(meta, '', [])[0];

                    expect(generated.middlewares[0]).toBe(fn);
                });

            });

            describe(`Giuseppe start`, () => {

                let giuseppe: Giuseppe;
                let spy: jest.SpyInstance<any>;

                beforeEach(() => {
                    giuseppe = new Giuseppe();
                    spy = jest.spyOn(giuseppe.router, run.name as any);
                });

                afterEach(() => {
                    spy.mockRestore();
                    (Giuseppe.registrar as any).controller = [];
                });

                it(`should be registered in the router as a ${run.name} method`, () => {
                    @Controller()
                    class Ctrl {
                        @run.decorator()
                        public ctrlFunction(): void { }
                    }

                    giuseppe.configureRouter();

                    expect(spy).toBeCalled();
                });

                it('should register the correct url', () => {
                    @Controller('api')
                    class Ctrl {
                        @run.decorator('foobar')
                        public ctrlFunction(): void { }
                    }

                    giuseppe.configureRouter();

                    expect(spy.mock.calls[0]).toContain('/api/foobar');
                });

                it('should register the correct middlewares', () => {
                    const fn = () => { };
                    const fn2 = () => { };
                    @Controller('api')
                    class Ctrl {
                        @run.decorator('foobar', fn, fn2)
                        public ctrlFunction(): void { }
                    }

                    giuseppe.configureRouter();

                    expect(spy.mock.calls[0]).toContain('/api/foobar');
                    expect(spy.mock.calls[0]).toContain(fn);
                    expect(spy.mock.calls[0]).toContain(fn2);
                });

                it('should throw when the decorator is not registered as a plugin', () => {
                    (giuseppe as any).plugins = [];

                    @Controller()
                    class Ctrl {
                        @run.decorator()
                        public ctrlFunction(): void { }
                    }

                    const fn = () => {
                        giuseppe.configureRouter();
                    };

                    expect(fn).toThrow(DefinitionNotRegisteredError);
                });

            });

        });

    }

});
