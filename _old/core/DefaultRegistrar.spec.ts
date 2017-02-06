import 'reflect-metadata';
import {registerControllersFromFolder} from '../';
import {Controller} from '../controllers/ControllerDecorator';
import {Registrar} from '../core/Registrar';
import {Get, ROUTES_KEY} from '../routes/RouteDecorators';
import {IocContainer} from './IoC';
import {IoCSymbols} from './IoCSymbols';
import chai = require('chai');
import {Router} from 'express';
import {SinonSpy} from 'sinon';
import sinon = require('sinon');
import sinonChai = require('sinon-chai');

chai.should();
chai.use(sinonChai);

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

describe('DefaultRegistrar', () => {

    afterEach(() => {
        IocContainer.get<Registrar>(IoCSymbols.registrar).resetControllerRegistrations();
    });

    let router: Router;

    beforeEach(() => {
        router = Router();
        sinon.stub(router, 'get');
        sinon.stub(router, 'put');
        sinon.stub(router, 'post');
        sinon.stub(router, 'delete');
        sinon.stub(router, 'head');
    });

    describe('registerController', () => {

        it('should add a controller to its cache', () => {
            @Controller()
            class Ctrl {
                @Get()
                public func(): void {
                }
            }

            let registrar = IocContainer.get<Registrar>(IoCSymbols.registrar);

            (registrar as any).controllers.should.be.an('array').with.lengthOf(1);
        });

    });

    describe('registerControllersFromFolder', () => {

        it('should register 2 controller with 2 function correctly', done => {
            registerControllersFromFolder({ folderPath: './build/_test/controllers/good' }, '', router)
                .then(() => {
                    let Ctrl = require('../_test/controllers/good/GoodController1').Ctrl,
                        Ctrl2 = require('../_test/controllers/good/GoodController2').Ctrl2;

                    let routes1 = Reflect.getOwnMetadata(ROUTES_KEY, Ctrl);
                    routes1.should.be.an('array').with.lengthOf(2);

                    let routes2 = Reflect.getOwnMetadata(ROUTES_KEY, Ctrl2);
                    routes2.should.be.an('array').with.lengthOf(2);

                    router.get.should.be.calledTwice;
                    router.put.should.not.be.called;
                    router.post.should.be.calledTwice;
                    router.delete.should.not.be.called;

                    (router.get as SinonSpy).firstCall.should.be.calledWith('/1/func1');
                    (router.get as SinonSpy).secondCall.should.be.calledWith('/2/func1');
                    (router.post as SinonSpy).firstCall.should.be.calledWith('/1/func1');
                    (router.post as SinonSpy).secondCall.should.be.calledWith('/2/func1');

                    done();
                })
                .catch(err => {
                    done(err);
                });
        });

        it('should reject promise when error happens in process', done => {
            registerControllersFromFolder({ folderPath: './build/_test/controllers/bad' }, '', router)
                .then(() => {
                    done(new Error('did not throw!'));
                })
                .catch(err => {
                    done();
                });
        });

    });

});
