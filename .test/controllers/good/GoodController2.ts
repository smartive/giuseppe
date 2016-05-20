import {Controller} from '../../../controllers/ControllerDecorator';
import {Get, Post} from '../../../routes/RouteDecorators';

@Controller('2')
export class Ctrl2 {
    @Get('func1')
    public funcGet(): void {
    }

    @Post('func1')
    public funcPost(): void {
    }
}
