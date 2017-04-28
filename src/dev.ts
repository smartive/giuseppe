import 'reflect-metadata';
import { Query } from './core/parameters/Query';
import { Controller } from './core/controller/GiuseppeApiController';
import { Giuseppe } from './';
import { Get} from './core/routes';
// tslint:disable

console.log('lol');

@Controller()
export class MyController {
    
    //@Version()
    @Get()
    public getAll(@Query('test') test: string): string {
        return test;
    }
}

console.log(Giuseppe.registrar);
