import { Query, UrlParam } from '../../../params/ParamDecorators';
import { Get } from '../../../routes/RouteDecorators';
import { Controller } from '../../../controllers/ControllerDecorator';
import { Version } from '../../../versioning/VersionDecorator';

@Controller('versioning/ctrl/v1')
@Version({ from: 1 })
class ControllerVersion {
    @Get()
    public simpleGet(): string {
        return 'found-ctrl';
    }
}

@Controller('versioning/route/v1')
class RouteVersion {
    @Get()
    @Version({ from: 1 })
    public simpleGet(): string {
        return 'found-route';
    }
}

@Controller('versioning/ctrls')
@Version({ until: 1 })
class ControllersVersion1 {
    @Get()
    public simpleGet(): string {
        return 'found-ctrl-v1';
    }
}

@Controller('versioning/ctrls')
@Version({ from: 2 })
class ControllersVersion2 {
    @Get()
    public simpleGet(): string {
        return 'found-ctrl-v2';
    }
}

@Controller('versioning/routes')
class RoutesVersion {
    @Get()
    @Version({ until: 1 })
    public v1(): string {
        return 'found-route-v1';
    }

    @Get()
    @Version({ from: 2 })
    public v2(): string {
        return 'found-route-v2';
    }
}

@Controller('versioning/ctrl/nonversioned')
class NonVersionedController {
    @Get()
    public get(): string {
        return 'found-non-versioned-ctrl';
    }
}

@Controller('versioning/route/nonversioned')
class NonVersionedRoute {
    @Get()
    public get(): string {
        return 'found-non-versioned-route';
    }
}

@Controller('versioning/route-ctrl')
@Version({ from: 2, until: 2 })
class CtrlRouteVersion {
    @Get()
    public v2(): string {
        return 'found-ctrl-route-v2';
    }

    @Get()
    @Version({ from: 3 })
    public v3(): string {
        return 'found-ctrl-route-v3';
    }
}

@Controller('versioning/query-param')
@Version({ from: 1 })
class QueryParam {
    @Get()
    public get( @Query('qParam') qParam: string): any {
        return { qParam };
    }
}

@Controller('versioning/url-param/:hooray')
@Version({ from: 1 })
class UrlParamCtrl {
    @Get()
    public get( @UrlParam('hooray') param: string): any {
        return { param };
    }
}

@Controller('versioning/404')
class FourOFour {
    @Get()
    @Version({ from: 1, until: 1 })
    public v1(): string {
        return 'found';
    }

    @Get()
    @Version({ from: 2, until: 2 })
    public v2(): string {
        return 'found';
    }

    @Get()
    @Version({ from: 3, until: 3 })
    public v3(): string {
        return 'found';
    }
}

@Controller('versioning/middleware')
class Middleware {
    @Get('', (req, res, next) => {
        res.set('X-Test', 'v1');
        next();
    })
    @Version({ from: 1, until: 1 })
    public v1(): string {
        return 'found-v1';
    }

    @Get('', (req, res, next) => {
        res.set('X-Test', 'v2');
        next();
    })
    @Version({ from: 2, until: 2 })
    public v2(): string {
        return 'found-v2';
    }
}
