import {ErrorHandler} from '../../../errors/ErrorHandlerDecorator';
import {UrlParam, Body} from '../../../params/ParamDecorators';
import {Put, Post, Delete, Get} from '../../../routes/RouteDecorators';
import {RouteError} from '../../../errors/Errors';
import {Request, Response} from 'express';
import {Controller} from '../../../controllers/ControllerDecorator';
import {Demo} from '../models/Demo';

interface DbModel {
    id: number;
}

/**
 * Mocked database backend.
 */
class Database<T extends DbModel> {
    private objects: T[] = [];

    public all(): Promise<T[]> {
        return Promise.resolve(this.objects);
    }

    public findById(id: number): Promise<T|void> {
        let filtered = this.objects.filter(d => d.id === id);
        if (!filtered.length) {
            return Promise.reject(new Error('not found.'));
        }

        return Promise.resolve(filtered[0]);
    }

    public create(object: T): Promise<T> {
        this.objects.push(object);
        return Promise.resolve(object);
    }

    public update(id: number, object: T): Promise<void> {
        let filtered = this.objects.filter(d => d.id === id);
        if (!filtered.length) {
            return Promise.reject(new Error('not found.'));
        }
        this.objects.splice(this.objects.indexOf(filtered[0]), 1, object);
        return Promise.resolve();
    }

    public delete(id: number): Promise<void> {
        let filtered = this.objects.filter(d => d.id === id);
        if (!filtered.length) {
            return Promise.reject(new Error('not found.'));
        }
        this.objects.splice(this.objects.indexOf(filtered[0]), 1);
        return Promise.resolve();
    }
}

@Controller('demo')
export class DemoController {
    private db = new Database<Demo>();

    @Get()
    public getDemos(): Promise<Demo[]> {
        return this.db.all();
    }

    @Get(':id')
    public getDemo(@UrlParam('id') id: number): Promise<Demo> {
        return this.db.findById(id);
    }

    @Put()
    public createDemo(@Body({required: true}) body: Demo): Promise<Demo> {
        return this.db.create(body);
    }

    @Post(':id')
    public updateDemo(@UrlParam('id') id: number, @Body({required: true}) body: Demo): Promise<void> {
        return this.db.update(id, body);
    }

    @Delete(':id')
    public deleteDemo(@UrlParam('id') id: number): Promise<void> {
        return this.db.delete(id);
    }

    @ErrorHandler()
    public err(req: Request, res: Response, err: Error): void {
        this.errorLog(err);
        if (err instanceof RouteError && err.innerException.message === 'not found.') {
            res.status(404).end();
            return;
        }
        res.status(500).json({err}).end();
    }

    public errorLog(err: Error) {
        console.error(err);
    }
}