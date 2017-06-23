---
layout: default
title: giuseppe - routes
---
# Routes

The route annotations declare your controllers methods as routed methods.
Basically the route decorator function does add itself to the
controller metadata and is registered during `registerControllers()`.
By now, all the methods that are implemented in express are supported and the complete
list can be found in the [API documentation / HttpMethod](/api/enums/httpmethod.html)

The main decorated used for a route is `@Route`. There are aliases for all
http methods (`@Get`, `@Put`, `@Post`, `@Delete` and `@Head`) so simplify the usage.

If no route string is provided, the base path of the controller and the
base url of the registration function are used. The whole decoration
and registration magic happens in the [giuseppe object](/giuseppe.html).

## To return or not return

A special note to the return behaviour of giuseppe. To provide convenience
a controller should be as simple as possible. There is a default return type handler installed.
This handler can be overwritten by a plugin (you can write a shared plugin, or implement the plugin interface
in your codebase).

The default [JsonDefaultReturnType](/api/classes/jsondefaultreturntype.html) does convert everything
to a JSON string, does set the content-type to `application/json` and returns a status of `200` if there is a
return value or `204` if there was no content.

You may implement your own return type handler, that renders a handlebar template (for example).

This would look like the following code:

```typescript
export class HandlebarView<T> {
    constructor(public viewname: string, public data: T){}
}

export class ViewReturnType implements ReturnType<HandlebarView<any>> {
    public type: string = 'HandlebarView';

    public getHeaders(): { [field: string]: string; } {
        return {
            'Content-Type': 'text/html',
            /* and others maybe */
        };
    }

    public getStatus(value?: HandlebarView<any>): number {
        if (value === undefined || value === null) {
            return httpStatus.NOT_FOUND;
        }
        return httpStatus.OK;
    }

    public getValue(value: HandlebarView<any>): string {
        const hbs = /* get handlebars. */
        return hbs.compile(value.viewname).render(value.data);
    }
}
```

**Note**: this is just demo code. It should demonstrate the principle of the return type handlers.
