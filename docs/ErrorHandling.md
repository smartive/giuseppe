# Errors and error handling

Nobody is perfect and errors can happen. But you don't want your whole application to crash.
This document describes the different kinds of errors and their propper management.

## Errors

### Design time errors

Those errors happen during the application startup. They will crash your application since it's
not usefull to use the api when those errors happen. When you decorate a class with a TypeScript
decorator (e.g. `@Controller`), your transpiled JavaScript uses helper functions for that.
When you load a decorated class (i.e. `import {...} from ...;`), this decoration code is
executed. Giuseppe prevents some design time errors by throwing errors during this design time.

All errors are documented with JSDoc in the [Errors.ts](../errors/Errors.ts) file. A brief overview is given:

- `HttpVerbNotSupportedError`: However you did it, you managed to get 
   a value inside the `RouteRegistration` that is not part of the enum `RouteMethod`.
- `DuplicateRouteDeclarationError`: A specific route is registered twice. 
   (`PUT` and `POST` to `/api/test` are two different routes).
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