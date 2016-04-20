import 'reflect-metadata';
import {Query, paramsKey, Param, ParamType, UrlParam, Body, Req, Res} from './ParamDecorators';
import {Route} from '../routes/RouteDecorators';
import {Controller} from '../controllers/ControllerDecorator';
import {RequiredParameterNotProvidedError, ParameterParseError, ParamValidationFailedError} from '../errors/Errors';
import {ErrorHandlerManager, errorHandlerKey} from '../errors/ErrorHandlerDecorator';
import {IsStringValidator, IsNumberValidator} from '../validators/Validators';
import chai = require('chai');
import sinon = require('sinon');
import sinonChai = require('sinon-chai');

let should = chai.should();
chai.use(sinonChai);

describe('ParamDecorators', () => {

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

            let params: Param[] = Reflect.getOwnMetadata(paramsKey, Ctrl.prototype, 'func');

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

            let ctrl: any = new Ctrl();
            ctrl.func({query: {test: 'foobar'}}, {
                json: () => {
                }
            }, null);
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

            let ctrl: any = new Ctrl();
            ctrl.func({query: {test: 'foobar'}}, {
                json: () => {
                }
            }, null);
        });

        it('should throw on non provided required parameter', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Query('test', {required: true}) test: string): any {
                    return {};
                }
            }

            let handler = new ErrorHandlerManager(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(errorHandlerKey, handler, Ctrl);

            let ctrl: any = new Ctrl();

            ctrl.func({query: {notProvided: 'foobar'}}, {}, null);

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

            let ctrl: any = new Ctrl();

            ctrl.func({query: {}}, {
                json: () => {
                }
            }, null);
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

            let handler = new ErrorHandlerManager(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(errorHandlerKey, handler, Ctrl);

            let ctrl: any = new Ctrl();

            ctrl.func({query: {test: 'foobar'}}, {}, null);

            spy.should.be.calledOnce;
            spy.args[0][2].should.be.an.instanceOf(ParameterParseError);
        });

        it('should validate correctly', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Query('test', {validator: IsStringValidator}) test: string): any {
                    return {};
                }
            }

            let handler = new ErrorHandlerManager(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(errorHandlerKey, handler, Ctrl);

            let ctrl: any = new Ctrl();

            ctrl.func({query: {test: 'foobar'}}, {
                json: () => {
                }
            }, null);

            spy.should.not.be.called;
        });

        it('should throw on validation error', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Query('test', {validator: IsNumberValidator}) test: number): any {
                    return {};
                }
            }

            let handler = new ErrorHandlerManager(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(errorHandlerKey, handler, Ctrl);

            let ctrl: any = new Ctrl();

            ctrl.func({query: {test: 'foobar'}}, {}, null);

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

            let params: Param[] = Reflect.getOwnMetadata(paramsKey, Ctrl.prototype, 'func');

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

            let ctrl: any = new Ctrl();
            ctrl.func({params: {test: 'foobar'}}, {
                json: () => {
                }
            }, null);
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

            let ctrl: any = new Ctrl();
            ctrl.func({params: {test: '2'}}, {
                json: () => {
                }
            }, null);
        });

        it('should throw on non provided url parameter', () => {
            @Controller()
            class Ctrl {
                @Route(':test')
                public func(@UrlParam('test') test: string): any {
                    return {};
                }
            }

            let handler = new ErrorHandlerManager(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(errorHandlerKey, handler, Ctrl);

            let ctrl: any = new Ctrl();

            ctrl.func({params: {}}, {}, null);

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

            let params: Param[] = Reflect.getOwnMetadata(paramsKey, Ctrl.prototype, 'func');

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

            let ctrl: any = new Ctrl();
            ctrl.func({body: 'foobar'}, {
                json: () => {
                }
            }, null);
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

            let ctrl: any = new Ctrl();
            ctrl.func({body: 'foobar'}, {
                json: () => {
                }
            }, null);
        });

        it('should throw on non provided required parameter', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Body({required: true}) test: string): any {
                    return {};
                }
            }

            let handler = new ErrorHandlerManager(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(errorHandlerKey, handler, Ctrl);

            let ctrl: any = new Ctrl();

            ctrl.func({query: {notProvided: 'foobar'}}, {}, null);

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

            let ctrl: any = new Ctrl();

            ctrl.func({query: {}}, {
                json: () => {
                }
            }, null);
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

            let handler = new ErrorHandlerManager(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(errorHandlerKey, handler, Ctrl);

            let ctrl: any = new Ctrl();

            ctrl.func({body: {test: 'foobar'}}, {}, null);

            spy.should.be.calledOnce;
            spy.args[0][2].should.be.an.instanceOf(ParameterParseError);
        });

        it('should validate correctly', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Body({validator: IsStringValidator}) test: string): any {
                    return {};
                }
            }

            let handler = new ErrorHandlerManager(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(errorHandlerKey, handler, Ctrl);

            let ctrl: any = new Ctrl();

            ctrl.func({body: 'foobar'}, {
                json: () => {
                }
            }, null);

            spy.should.not.be.called;
        });

        it('should throw on validation error', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(@Body({validator: IsNumberValidator}) test: number): any {
                    return {};
                }
            }

            let handler = new ErrorHandlerManager(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(errorHandlerKey, handler, Ctrl);

            let ctrl: any = new Ctrl();

            ctrl.func({body: 'foobar'}, {}, null);

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

            let params: Param[] = Reflect.getOwnMetadata(paramsKey, Ctrl.prototype, 'func');

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

            let ctrl: any = new Ctrl();
            ctrl.func({params: {test: 'foobar'}}, {
                json: () => {
                }
            }, null);
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

            let params: Param[] = Reflect.getOwnMetadata(paramsKey, Ctrl.prototype, 'func');

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

            let ctrl: any = new Ctrl();
            ctrl.func({params: {test: 'foobar'}}, {
                json: () => {
                },
                foo: 'bar'
            }, null);
        });

    });

});