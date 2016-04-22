# Routes

The route annotations declare your controllers methods as routed methods.
Basically the route decorator function does add itself to the
controller metadata and is registered during `registerControllers()`.
By now, the following http methods are supported:

- Get
- Put
- Post
- Delete
- Head

The main decorated used for a route is `@Route`. There are aliases for all
http methods (`@Get`, `@Put`, `@Post`, `@Delete` and `@Head`) so simplify the usage.

If no route string is provided, the base path of the controller and the
base url of the registration function are used. The whole decoration
and registration magic happens at [registerControllers](Registration.md).

## To return or not return

A special note to the return behaviour of giuseppe. To provide convenience
a controller should be as simple as possible. There are some special
conditions on return types of routing methods. Those are listed with a short
description of the condition and a usecase.


| Condition | Result | Description | Usage |
| --------- | ------ | ----------- | ----- |
| Method has no return type and has a decorated `@Res` parameter | giuseppe will return and do nothing else. | If the return type of the method is `void 0` and the method is injected with the response object. You can set your own results and return values. | Very simple: `res.sendFile(..)` or `res.status(418).end()` |
| Method has no return type and has *NO* decorated `@Res` parameter | giuseppe will return `res.status(httpStatus.NO_CONTENT)` | If the method has return type `void 0` and no injected response object it returns a NO_CONTENT on a successful route call. | Create an object with a `put` but do not return anything. (e.g. [DemoController](Controllers.md) |
| Method has a return type and returns the wrong type | You get an error to the knee. | The desired return type and the actually returned type do not match. | Ease up your live :wink: |
| Method returns a primitive type (string, number, boolean) | giuseppe calls `res.send(returnValue)` | The method returns a simple type like a string (`hello world`) so giuseppe returns it to the client. | Is alive route or very basic routes. |
| Method returns a non primitive type (string, number, boolean) | giuseppe calls `res.json(returnValue)` | The method returns a complex type or an object, so giuseppe returns it as a json to the client. | Basic rest usage of your controller. |
| Method returns a `Promise` | giuseppe awaits the promise and calls `send` or `json` depending on the return type or the errorhandler when the promise rejects. | The method returns a promise (e.g. `return elasticsearch.search({})`). giuseppe will await those promises and return appropriate to the return type. | Use MongoDB or elastic or whatever in your route and directly return the promise instead of await things and return then. |