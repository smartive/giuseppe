// import 'reflect-metadata';
// import { Giuseppe, GiuseppePlugin } from '../src';
// import { ControllerDecorator } from '../src/controller/ControllerDecorator';
// import { DuplicatePluginError } from '../src/errors';
// import { ReturnTypeHandler } from '../src/routes/ReturnTypeHandler';
// import { RouteDecorator } from '../src/routes/RouteDecorator';
// import { RouteModificator } from '../src/routes/RouteModificator';
// import chai = require('chai');
// import sinon = require('sinon');
// import sinonChai = require('sinon-chai');

// chai.should();
// chai.use(sinonChai);

// describe('GiuseppeCorePlugin', () => {

//     describe('registerPlugin', () => {

//         let giuseppe: Giuseppe;

//         beforeEach(() => {
//             giuseppe = new Giuseppe();
//         });

//         it('should register a plugin in giuseppe.');

//         it('should throw when a duplicate plugin is registered.', () => {
//             class Plugin implements GiuseppePlugin {
//                 public readonly name: string = 'Plugin';
//                 public readonly returnTypeHandler: ReturnTypeHandler[] | null;
//                 public readonly controllerDecorators: ControllerDecorator[] = [];
//                 public readonly routeDecorators: RouteDecorator[] | null;
//                 public readonly routeModificators: RouteModificator[] | null;
//                 public readonly parameterDecorators: ParameterDecorator[] | null;
//                 public initialize(): void {
//                 }
//             }

//             const fn = () => giuseppe.registerPlugin(new Plugin());

//             fn();
//             fn.should.throw(DuplicatePluginError);
//         });

//         it('should add a controller decorator (controller creator) in giuseppe.');

//     });

// });
