import 'reflect-metadata';
import {Query, PARAMS_KEY, Param, ParamType, UrlParam, Body, Req, Res, Header, Cookie} from './ParamDecorators';
import {Route} from '../routes/RouteDecorators';
import {Controller, registerControllers, resetControllerRegistrations} from '../controllers/ControllerDecorator';
import {RequiredParameterNotProvidedError, ParameterParseError, ParamValidationFailedError} from '../errors/Errors';
import {ERRORHANDLER_KEY} from '../errors/ErrorHandlerDecorator';
import {isString, isNumber} from '../validators/Validators';
import {ControllerErrorHandler} from '../errors/ControllerErrorHandler';
import chai = require('chai');
import sinon = require('sinon');
import sinonChai = require('sinon-chai');

let should = chai.should();
chai.use(sinonChai);

class TestRouter {
    public routes: {[id: string]: Function} = {};

    public get(route: string, func: Function): void {
        this.routes[route] = func;
    }

    public put(route: string, func: Function): void {
        this.routes[route] = func;
    }

    public post(route: string, func: Function): void {
        this.routes[route] = func;
    }

    public delete(route: string, func: Function): void {
        this.routes[route] = func;
    }
}

describe('ParamDecorators', () => {

    afterEach(() => {
        resetControllerRegistrations();
    });

    describe('Query', () => {

        it('should return a decorator function', () => {
            Query('name').should.be.a('function').with.lengthOf(3);
        });

        it('should add a correct query param registration object to the route', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Query('name') name: string): any {
                    return {};
                }
            }

            let params: Param[] = Reflect.getOwnMetadata(PARAMS_KEY, Ctrl.prototype, 'func');

            params.should.be.an('array').with.lengthOf(1);

            let param: Param = params[0];

            param.paramType.should.equal(ParamType.Query);
            param.index.should.equal(0);
            param.name.should.equal('name');
            should.not.exist(param.options);
            param.type.should.equal(String);
        });

        it('should inject the correct variable', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Query('test') test: string): any {
                    test.should.equal('foobar');
                    return {};
                }
            }

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{query: {test: 'foobar'}}, {
                json: () => {
                }
            }, null]);
        });

        it('should inject the correct aliased variable', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Query('test', {alias: 't'}) test: string): any {
                    test.should.equal('foobar');
                    return {};
                }
            }

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{query: {t: 'foobar'}}, {
                json: () => {
                }
            }, null]);
        });

        it('should inject the correct multi aliased variable', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Query('test', {alias: ['t', 'te']}) test: string): any {
                    test.should.equal('foobar');
                    return {};
                }
            }

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{query: {te: 'foobar'}}, {
                json: () => {
                }
            }, null]);
        });

        it('should inject the correct variable if no alias hits', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Query('test', {alias: 't'}) test: string): any {
                    test.should.equal('foobar');
                    return {};
                }
            }

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{query: {test: 'foobar'}}, {
                json: () => {
                }
            }, null]);
        });

        it('should inject the correct aliased variable if alias and normal name is given', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Query('test', {alias: 't'}) test: string): any {
                    test.should.equal('foobar');
                    return {};
                }
            }

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{query: {t: 'foobar', test: 'notFoobar!'}}, {
                json: () => {
                }
            }, null]);
        });

        it('should parse the correct value', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Query('test') test: string): any {
                    test.should.be.a('string');
                    return {};
                }
            }

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{query: {test: 'foobar'}}, {
                json: () => {
                }
            }, null]);
        });

        it('should throw on non provided required parameter', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Query('test', {required: true}) test: string): any {
                    return {};
                }
            }

            let handler = new ControllerErrorHandler(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(ERRORHANDLER_KEY, handler, Ctrl);

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{query: {notProvided: 'foobar'}}, {
                json: () => {
                }
            }, null]);

            spy.should.be.calledOnce;
            spy.args[0][2].should.be.an.instanceOf(RequiredParameterNotProvidedError);
        });

        it('should inject undefined if param is not provided', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Query('test') test: string): any {
                    should.not.exist(test);
                    return {};
                }
            }

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{query: {}}, {
                json: () => {
                }
            }, null]);
        });

        it('should throw on parameter parsing error', () => {
            class Foobar {
                constructor(value: any) {
                    throw new Error();
                }
            }

            @Controller()
            class Ctrl {
                @Route()
                public func(@Query('test') test: Foobar): any {
                    return {};
                }
            }

            let handler = new ControllerErrorHandler(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(ERRORHANDLER_KEY, handler, Ctrl);

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{query: {test: 'foobar'}}, {
                json: () => {
                }
            }, null]);

            spy.should.be.calledOnce;
            spy.args[0][2].should.be.an.instanceOf(ParameterParseError);
        });

        it('should parse correctly with factory method', () => {
            class Foobar {
                public test: string;

                public static create(value: any): Foobar {
                    let f = new Foobar();
                    f.test = value;
                    return f;
                }
            }

            @Controller()
            class Ctrl {
                @Route()
                public func(@Query('test', {factory: raw => Foobar.create(raw)}) test: Foobar): any {
                    test.should.be.an.instanceOf(Foobar);
                    test.test.should.equals('foobar');
                    return {};
                }
            }

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{query: {test: 'foobar'}}, {
                json: () => {
                }
            }, null]);
        });

        it('should throw correctly with factory method', () => {
            class Foobar {
                public test: string;

                public static create(value: any): Foobar {
                    throw new Error();
                }
            }

            @Controller()
            class Ctrl {
                @Route()
                public func(@Query('test', {factory: raw => Foobar.create(raw)}) test: Foobar): any {
                    return {};
                }
            }

            let handler = new ControllerErrorHandler(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(ERRORHANDLER_KEY, handler, Ctrl);

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{query: {test: 'foobar'}}, {
                json: () => {
                }
            }, null]);

            spy.should.be.calledOnce;
        });

        it('should validate correctly', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Query('test', {validator: isString()}) test: string): any {
                    return {};
                }
            }

            let handler = new ControllerErrorHandler(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(ERRORHANDLER_KEY, handler, Ctrl);

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{query: {test: 'foobar'}}, {
                json: () => {
                }
            }, null]);

            spy.should.not.be.called;
        });

        it('should validate correctly with multiple validators', () => {
            let isNotEmpty = v => v.length > 0;

            @Controller()
            class Ctrl {
                @Route()
                public func(@Query('test', {validator: [isString(), isNotEmpty]}) test: string): any {
                    return {};
                }
            }

            let handler = new ControllerErrorHandler(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(ERRORHANDLER_KEY, handler, Ctrl);

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{query: {test: 'foobar'}}, {
                json: () => {
                }
            }, null]);

            spy.should.not.be.called;
        });

        it('should throw on validation error', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Query('test', {validator: isNumber()}) test: number): any {
                    return {};
                }
            }

            let handler = new ControllerErrorHandler(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(ERRORHANDLER_KEY, handler, Ctrl);

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{query: {test: 'foobar'}}, {
                json: () => {
                }
            }, null]);

            spy.should.be.calledOnce;
            spy.args[0][2].should.be.an.instanceOf(ParamValidationFailedError);
        });

        it('should throw if any validation fails', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Query('test', {validator: [isString(), isNumber()]}) test: string): any {
                    return {};
                }
            }

            let handler = new ControllerErrorHandler(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(ERRORHANDLER_KEY, handler, Ctrl);

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{query: {test: 'foobar'}}, {
                json: () => {
                }
            }, null]);

            spy.should.be.calledOnce;
            spy.args[0][2].should.be.an.instanceOf(ParamValidationFailedError);
        });

    });

    describe('UrlParam', () => {

        it('should return a decorator function', () => {
            UrlParam('name').should.be.a('function').with.lengthOf(3);
        });

        it('should add a correct url param registration object to the route', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@UrlParam('name') name: string): any {
                    return {};
                }
            }

            let params: Param[] = Reflect.getOwnMetadata(PARAMS_KEY, Ctrl.prototype, 'func');

            params.should.be.an('array').with.lengthOf(1);

            let param: Param = params[0];

            param.paramType.should.equal(ParamType.Url);
            param.index.should.equal(0);
            param.name.should.equal('name');
            param.options.should.deep.equal({required: true});
            param.type.should.equal(String);
        });

        it('should inject the correct variable', () => {
            @Controller()
            class Ctrl {
                @Route(':test')
                public func(@UrlParam('test') test: string): any {
                    test.should.equal('foobar');
                    return {};
                }
            }

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/:test'].apply(this, [{params: {test: 'foobar'}}, {
                json: () => {
                }
            }, null]);
        });

        it('should parse the correct value', () => {
            @Controller()
            class Ctrl {
                @Route(':test')
                public func(@UrlParam('test') test: number): any {
                    test.should.be.a('number');
                    return {};
                }
            }

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/:test'].apply(this, [{params: {test: '2'}}, {
                json: () => {
                }
            }, null]);
        });

        it('should throw on non provided url parameter', () => {
            @Controller()
            class Ctrl {
                @Route(':test')
                public func(@UrlParam('test') test: string): any {
                    return {};
                }
            }

            let handler = new ControllerErrorHandler(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(ERRORHANDLER_KEY, handler, Ctrl);

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/:test'].apply(this, [{params: {}}, {
                json: () => {
                }
            }, null]);

            spy.should.be.calledOnce;
            spy.args[0][2].should.be.an.instanceOf(RequiredParameterNotProvidedError);
        });

    });

    describe('Body', () => {

        it('should return a decorator function', () => {
            Body().should.be.a('function').with.lengthOf(3);
        });

        it('should add a correct body param registration object to the route', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Body() name: string): any {
                    return {};
                }
            }

            let params: Param[] = Reflect.getOwnMetadata(PARAMS_KEY, Ctrl.prototype, 'func');

            params.should.be.an('array').with.lengthOf(1);

            let param: Param = params[0];

            param.paramType.should.equal(ParamType.Body);
            param.index.should.equal(0);
            param.name.should.equal('body');
            should.not.exist(param.options);
            param.type.should.equal(String);
        });

        it('should inject the correct variable', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Body() test: string): any {
                    test.should.equal('foobar');
                    return {};
                }
            }

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{body: 'foobar'}, {
                json: () => {
                }
            }, null]);
        });

        it('should parse the correct value', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Body() test: string): any {
                    test.should.be.a('string');
                    return {};
                }
            }

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{body: 'foobar'}, {
                json: () => {
                }
            }, null]);
        });

        it('should throw on non provided required parameter', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Body({required: true}) test: string): any {
                    return {};
                }
            }

            let handler = new ControllerErrorHandler(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(ERRORHANDLER_KEY, handler, Ctrl);

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{}, {
                json: () => {
                }
            }, null]);

            spy.should.be.calledOnce;
            spy.args[0][2].should.be.an.instanceOf(RequiredParameterNotProvidedError);
        });

        it('should inject undefined if param is not provided', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Body() test: string): any {
                    should.not.exist(test);
                    return {};
                }
            }

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{}, {
                json: () => {
                }
            }, null]);
        });

        it('should throw on parameter parsing error', () => {
            class Foobar {
                constructor(value: any) {
                    throw new Error();
                }
            }

            @Controller()
            class Ctrl {
                @Route()
                public func(@Body() test: Foobar): any {
                    return {};
                }
            }

            let handler = new ControllerErrorHandler(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(ERRORHANDLER_KEY, handler, Ctrl);

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{body: {test: 'foobar'}}, {
                json: () => {
                }
            }, null]);

            spy.should.be.calledOnce;
            spy.args[0][2].should.be.an.instanceOf(ParameterParseError);
        });

        it('should parse correctly with factory method', () => {
            class Foobar {
                public test: string;

                public static create(value: any): Foobar {
                    let f = new Foobar();
                    f.test = value;
                    return f;
                }
            }

            @Controller()
            class Ctrl {
                @Route()
                public func(@Body({factory: raw => Foobar.create(raw)}) test: Foobar): any {
                    test.should.be.an.instanceOf(Foobar);
                    test.test.should.equals('foobar');
                    return {};
                }
            }

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{body: 'foobar'}, {
                json: () => {
                }
            }, null]);
        });

        it('should throw correctly with factory method', () => {
            class Foobar {
                public test: string;

                public static create(value: any): Foobar {
                    throw new Error();
                }
            }

            @Controller()
            class Ctrl {
                @Route()
                public func(@Body({factory: raw => Foobar.create(raw)}) test: Foobar): any {
                    return {};
                }
            }

            let handler = new ControllerErrorHandler(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(ERRORHANDLER_KEY, handler, Ctrl);

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{body: 'foobar'}, {
                json: () => {
                }
            }, null]);

            spy.should.be.calledOnce;
        });

        it('should validate correctly', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Body({validator: isString()}) test: string): any {
                    return {};
                }
            }

            let handler = new ControllerErrorHandler(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(ERRORHANDLER_KEY, handler, Ctrl);

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{body: 'foobar'}, {
                json: () => {
                }
            }, null]);

            spy.should.not.be.called;
        });

        it('should validate correctly with multiple validators', () => {
            let isNotEmpty = v => v.length > 0;

            @Controller()
            class Ctrl {
                @Route()
                public func(@Body({validator: [isString(), isNotEmpty]}) test: string): any {
                    return {};
                }
            }

            let handler = new ControllerErrorHandler(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(ERRORHANDLER_KEY, handler, Ctrl);

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{body: 'foobar'}, {
                json: () => {
                }
            }, null]);

            spy.should.not.be.called;
        });

        it('should throw on validation error', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Body({validator: isNumber()}) test: number): any {
                    return {};
                }
            }

            let handler = new ControllerErrorHandler(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(ERRORHANDLER_KEY, handler, Ctrl);

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{body: 'foobar'}, {
                json: () => {
                }
            }, null]);

            spy.should.be.calledOnce;
            spy.args[0][2].should.be.an.instanceOf(ParamValidationFailedError);
        });

        it('should throw if any validation fails', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Body({validator: [isString(), isNumber()]}) test: string): any {
                    return {};
                }
            }

            let handler = new ControllerErrorHandler(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(ERRORHANDLER_KEY, handler, Ctrl);

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{body: 'foobar'}, {
                json: () => {
                }
            }, null]);

            spy.should.be.calledOnce;
            spy.args[0][2].should.be.an.instanceOf(ParamValidationFailedError);
        });

    });

    describe('Request', () => {

        it('should return a decorator function', () => {
            Req().should.be.a('function').with.lengthOf(3);
        });

        it('should add a correct request param registration object to the route', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Req() request: any): any {
                    return {};
                }
            }

            let params: Param[] = Reflect.getOwnMetadata(PARAMS_KEY, Ctrl.prototype, 'func');

            params.should.be.an('array').with.lengthOf(1);

            let param: Param = params[0];

            param.paramType.should.equal(ParamType.Request);
            param.index.should.equal(0);
            param.name.should.equal('request');
            should.not.exist(param.options);
            param.type.should.equal(Object);
        });

        it('should inject the correct variable', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Req() test: any): any {
                    test.should.deep.equal({params: {test: 'foobar'}});
                    return {};
                }
            }

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{params: {test: 'foobar'}}, {
                json: () => {
                }
            }, null]);
        });

    });

    describe('Response', () => {

        it('should return a decorator function', () => {
            Res().should.be.a('function').with.lengthOf(3);
        });

        it('should add a correct request param registration object to the route', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Res() response: any): any {
                    return {};
                }
            }

            let params: Param[] = Reflect.getOwnMetadata(PARAMS_KEY, Ctrl.prototype, 'func');

            params.should.be.an('array').with.lengthOf(1);

            let param: Param = params[0];

            param.paramType.should.equal(ParamType.Response);
            param.index.should.equal(0);
            param.name.should.equal('response');
            should.not.exist(param.options);
            param.type.should.equal(Object);
        });

        it('should inject the correct variable', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Res() test: any): any {
                    test.foo.should.equal('bar');
                    return {};
                }
            }

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{}, {
                json: () => {
                },
                foo: 'bar'
            }, null]);
        });

    });

    describe('Header', () => {

        it('should return a decorator function', () => {
            Header('name').should.be.a('function').with.lengthOf(3);
        });

        it('should add a correct header param registration object to the route', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Header('name') name: string): any {
                    return {};
                }
            }

            let params: Param[] = Reflect.getOwnMetadata(PARAMS_KEY, Ctrl.prototype, 'func');

            params.should.be.an('array').with.lengthOf(1);

            let param: Param = params[0];

            param.paramType.should.equal(ParamType.Header);
            param.index.should.equal(0);
            param.name.should.equal('name');
            should.not.exist(param.options);
            param.type.should.equal(String);
        });

        it('should inject the correct variable', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Header('test') test: string): any {
                    test.should.equal('foobar');
                    return {};
                }
            }

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{
                headers: {test: 'foobar'},
                get: function (name) {
                    return this.headers[name];
                }
            }, {
                json: () => {
                }
            }, null]);
        });

        it('should parse the correct value', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Header('test') test: string): any {
                    test.should.be.a('string');
                    return {};
                }
            }

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{
                headers: {test: 'foobar'},
                get: function (name) {
                    return this.headers[name];
                }
            }, {
                json: () => {
                }
            }, null]);
        });

        it('should throw on non provided required parameter', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Header('test', {required: true}) test: string): any {
                    return {};
                }
            }

            let handler = new ControllerErrorHandler(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(ERRORHANDLER_KEY, handler, Ctrl);

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{
                headers: {notProvided: 'foobar'},
                get: function (name) {
                    return this.headers[name];
                }
            }, {
                json: () => {
                }
            }, null]);

            spy.should.be.calledOnce;
            spy.args[0][2].should.be.an.instanceOf(RequiredParameterNotProvidedError);
        });

        it('should inject undefined if param is not provided', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Header('test') test: string): any {
                    should.not.exist(test);
                    return {};
                }
            }

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{
                headers: {notProvided: 'foobar'},
                get: function (name) {
                    return this.headers[name];
                }
            }, {
                json: () => {
                }
            }, null]);
        });

        it('should validate correctly', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Header('test', {validator: isString()}) test: string): any {
                    return {};
                }
            }

            let handler = new ControllerErrorHandler(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(ERRORHANDLER_KEY, handler, Ctrl);

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{
                headers: {test: 'foobar'},
                get: function (name) {
                    return this.headers[name];
                }
            }, {
                json: () => {
                }
            }, null]);

            spy.should.not.be.called;
        });


        it('should validate correctly with multiple validators', () => {
            let isNotEmpty = v => v.length > 0;

            @Controller()
            class Ctrl {
                @Route()
                public func(@Header('test', {validator: [isString(), isNotEmpty]}) test: string): any {
                    return {};
                }
            }

            let handler = new ControllerErrorHandler(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(ERRORHANDLER_KEY, handler, Ctrl);

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{
                headers: {test: 'foobar'},
                get: function (name) {
                    return this.headers[name];
                }
            }, {
                json: () => {
                }
            }, null]);

            spy.should.not.be.called;
        });

        it('should throw on validation error', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Header('test', {validator: isNumber()}) test: number): any {
                    return {};
                }
            }

            let handler = new ControllerErrorHandler(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(ERRORHANDLER_KEY, handler, Ctrl);

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{
                headers: {test: 'foobar'},
                get: function (name) {
                    return this.headers[name];
                }
            }, {
                json: () => {
                }
            }, null]);

            spy.should.be.calledOnce;
            spy.args[0][2].should.be.an.instanceOf(ParamValidationFailedError);
        });

        it('should throw if any validation fails', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Header('test', {validator: [isString(), isNumber()]}) test: string): any {
                    return {};
                }
            }

            let handler = new ControllerErrorHandler(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(ERRORHANDLER_KEY, handler, Ctrl);

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{
                headers: {test: 'foobar'},
                get: function (name) {
                    return this.headers[name];
                }
            }, {
                json: () => {
                }
            }, null]);

            spy.should.be.calledOnce;
            spy.args[0][2].should.be.an.instanceOf(ParamValidationFailedError);
        });

    });

    describe('Cookie', () => {

        it('should return a decorator function', () => {
            Cookie('name').should.be.a('function').with.lengthOf(3);
        });

        it('should add a correct cookie param registration object to the route', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Cookie('name') name: string): any {
                    return {};
                }
            }

            let params: Param[] = Reflect.getOwnMetadata(PARAMS_KEY, Ctrl.prototype, 'func');

            params.should.be.an('array').with.lengthOf(1);

            let param: Param = params[0];

            param.paramType.should.equal(ParamType.Cookie);
            param.index.should.equal(0);
            param.name.should.equal('name');
            should.not.exist(param.options);
            param.type.should.equal(String);
        });

        it('should inject the correct variable', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Cookie('test') test: string): any {
                    test.should.equal('foobar');
                    return {};
                }
            }

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{
                headers: {cookie: 'test=foobar'},
                get: function (name) {
                    return this.headers[name];
                }
            }, {
                json: () => {
                }
            }, null]);
        });

        it('should parse the correct value', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Cookie('test') test: string): any {
                    test.should.be.a('string');
                    return {};
                }
            }

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{
                headers: {cookie: 'test=foobar'},
                get: function (name) {
                    return this.headers[name];
                }
            }, {
                json: () => {
                }
            }, null]);
        });

        it('should throw on non provided required parameter', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Cookie('test', {required: true}) test: string): any {
                    return {};
                }
            }

            let handler = new ControllerErrorHandler(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(ERRORHANDLER_KEY, handler, Ctrl);

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{
                headers: {cookie: 'notProvided=foobar'},
                get: function (name) {
                    return this.headers[name];
                }
            }, {
                json: () => {
                }
            }, null]);

            spy.should.be.calledOnce;
            spy.args[0][2].should.be.an.instanceOf(RequiredParameterNotProvidedError);
        });

        it('should inject undefined if param is not provided', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Cookie('test') test: string): any {
                    should.not.exist(test);
                    return {};
                }
            }

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{
                headers: {cookie: 'foobar=foobar'},
                get: function (name) {
                    return this.headers[name];
                }
            }, {
                json: () => {
                }
            }, null]);
        });

        it('should throw on parameter parsing error', () => {
            class Foobar {
                constructor(value: any) {
                    throw new Error();
                }
            }

            @Controller()
            class Ctrl {
                @Route()
                public func(@Cookie('test') test: Foobar): any {
                    return {};
                }
            }

            let handler = new ControllerErrorHandler(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(ERRORHANDLER_KEY, handler, Ctrl);

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{
                headers: {cookie: 'test=foobar'},
                get: function (name) {
                    return this.headers[name];
                }
            }, {
                json: () => {
                }
            }, null]);

            spy.should.be.calledOnce;
            spy.args[0][2].should.be.an.instanceOf(ParameterParseError);
        });

        it('should parse correctly with factory method', () => {
            class Foobar {
                public test: string;

                public static create(value: any): Foobar {
                    let f = new Foobar();
                    f.test = value;
                    return f;
                }
            }

            @Controller()
            class Ctrl {
                @Route()
                public func(@Cookie('test', {factory: raw => Foobar.create(raw)}) test: Foobar): any {
                    test.should.be.an.instanceOf(Foobar);
                    test.test.should.equals('foobar');
                    return {};
                }
            }

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{
                headers: {cookie: 'test=foobar'},
                get: function (name) {
                    return this.headers[name];
                }
            }, {
                json: () => {
                }
            }, null]);
        });

        it('should throw correctly with factory method', () => {
            class Foobar {
                public test: string;

                public static create(value: any): Foobar {
                    throw new Error();
                }
            }

            @Controller()
            class Ctrl {
                @Route()
                public func(@Cookie('test', {factory: raw => Foobar.create(raw)}) test: Foobar): any {
                    return {};
                }
            }

            let handler = new ControllerErrorHandler(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(ERRORHANDLER_KEY, handler, Ctrl);

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{
                headers: {cookie: 'test=foobar'},
                get: function (name) {
                    return this.headers[name];
                }
            }, {
                json: () => {
                }
            }, null]);

            spy.should.be.calledOnce;
        });

        it('should validate correctly', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Cookie('test', {validator: isString()}) test: string): any {
                    return {};
                }
            }

            let handler = new ControllerErrorHandler(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(ERRORHANDLER_KEY, handler, Ctrl);

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{
                headers: {cookie: 'test=foobar'},
                get: function (name) {
                    return this.headers[name];
                }
            }, {
                json: () => {
                }
            }, null]);

            spy.should.not.be.called;
        });

        it('should validate correctly with multiple validators', () => {
            let isNotEmpty = v => v.length > 0;

            @Controller()
            class Ctrl {
                @Route()
                public func(@Cookie('test', {validator: [isString(), isNotEmpty]}) test: string): any {
                    return {};
                }
            }

            let handler = new ControllerErrorHandler(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(ERRORHANDLER_KEY, handler, Ctrl);

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{
                headers: {cookie: 'test=foobar'},
                get: function (name) {
                    return this.headers[name];
                }
            }, {
                json: () => {
                }
            }, null]);

            spy.should.not.be.called;
        });

        it('should throw on validation error', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Cookie('test', {validator: isNumber()}) test: number): any {
                    return {};
                }
            }

            let handler = new ControllerErrorHandler(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(ERRORHANDLER_KEY, handler, Ctrl);

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{
                headers: {cookie: 'test=foobar'},
                get: function (name) {
                    return this.headers[name];
                }
            }, {
                json: () => {
                }
            }, null]);

            spy.should.be.calledOnce;
            spy.args[0][2].should.be.an.instanceOf(ParamValidationFailedError);
        });

        it('should throw if any validation fails', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Cookie('test', {validator: [isString(), isNumber()]}) test: string): any {
                    return {};
                }
            }

            let handler = new ControllerErrorHandler(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(ERRORHANDLER_KEY, handler, Ctrl);

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{
                headers: {cookie: 'test=foobar'},
                get: function (name) {
                    return this.headers[name];
                }
            }, {
                json: () => {
                }
            }, null]);

            spy.should.be.calledOnce;
            spy.args[0][2].should.be.an.instanceOf(ParamValidationFailedError);
        });

    });

    describe('Decorated method', () => {

        it('should be called with correct type in param', () => {
            const arr = [1, 2, 3];

            @Controller()
            class Ctrl {
                @Route()
                public func(@Query('test') test: number[]): any {
                    test.should.equal(arr);
                    return {};
                }
            }

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{query: {test: arr}}, {
                json: () => {
                }
            }, null]);
        });

    });

});
