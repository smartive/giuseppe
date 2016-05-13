import 'reflect-metadata';
import {Controller, registerControllers, resetControllerRegistrations} from './ControllerDecorator';
import {Get, Route} from '../routes/RouteDecorators';
import chai = require('chai');
import sinon = require('sinon');
import sinonChai = require('sinon-chai');

chai.should();
chai.use(sinonChai);

class TestRouter {
    public routes: {[id: string]: Function[]} = {};

    public get(route: string, ...func: Function[]): void {
        this.routes[route] = func;
    }

    public put(route: string, ...func: Function[]): void {
        this.routes[route] = func;
    }

    public post(route: string, ...func: Function[]): void {
        this.routes[route] = func;
    }

    public delete(route: string, ...func: Function[]): void {
        this.routes[route] = func;
    }

    public head(route: string, ...func: Function[]): void {
        this.routes[route] = func;
    }

    public call(route: string): void {
        for (let f of this.routes[route]) {
            f({}, {
                json: () => {
                },
                send: () => {
                }
            }, () => {
            });
        }
    }
}

describe('Middleware', () => {

    afterEach(() => {
        resetControllerRegistrations();
    });

    it('should call controller middleware', () => {
        let spy = sinon.spy();

        @Controller('test', spy)
        class Ctrl {

            @Route()
            public func(): string {
                return '';
            }
        }

        let router = new TestRouter();

        registerControllers('', (router as any));

        router.call('/test');

        spy.should.be.calledOnce;
    });

    it('should call route middleware', () => {
        let spy = sinon.spy();

        @Controller('test')
        class Ctrl {

            @Get('', spy)
            public func(): string {
                return '';
            }
        }

        let router = new TestRouter();

        registerControllers('', (router as any));

        router.call('/test');

        spy.should.be.calledOnce;
    });

    it('should not call other route middleware', () => {
        let spy = sinon.spy();

        @Controller('test')
        class Ctrl {

            @Get('foo', spy)
            public func(): string {
                return '';
            }

            @Get('bar', spy)
            public func2(): string {
                return '';
            }
        }

        let router = new TestRouter();

        registerControllers('', (router as any));

        router.call('/test/foo');

        spy.should.be.calledOnce;
    });

    it('should correctly call multiple routed middlewares', () => {
        let spy = sinon.spy();

        @Controller('test')
        class Ctrl {

            @Get('foo', spy)
            public func(): string {
                return '';
            }

            @Get('bar', spy)
            public func2(): string {
                return '';
            }
        }

        let router = new TestRouter();

        registerControllers('', (router as any));

        router.call('/test/foo');
        router.call('/test/bar');

        spy.should.be.calledTwice;
    });

    it('should call controller and route middleware', () => {
        let spy = sinon.spy();

        @Controller('test', spy)
        class Ctrl {

            @Get('', spy)
            public func(): string {
                return '';
            }
        }

        let router = new TestRouter();

        registerControllers('', (router as any));

        router.call('/test');

        spy.should.be.calledTwice;
    });

    it('should call the middleware in the correct order', () => {
        let spy1 = sinon.spy(),
            spy2 = sinon.spy(),
            spy3 = sinon.spy();

        @Controller('test', spy1, spy2)
        class Ctrl {

            @Get('', spy3)
            public func(): string {
                return '';
            }
        }

        let router = new TestRouter();

        registerControllers('', (router as any));

        router.call('/test');

        spy1.should.be.calledOnce;
        spy2.should.be.calledOnce;
        spy3.should.be.calledOnce;

        spy1.should.be.calledBefore(spy2);
        spy2.should.be.calledBefore(spy3);
    });

});
