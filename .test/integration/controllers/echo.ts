import {Controller} from '../../../controllers/ControllerDecorator';
import {Get, Post} from '../../../routes/RouteDecorators';
import {UrlParam, Query, Body, Header} from '../../../params/ParamDecorators';

@Controller('echo')
class EchoController {

    @Post()
    public echo(@Query('query') query: string, @Body() body: any, @Header('header') header: string): any {
        return {query, body, header};
    }

    @Get(':id')
    public urlParam(@UrlParam('id') id: string): any {
        return {urlParam: id};
    }
}
