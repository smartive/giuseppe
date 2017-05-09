// import 'reflect-metadata';
// import { Giuseppe } from '../../../src/';
// import { Controller } from '../../../src/core/controller/GiuseppeApiController';
// import { Delete } from '../../../src/core/routes';
// import { GiuseppeDeleteRoute } from '../../../src/core/routes/Delete';
// import { HttpMethod } from '../../../src/routes/RouteDefinition';
// import { ControllerMetadata } from '../../../src/utilities/ControllerMetadata';
// import chai = require('chai');
// import sinon = require('sinon');
// import sinonChai = require('sinon-chai');

// const should = chai.should();
// chai.use(sinonChai);

// describe('Core delete routes', () => {

//     describe('@Delete decorator', () => {

//         let giuseppe: Giuseppe;

//         beforeEach(() => {
//             giuseppe = new Giuseppe();
//         });

//         afterEach(() => {
//             (Giuseppe.registrar as any).controller = [];
//         });

//         it('should return Route decorator', () => {
//             Delete().should.be.a('function');
//         });

//         it('should register a route in a controller.', () => {
//             class Ctrl {
//                 @Delete()
//                 public delete(): void { }
//             }

//             const meta = new ControllerMetadata(Ctrl.prototype);

//             meta.routes().should.have.lengthOf(1);

//             const route = meta.routes()[0];
//             route.should.be.an.instanceof(GiuseppeDeleteRoute);
//         });

//         it('should use the correct route', () => {
//             class Ctrl {
//                 @Delete('foobar')
//                 public delete(): void { }
//             }

//             const meta = new ControllerMetadata(Ctrl.prototype);

//             meta.routes().should.have.lengthOf(1);

//             const route = meta.routes()[0];
//             route.route.should.equal('foobar');
//         });

//         it('should register the correct middlewares 1', () => {
//             class Ctrl {
//                 @Delete()
//                 public delete(): void { }
//             }

//             const meta = new ControllerMetadata(Ctrl.prototype);

//             meta.routes().should.have.lengthOf(1);

//             const route = meta.routes()[0];
//             route.middlewares.should.have.lengthOf(0);
//         });

//         it('should register the correct middlewares 2', () => {
//             const fn = () => { };
//             class Ctrl {
//                 @Delete(fn)
//                 public delete(): void { }
//             }

//             const meta = new ControllerMetadata(Ctrl.prototype);

//             meta.routes().should.have.lengthOf(1);

//             const route = meta.routes()[0];
//             route.middlewares.should.have.lengthOf(1);
//             route.middlewares[0].should.equal(fn);
//         });

//         it('should register the correct middlewares 3', () => {
//             const fn = () => { },
//                 fn2 = () => { };
//             class Ctrl {
//                 @Delete(fn, fn2)
//                 public delete(): void { }
//             }

//             const meta = new ControllerMetadata(Ctrl.prototype);

//             meta.routes().should.have.lengthOf(1);

//             const route = meta.routes()[0];
//             route.middlewares.should.have.lengthOf(2);
//             route.middlewares[0].should.equal(fn);
//             route.middlewares[1].should.equal(fn2);
//         });

//         it('should register the correct middlewares 4', () => {
//             const fn = () => { },
//                 fn2 = () => { };
//             class Ctrl {
//                 @Delete('foobar', fn, fn2)
//                 public delete(): void { }
//             }

//             const meta = new ControllerMetadata(Ctrl.prototype);

//             meta.routes().should.have.lengthOf(1);

//             const route = meta.routes()[0];
//             route.middlewares.should.have.lengthOf(2);
//             route.route.should.equal('foobar');
//             route.middlewares[0].should.equal(fn);
//             route.middlewares[1].should.equal(fn2);
//         });

//         it('should register the correct http method', () => {
//             class Ctrl {
//                 @Delete()
//                 public delete(): void { }
//             }

//             const meta = new ControllerMetadata(Ctrl.prototype);

//             meta.routes().should.have.lengthOf(1);

//             const route = meta.routes()[0];
//             route.httpMethod.should.equal(HttpMethod.delete);
//         });

//         it('should contain the correct function', () => {
//             class Ctrl {
//                 @Delete()
//                 public delete(): void { }
//             }

//             const meta = new ControllerMetadata(Ctrl.prototype);

//             meta.routes().should.have.lengthOf(1);

//             const route = meta.routes()[0];
//             route.routeFunction.should.equal(Ctrl.prototype.delete);
//         });

//     });

//     describe('GiuseppeDeleteRoute class', () => {

//         it('should generate the correct id', () => {
//             class Ctrl {
//                 @Delete('TheUrl')
//                 public delete(): void { }
//             }

//             const meta = new ControllerMetadata(Ctrl.prototype);

//             meta.routes().should.have.lengthOf(1);

//             const route = meta.routes()[0],
//                 generated = route.createRoutes(meta, '', [])[0];

//             generated.id.should.equal('Delete_TheUrl');
//         });

//         it('should use the correct name', () => {
//             class Ctrl {
//                 @Delete('TheUrl')
//                 public yourFancyWordedFunction(): void { }
//             }

//             const meta = new ControllerMetadata(Ctrl.prototype);

//             meta.routes().should.have.lengthOf(1);

//             const route = meta.routes()[0],
//                 generated = route.createRoutes(meta, '', [])[0];

//             generated.name.should.equal('yourFancyWordedFunction');
//         });

//         it('should generate the correct url', () => {
//             class Ctrl {
//                 @Delete('TheUrl')
//                 public delete(): void { }
//             }

//             const meta = new ControllerMetadata(Ctrl.prototype);

//             meta.routes().should.have.lengthOf(1);

//             const route = meta.routes()[0];
//             route.createRoutes(meta, '', [])[0].url.should.equal('TheUrl');
//         });

//         it('should generate the correct http method', () => {
//             class Ctrl {
//                 @Delete('TheUrl')
//                 public delete(): void { }
//             }

//             const meta = new ControllerMetadata(Ctrl.prototype);

//             meta.routes().should.have.lengthOf(1);

//             const route = meta.routes()[0],
//                 generated = route.createRoutes(meta, '', [])[0];

//             generated.method.should.equal(HttpMethod.delete);
//         });

//         it('should use the correct function', () => {
//             class Ctrl {
//                 @Delete('TheUrl')
//                 public delete(): void { }
//             }

//             const meta = new ControllerMetadata(Ctrl.prototype);

//             meta.routes().should.have.lengthOf(1);

//             const route = meta.routes()[0],
//                 generated = route.createRoutes(meta, '', [])[0];

//             generated.function.should.equal(Ctrl.prototype.delete);
//         });

//         it('should add the correct middlewares', () => {
//             const fn = () => { };
//             class Ctrl {
//                 @Delete(fn)
//                 public delete(): void { }
//             }

//             const meta = new ControllerMetadata(Ctrl.prototype);

//             meta.routes().should.have.lengthOf(1);

//             const route = meta.routes()[0],
//                 generated = route.createRoutes(meta, '', [])[0];

//             generated.middlewares[0].should.equal(fn);
//         });

//     });

//     describe('Giuseppe start', () => {

//         let giuseppe: Giuseppe,
//             stub: sinon.SinonStub;

//         beforeEach(() => {
//             giuseppe = new Giuseppe();
//             stub = sinon.stub(giuseppe.router, 'delete');
//         });

//         afterEach(() => {
//             stub.restore();
//             (Giuseppe.registrar as any).controller = [];
//         });

//         it('should be registered in the router as a Delete method', () => {
//             @Controller()    
//             class Ctrl {
//                 @Delete()
//                 public delete(): void { }
//             }

//             giuseppe.start();

//             stub.should.have.been.calledOnce;
//         });

//         it('should register the correct url', () => {
//             @Controller('api')
//             class Ctrl {
//                 @Delete('foobar')
//                 public delete(): void { }
//             }

//             giuseppe.start();

//             stub.should.have.been.calledWith('/api/foobar');
//         });

//         it('should register the correct middlewares', () => {
//             const fn = () => { },
//                 fn2 = () => { };
//             @Controller('api')
//             class Ctrl {
//                 @Delete('foobar', fn, fn2)
//                 public delete(): void { }
//             }

//             giuseppe.start();

//             stub.should.have.been.calledWith('/api/foobar', fn, fn2);
//         });

//     });

// });
