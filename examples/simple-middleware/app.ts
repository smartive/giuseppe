import {Controller, Get, registerControllers} from '../../index';
import {ErrorHandler} from '../../errors/ErrorHandlerDecorator';
import {UrlParam, Body} from '../../params/ParamDecorators';
import {Put, Post, Delete} from '../../routes/RouteDecorators';
import {Request, Response} from 'express';
import express = require('express');

class Demo {
    public id: number;

    constructor(value: any) {
        this.id = value.id;
    }
}

@Controller('demo', (req, res, next) => {
    console.log('controller middleware 1');
    next();
}, (req, res, next) => {
    console.log('controller middleware 2');
    next();
})
class DemoController {
    private demos: Demo[] = [];

    @Get()
    public getDemos(): Demo[] {
        return this.demos;
    }

    @Get(':id', (req, res, next) => {
        console.log('route middleware 1');
        next();
    }, (req, res, next) => {
        console.log('route middleware 2');
        next();
    })
    public getDemo(@UrlParam('id') id: number): Demo {
        let filtered = this.demos.filter(d => d.id === id);
        if (!filtered.length) {
            throw new Error('not found.');
        }

        return filtered[0];
    }

    @Put()
    public createDemo(@Body({required: true}) body: Demo): void {
        this.demos.push(body);
    }

    @Post(':id')
    public updateDemo(@UrlParam('id') id: number, @Body({required: true}) body: Demo): void {
        let filtered = this.demos.filter(d => d.id === id);
        if (!filtered.length) {
            throw new Error('not found.');
        }
        this.demos.splice(this.demos.indexOf(filtered[0]), 1, body);
    }

    @Delete(':id')
    public deleteDemo(@UrlParam('id') id: number): void {
        let filtered = this.demos.filter(d => d.id === id);
        if (!filtered.length) {
            throw new Error('not found.');
        }
        this.demos.splice(this.demos.indexOf(filtered[0]), 1);
    }

    @ErrorHandler()
    public err(req: Request, res: Response, err: Error): void {
        console.error(err);
        if (err.message === 'not found.') {
            res.status(404).end();
            return;
        }
        res.status(500).json({err}).end();
    }
}

let app = express();

app.use(require('body-parser').json());
app.use(registerControllers('/api'));

app.listen(8080, () => {
    console.log('Up and running on port 8080');
});
