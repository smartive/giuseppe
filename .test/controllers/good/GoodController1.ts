import {Controller} from '../../../controllers/ControllerDecorator';
import {Get, Post} from '../../../routes/RouteDecorators';

@Controller('1')
class Ctrl {
    @Get('func1')
    public funcGet(): void {
    }

    @Post('func1')
    public funcPost(): void {
    }
}
