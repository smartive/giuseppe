import {Controller} from '../../../controllers/ControllerDecorator';
import {Get} from '../../../routes/RouteDecorators';

@Controller('wildcard')
class WildcardController {

    @Get('*')
    public catchAll(): string {
        return 'catch-all';
    }

    @Get('giuseppe/*')
    public oneWildcard(): string {
        return 'one-wildcard';
    }

    @Get('giuseppe/*/awesome/*')
    public twoWildcards(): string {
        return 'two-wildcards';
    }

    @Get('giuseppe/*/awesome/*/api/*/yeah')
    public threeWildcards(): string {
        return 'three-wildcards';
    }
}
