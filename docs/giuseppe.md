---
layout: default
title: giuseppe - the start
---
# The giuseppe object

The [giuseppe object](/api/classes/giuseppe.html) is the heart of the application. It's responsible for your
application, the router and the registration of the controllers.

On the [registrar](/api/classes/giuseppe.html#registrar), all controllers are registered. So when you write
your controller code, all those elements are registered on that static registrar. This makes it possible, to load
controllers first and instantiate giuseppe later on.

## Registering controllers

This part is actually very easy and straight forward. All controller classes that are
decorated with the `@Controller` annotation, will be registered within giuseppe.
If you code your class and use `@Get`, `@Post`, ... but you forget to annotate the controller,
nothing is gonna happen.

## Register controllers from folders

For your convenience, there is a [`loadControllers()`](/api/classes/giuseppe.html#loadcontrollers) function where you
can pass a `glob` pattern. Giuseppe searches for all files that match the glob pattern and does `require()` them.

After this is done, you can run `giuseppe.start()` and if your controllers are loaded, all the routes should be
registered. So there is no need to load every controller first to register all routes.

## Route ordering

To support wildcard routes, giuseppe does order the routes, before they are
registered with express. Since express does have a first-match strategy when
it's routers are matching the routes of the request, giuseppe orders them.
With this ordering, the more specific routes (i.e. with more url segments, the less url params
and less wildcard characters) are registered first and are matched with express.

It's possible to make a `catch all` route with just a `*` character to support
a single page application for example.

```typescript
@Controller('*')
class StaticFileController {
    @Get()
    public getFile(): void {
        /* get the file path from the requests url */
        // sendFile;
    }
}

@Controller('api/demo')
class ApiController {
    /* ... */
}
```

In the example above, the routes to `api/demo` are routed correctly, even
if the static file controller is (technically) loaded first.

## start / stop / express?

Giuseppe contains the express instance as well as the used router. Those fields are public, in case you want to
access / replace / modify those things before you fire up your application (maybe some custom middlewares, or
websockets or whatever).

When you run `start()`, giuseppe creates and registers all routes within the express router and passes that
router to the express app. After that, `expressApp.listen` is called with the parameter you specify in `start()`.

When you run `stop()`, giuseppe stops the http server.

With those functions, a minimal `app.ts` could be (assuming, your controller are in a `./controllers` folder):

```typescript
import { Giuseppe } from 'giuseppe';

const giusi = new Giuseppe();

giusi
    .loadControllers('./controllers/**/*.js')
    .then(() => giusi.start());
```

You'll now have an application running on port `8080`.
