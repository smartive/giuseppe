import 'reflect-metadata';
import { Giuseppe } from './';
import { Controller } from './core/controller/GiuseppeApiController';
import { Version } from './core/modificators/Version';
import { Query } from './core/parameters/Query';
import { Get } from './core/routes';
// tslint:disable

console.log('lol');

@Controller()
export class MyController {
    
    @Get()
    @Version()
    public getAll(@Query('test') test: string): string {
        return test;
    }
}

console.log(Giuseppe.registrar);

const giusi = new Giuseppe();
giusi.start();
