---
layout: default
title: giuseppe - versioning
---
# Versioning

Since apis can change, we enabled giuseppe to use a special `@Version` decorator. With this decorator,
an api developer can version the controllers and even each route to her / his special needs.
As a note, not all routes must be versioned for this feature to work. Only routes that are
available in multiple versions need to be versioned.

Query and url parameters do still work with versioned routes. Parameters, middlewares and
the controller instance can differ for each version of a route.

**Note**: If the version header is omitted in a request, it is defaulted to `1`.
This also applies if any non number stuff is inserted (i.e. `Accept-Header: foobar`).

## Version header

The required / requested version is determined by the `Accept-Version` header. The name of the
header can be configured in the global giuseppe configuration with the key `giuseppeConfiguration.versionHeaderName`.

Changing the default header must be done at startup, before the `registerControllers` or `registerControllersFromFolder`
mthods are called:

```typescript
import {giuseppeConfiguration, registerControllers} from 'giuseppe';

giuseppeConfiguration.versionHeaderName = 'Api-Version';

let r = registerControllers();

/*...*/
```

## Version decorator

The `@Version` decorator takes a single object with two optional properties to configure
the routing for the controller or route.

```typescript
function Version(versionInformation: { from?: number, until?: number });
```

The following possibilities are given:

- Only fill from: this route is valid from the given version hereafter
- Only fill until: this route is valid until the given number
- Fill both: a specific range of versions is valid
- Fill none: the application throws an error

As with the middleware or other decorators, if the decorator is on a route,
it is prefered over a controller decorator. So it is possible to register a whole
controller for version 1, but if one method needs to be for version 2, the developer can
overwrite the controller decorator.

## Examples

### Same route but different version

```typescript
@Controller()
class MyController {

    @Get('get-stuff')
    @Version({ from: 1, until: 2 })
    public getStuff(): Stuff[] {
        /*...*/
    }
    
    @Get('get-stuff')
    @Version({ from: 3 })
    public getStuffv3(): Stuff[] {
        /*...*/
    }

}
```

This example shows the possibility to use the same route for multiple
methods, but with different versions. Giuseppe won't throw an exception
since the version differs.

### With other middleware

```typescript
function authenticationMiddleware(req, res, next){
    /*...*/
    next();
}

@Controller()
class MyController {

    @Get('get-stuff')
    @Version({ until: 2 })
    public getStuff(): Stuff[] {
        /*...*/
    }
    
    @Get('get-stuff', authenticationMiddleware)
    @Version({ from: 3 })
    public getStuffv3(): Stuff[] {
        /*...*/
    }

}
```

With versioning, it is possible to change middleware for each version. In the example
above, the first two versions of the api route were not authenticated. The third version
needs some authentication middleware, so one can create a new version of the route
and throw in the authentication middleware (does work with route an / or controller middleware).

### Overwrite controller version

```typescript
@Controller()
@Version({ from: 1, until: 1 })
class MyController {

    @Get('get-stuff')
    public getStuffv1(): Stuff[] {
        /*...*/
    }
    
    @Get('get-stuff')
    @Version({ from: 2 })
    public getStuffv2(): Stuff[] {
        /*...*/
    }

}
```

## Possible errors

While using versioning, there are some cases when giuseppe throws an error:

- When two versions overlap (i.e. `from 2` and another route with `until 3`)
- When the `from` field is after an `until` field
- When `from` and `until` are omitted
- When a controller or route has multiple `@Version` decorators
- When something other than an unsigned integer is inserted (i.e. `'foobar'` or `3.14`)

In the following cases, giuseppe will return a `404`:

- A route is not available in a requested version
- A route is directly called with the internally hashed url