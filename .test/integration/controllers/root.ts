import {Controller} from '../../../controllers/ControllerDecorator';
import {Get} from '../../../routes/RouteDecorators';

@Controller('~/another')
class RootRouteController {

    @Get('root')
    public catchAll(): string {
        return 'another-root';
    }

    @Get('~/a-third')
    public oneWildcard(): string {
        return 'a-third-root';
    }
}
