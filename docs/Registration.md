---
layout: default
title: giuseppe - registration
---
# Registration of controllers

This part is actually very easy and straight forward. All controller classes that are
decorated with the `@Controller` annotation, will be registered with an express router.
If you code your class and use `@Get`, `@Post`, ... but you forget to annotate the controller,
nothing is gonna happen.

## Route ordering

To support wildcard routes, giuseppe does order the routes, before they are
registered with express. Since express does have a first-match strategy when
it's routers are matching the routes of the request, giuseppe orders them.
With this ordering, the more specific routes (i.e. with more url segments
and less wildcard characters) are registered first and are matched with express.

It's possible to make a `catch all` route with just a `*` character to support
a single page application for example.

```typescript
@Controller('*')
class StaticFileController {
    @Get()
    public getFile(@Req() req: Request, @Res() res: Response): void {
        /* get the file path from the requests url */
        res.sendFile(/* filepath */);
    }
}

@Controller('api/demo')
class ApiController {
    /* ... */
}
```

In the example above, the routes to `api/demo` are routed correctly, even
if the static file controller is (technically) loaded first.

## Root routes

If you want to overwrite the previous declared route segments, it is possible
with the special character `~`. With this as the starting character of any
controller or method route decorator, all the route segments are ignored
and the route is registered from the root of the application.

To clarify the behaviour, have a look at the following example.

```typescript
@Controller('~/*')          // <-- this gets registered as /*
class StaticFileController {
    @Get()
    public getFile(@Req() req: Request, @Res() res: Response): void {
        /* get the file path from the requests url */
        res.sendFile(/* filepath */);
    }
}

@Controller('demo')        // <-- this gets registered as /api/demo...
class ApiController {
    /* ... */
}

app.use(registerControllers('api'));
```

You can even use the `~` character in a `@Get` or any other route decorator.

## Registration function

### Register loaded controllers

```typescript
import {registerControllers} from 'giuseppe';

/* init express app and more stuff */

app.use(registerControllers('baseUrl'));

/* start express server */
```

The function returns an express router. If no router is provided to the function (second
parameter), it instantiates it's own router and returns it at the end. The first parameter
defines the base url for the returned router.

### Register controllers from a folder

```typescript
import {registerControllersFromFolder} from 'giuseppe';

/* init express app and more stuff */

registerControllersFromFolder({folderPath: './controllers'})
    .then(router => {
        app.use(router);
        /* start express server */
    })
    .catch(err => {
        /* error happened during loading and registering */
    });
```

The function returns a promise that resolves with the configured express router, or
rejects, when an error happens during the process. All found files that matches
the configurable `RegExp` are loaded with the standard `require(...)` function.
You can change the regular expression to load your custom files. 

Basically this function accepts the configuration object for the loading process
and the normal parameters for the register function (i.e. `baseUrl` and an
instance of an express router).

The configuration object is defined as such:

```typescript
{folderPath: string, root?: string, recursive?: boolean, matchRegExp?: RegExp}
```

| Option      | Description                                                           |
| ----------- | --------------------------------------------------------------------- |
| folderPath  | The directory, the function searches for files.                       |
| root        | The root directory of the app, which is combined with the folderPath. |
| recursive   | Defines if the function should search recursively.                    |
| matchRegExp | The regular expression that must match the filename.                  |
{: class="table"}

### Custom router and middleware

If you need to use a custom router - maybe you have some middleware to run, or you wan't
to configure the router by yourself - you can use the second parameter of the
registration function to pass an already instantiated router to giuseppe.

```typescript
import {registerControllers} from 'giuseppe';

/* init express app and more stuff */

let router = express.Router();

router.use(/* my fancy middleware */);

app.use(registerControllers('baseUrl', router));

/* start express server */
```
