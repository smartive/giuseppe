# Errors and error handling

Nobody is perfect and errors can happen. But you don't want your whole application to crash.
This document describes the different kinds of errors and their propper management.

## Errors

### Design time errors

Those errors happen during the application startup. They will crash your application since it's
not helpfull to use the api when those errors happen. When you decorate a class with a TypeScript
decorator (e.g. `@Controller`), your transpiled JavaScript uses helper functions for that.
When you load a decorated class (i.e. `import {...} from ...;`), this decoration code is
executed. giuseppe prevents some horrible random situations by throwing error objects 
during the design time (e.g. on duplicate routes, express just uses the first one).

All errors are documented with JSDoc in the [Errors.ts](../errors/Errors.ts) file. A brief overview is given:

- `HttpVerbNotSupportedError`: However you did it, you managed to get 
   a value inside the `RouteRegistration` that is not part of the enum `RouteMethod`.
- `DuplicateRouteDeclarationError`: A specific route is registered twice. 
   (`PUT` and `POST` to `/api/test` are two different routes).
- `HeadHasWrongReturnTypeError`: A head-route has not the return type boolean.
- `ErrorHandlerWrongArgumentsError`: A registered `@ErrorHandler` has the wrong arguments count.
- `ErrorHandlerWrongArgumentTypesError`: A registered `@ErrorHandler` has the wrong argument types.
- `ErrorHandlerWrongReturnTypeError`: An `@ErrorHandler` should always return `void`.
- `ParameterConstructorArgumentsError`: A constructor for a parameter (e.g. `MyOwnClass`) should
   always receive at least 1 argument.

### Runtime errors

The runtime errors happen during the usage of your api. They will *_not_* crash your application.
If your controller has no `@ErrorHandler` registered, the following default is used:

```typescript
const defaultErrorHandler = (req, res, err) => {
    console.error(err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).end();
};
```

You can register multiple `@ErrorHandler` in your controller (yes, they are scoped to a controller)
and handle the runtime errors. But more on that later, first a brief list of runtime errors:

- `RequiredParameterNotProvidedError`: A required parameter (Query, Url, Header or Body) was not 
   provided by the client.
- `ParameterParseError`: The parameter parsing process threw an error (e.g. `throw new Error();`
   in the constructor of your custom class :wink:).
- `WrongReturnTypeError`: Your route function did not return the type it was supposed to (e.g. 
   `(15 as string)` instead of `number`).
- `ParamValidationFailedError`: The provided validator for a parameter did return false.
- `RouteError`: A pretty random error occured (e.g. an exception during the route function,
   or maybe somebody called conole.log instead of console.log?). Actually the route error
   has a field `innerException` that delivers the exception thrown. It could be an elasticsearch
   error, that is returned by a rejected Promise. Basically every error that is not catched
   by giuseppe and happend during a route method.

## Error handling

As long as some runtime errors happen, you can do something with them. It's possible
to register multiple `@ErrorHandler` for a controller. Those are called when an error happens
during the execution of the method or the parameter parsing process. You can register an
`@ErrorHandler` for a specific (or multiple specific) error classes and even register your
own errors.

`TestController.ts`:

```typescript
/* imports. */

@Controller('test')
export class TestController {
    @Get()
    public get(): string {
        throw new Error('not implemented yet.');
    }
    
    @ErrorHandler()
    public errorHandler(request: Request, response: Response, error: Error): void {
        console.log('Oh noes!');
        response.status(500).end();
    }
}
```

The defined errorhandler will be called for all errors that happen since there is no specific
error type defined. Another example with a specialized error handler could be:

`TestController.ts`:

```typescript
/* imports. */

@Controller('test')
export class TestController {
    @Get()
    public get(@Query('size', {required: true}) size: number): any {
        mongoDb.find(/*...*/);
    }
    
    @ErrorHandler()
    public errorHandler(request: Request, response: Response, error: Error): void {
        console.log('Oh noes!');
        response.status(500).end();
    }
    
     @ErrorHandler(RequiredParameterNotProvidedError, ParameterParseError)
    public badReq(request: Request, response: Response, error: Error): void {
        console.log('This is a bad request from the client.');
        response.status(400).end();
    }
}
```

In the example above, if `mongoDb` throws an error or something bad happens there,
the `errorHandler` function is called because the error will be wrapped in a `RouteError`.
But when the client delivers a string as the query parameter "size", or if the client
does not even provide the parameter, `badReq` will be called instead of `errorHandler`.

*Note*: They won't be called both! Only the helpers for a given type are called. If no
helpers are found for an error type, the default is called.

You can register multiple error handlers for the same or default errors, but you need to
keep in mind that you only send the express headers once.