import {Controller} from '../../../controllers/ControllerDecorator';
import {UrlParam, Body} from '../../../params/ParamDecorators';
import {Get, Put, Post, Delete, Head} from '../../../routes/RouteDecorators';

class ApiObject {
    constructor(public id: number, public name: string) {
    }
}

class ObjectNotFound extends Error {
    constructor(id: number) {
        super();
        this.message = `The object with id '${id}' was not found.`;
    }
}

@Controller('objects')
class ApiController {
    private objects: ApiObject[] = [];

    @Head(':id')
    public exists(@UrlParam('id') id: number): boolean {
        return this.objects.some(o => o.id === id);
    }

    @Get()
    public getAll(): Promise<ApiObject[]> {
        return Promise.resolve(this.objects);
    }

    @Get(':id')
    public get(@UrlParam('id') id: number): ApiObject {
        let obj = this.objects.find(o => o.id === id);
        if (!obj) {
            throw new ObjectNotFound(id);
        }
        return obj;
    }

    @Post()
    @Put()
    public create(@Body({required: true}) obj: ApiObject): ApiObject {
        let maxId = this.objects.map(o => o.id).sort().slice(-1)[0] || 0;
        maxId++;
        obj.id = maxId;
        this.objects.push(obj);
        return obj;
    }

    @Put(':id')
    public update(@UrlParam('id') id: number, @Body({required: true}) update: ApiObject): ApiObject {
        let obj = this.objects.find(o => o.id === id);
        if (!obj) {
            throw new ObjectNotFound(id);
        }
        obj.name = update.name;
        return obj;
    }

    @Delete(':id')
    public del(@UrlParam('id') id: number): void {
        let obj = this.objects.find(o => o.id === id);
        if (!obj) {
            throw new ObjectNotFound(id);
        }
        this.objects.splice(this.objects.indexOf(obj), 1);
    }
}
/*

 class SecureApiController {

 }

 class WildcardController {

 }

 class RootRouteController {

 }

 class EchoController {

 }
 */
