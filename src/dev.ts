import 'reflect-metadata';
import { Giuseppe } from './';
import { Controller } from './core/controller/GiuseppeApiController';
import { Query } from './core/parameters/Query';
import { Get } from './core/routes';
import * as express from 'express';
// tslint:disable

console.log('lol');

@Controller()
export class MyController {
    
    // @Get()
    // @Version()
    // public getAll(@Query('test') test: string): string {
    //     return test;
    // }
    
    @Get('foobar')
    public getAllFoobar(@Query('test') test: string): Promise<any> {
        return Promise.resolve({ test });
    }

    // @ErrorHandler(Error)
    // private handleErrs(req: express.Request, res: express.Response, err: any): void {
    //     console.log('lulz.');
    // }
}

console.log(Giuseppe.registrar);

const giusi = new Giuseppe();
const router = giusi.start();

const app = express();
app.use(router);

app.listen(8080);
