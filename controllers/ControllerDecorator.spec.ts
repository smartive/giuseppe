import 'reflect-metadata';
import {Controller} from './ControllerDecorator';
import {Registrar} from '../core/Registrar';
import {registerControllers} from '../';
import {Route} from '../routes/RouteDecorators';
import chai = require('chai');

chai.should();

class TestRouter {
    public routes: { [id: string]: Function } = {};

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

    public head(route: string, func: Function): void {
        this.routes[route] = func;
    }
}

describe('ControllerDecorator', () => {

    afterEach(() => {
        Registrar.resetControllerRegistrations();
    });

    it('should return Controller decorator', () => {
        Controller().should.be.a('function')
            .and.have.lengthOf(1);
    });

    it('should set the correct this context', () => {

        @Controller()
        class Ctrl {
            private test = 'foobar';

            @Route()
            public func(): string {
                this.should.be.an.instanceOf(Ctrl);
                this.test.should.equal('foobar');
                return this.test;
            }
        }

        let router = new TestRouter();

        registerControllers('', (router as any));

        router.routes['/'].apply(this, [{}, {
            json: () => {
            },
            send: () => {
            }
        }, null]);
    });

});
