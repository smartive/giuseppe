import 'reflect-metadata';
import {ControllerRegistration} from '../models/ControllerRegistration';
import {IoCSymbols} from './IoCSymbols';
import {ControllerLoaderOptions, Registrar} from './Registrar';
import {RouteHandler} from './RouteHandler';
import {Router} from 'express';
import {inject, injectable} from 'inversify';

/**
 * Default implementation of the registrar class.
 * Handles the registration of controllers.
 *
 * @class
 */
@injectable()
export class DefaultRegistrar implements Registrar {
    private controllers: ControllerRegistration[] = [];

    constructor(@inject(IoCSymbols.routeHandler) private routeHandler: RouteHandler) {
    }

    public registerControllersFromFolder({folderPath, root = process.cwd(), recursive = false, matchRegExp = /(.*)[.]js$/}: ControllerLoaderOptions,
        baseUrl: string = '',
        router: Router = Router()): Promise<Router> {
        let filewalker = require('filewalker'),
            path = require('path');

        return new Promise<Router>((resolve, reject) => {
            let controllersPath = path.join(root, folderPath);
            console.info(`Load controllers from path '${controllersPath}' ${recursive ? '' : 'non '}recursive.`);

            filewalker(controllersPath, {recursive, matchRegExp})
                .on('error', err => {
                    console.error(`Error happened during loading controllers from path: ${err}`);
                    reject(err);
                })
                .on('file', controller => {
                    try {
                        console.info(`Loading controller '${controller}'.`);
                        require(path.join(controllersPath, controller));
                    } catch (e) {
                        console.error(`Error happened during load of the '${controller}' controller: ${e}`);
                        reject(e);
                    }
                })
                .on('done', () => {
                    resolve(this.registerControllers(baseUrl, router));
                })
                .walk();
        });
    }

    public registerControllers(baseUrl: string = '', router: Router = Router()): Router {
        let url = baseUrl;
        if (url[url.length - 1] !== '/') {
            url += '/';
        }
        if (url[0] !== '/') {
            url = '/' + url;
        }

        for (let ctrl of this.controllers) {
            this.routeHandler.addRoutes(ctrl, url);
        }

        return this.routeHandler.registerRoutes(router);
    }

    public addController(controller: ControllerRegistration): void {
        this.controllers.push(controller);
    }

    public resetControllerRegistrations(): void {
        this.routeHandler.resetRoutes();
        this.controllers = [];
    }
}
