import {Controller} from '../../../controllers/ControllerDecorator';
import {Get, Post} from '../../../routes/RouteDecorators';

@Controller('secure', (req, res, next) => {
    if (req.query.user !== 'giuseppe' || req.query.pass !== 'secure') {
        return res.status(401).end();
    }
    next();
})
class MiddlewareApiController {

    @Get()
    public get(): any {
        return {
            secure: 'object'
        };
    }

    @Post('', (req, res, next) => {
        if (!req.query.admin) {
            return res.status(403).end();
        }
        next();
    })
    public anotherMiddleware(): any {
        return {
            secure: 'object',
            admin: true
        };
    }
}
