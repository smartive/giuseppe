import 'reflect-metadata';
import { Giuseppe } from '../../../src/';
import { Get, GiuseppeGetRoute } from '../../../src/core/routes';
import { HttpMethod } from '../../../src/routes/RouteDefinition';
import { ControllerMetadata } from '../../../src/utilities/ControllerMetadata';
import chai = require('chai');
import sinonChai = require('sinon-chai');

const should = chai.should();
chai.use(sinonChai);

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
            Get().should.be.a('function');
        });

        it('should register a route in a controller.', () => {
            class Ctrl {
                @Get()
                public get(): void { }
            }

            const meta = new ControllerMetadata(Ctrl.prototype);

            meta.routes().should.have.lengthOf(1);

            const route = meta.routes()[0];
            route.should.be.an.instanceof(GiuseppeGetRoute);
        });

        it('should use the correct route', () => {
            class Ctrl {
                @Get('foobar')
                public get(): void { }
            }

            const meta = new ControllerMetadata(Ctrl.prototype);

            meta.routes().should.have.lengthOf(1);

            const route = meta.routes()[0];
            route.route.should.equal('foobar');
        });

        it('should register the correct middlewares 1', () => {
            class Ctrl {
                @Get()
                public get(): void { }
            }

            const meta = new ControllerMetadata(Ctrl.prototype);

            meta.routes().should.have.lengthOf(1);

            const route = meta.routes()[0];
            route.middlewares.should.have.lengthOf(0);
        });

        it('should register the correct middlewares 2', () => {
            const fn = () => { };
            class Ctrl {
                @Get(fn)
                public get(): void { }
            }

            const meta = new ControllerMetadata(Ctrl.prototype);

            meta.routes().should.have.lengthOf(1);

            const route = meta.routes()[0];
            route.middlewares.should.have.lengthOf(1);
            route.middlewares[0].should.equal(fn);
        });

        it('should register the correct middlewares 3', () => {
            const fn = () => { },
                fn2 = () => { };
            class Ctrl {
                @Get(fn, fn2)
                public get(): void { }
            }

            const meta = new ControllerMetadata(Ctrl.prototype);

            meta.routes().should.have.lengthOf(1);

            const route = meta.routes()[0];
            route.middlewares.should.have.lengthOf(2);
            route.middlewares[0].should.equal(fn);
            route.middlewares[1].should.equal(fn2);
        });

        it('should register the correct middlewares 4', () => {
            const fn = () => { },
                fn2 = () => { };
            class Ctrl {
                @Get('foobar', fn, fn2)
                public get(): void { }
            }

            const meta = new ControllerMetadata(Ctrl.prototype);

            meta.routes().should.have.lengthOf(1);

            const route = meta.routes()[0];
            route.middlewares.should.have.lengthOf(2);
            route.route.should.equal('foobar');
            route.middlewares[0].should.equal(fn);
            route.middlewares[1].should.equal(fn2);
        });

        it('should register the correct http method', () => {
            class Ctrl {
                @Get()
                public get(): void { }
            }

            const meta = new ControllerMetadata(Ctrl.prototype);

            meta.routes().should.have.lengthOf(1);

            const route = meta.routes()[0];
            route.httpMethod.should.equal(HttpMethod.get);
        });

        it('should contain the correct function', () => {
            class Ctrl {
                @Get()
                public get(): void { }
            }

            const meta = new ControllerMetadata(Ctrl.prototype);

            meta.routes().should.have.lengthOf(1);

            const route = meta.routes()[0];
            route.routeFunction.should.equal(Ctrl.prototype.get);
        });

    });

    describe('GiuseppeGetRoute class', () => {

        it('should generate the correct id', () => {
            class Ctrl {
                @Get('TheUrl')
                public get(): void { }
            }

            const meta = new ControllerMetadata(Ctrl.prototype);

            meta.routes().should.have.lengthOf(1);

            const route = meta.routes()[0],
                generated = route.createRoutes(meta, '', [])[0];

            generated.id.should.equal('get_TheUrl');
        });

        it('should use the correct name', () => {
            class Ctrl {
                @Get('TheUrl')
                public yourFancyWordedFunction(): void { }
            }

            const meta = new ControllerMetadata(Ctrl.prototype);

            meta.routes().should.have.lengthOf(1);

            const route = meta.routes()[0],
                generated = route.createRoutes(meta, '', [])[0];

            generated.name.should.equal('yourFancyWordedFunction');
        });

        it('should generate the correct url', () => {
            class Ctrl {
                @Get('TheUrl')
                public get(): void { }
            }

            const meta = new ControllerMetadata(Ctrl.prototype);

            meta.routes().should.have.lengthOf(1);

            const route = meta.routes()[0];
            route.createRoutes(meta, '', [])[0].url.should.equal('TheUrl');
        });

        it('should generate the correct http method', () => {
            class Ctrl {
                @Get('TheUrl')
                public get(): void { }
            }

            const meta = new ControllerMetadata(Ctrl.prototype);

            meta.routes().should.have.lengthOf(1);

            const route = meta.routes()[0],
                generated = route.createRoutes(meta, '', [])[0];

            generated.method.should.equal(HttpMethod.get);
        });

        it('should use the correct function', () => {
            class Ctrl {
                @Get('TheUrl')
                public get(): void { }
            }

            const meta = new ControllerMetadata(Ctrl.prototype);

            meta.routes().should.have.lengthOf(1);

            const route = meta.routes()[0],
                generated = route.createRoutes(meta, '', [])[0];

            generated.function.should.equal(Ctrl.prototype.get);
        });

        it('should add the correct middlewares', () => {
            const fn = () => { };
            class Ctrl {
                @Get(fn)
                public get(): void { }
            }

            const meta = new ControllerMetadata(Ctrl.prototype);

            meta.routes().should.have.lengthOf(1);

            const route = meta.routes()[0],
                generated = route.createRoutes(meta, '', [])[0];

            generated.middlewares[0].should.equal(fn);
        });

    });

});
