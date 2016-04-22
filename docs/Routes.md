# Routes

The route annotations declare your controllers methods as routed methods.
Basically the route decorator function does add itself to the
controller metadata and is registered during `registerControllers()`.
By now, the following http methods are supported:

- Get
- Put
- Post
- Delete

The main decorated used for a route is `@Route`. There are aliases for all
http methods (`@Get`, `@Put`, `@Post` and `@Delete`) so simplify the usage.

If no route string is provided, the base path of the controller and the
base url of the registration function are used. The whole decoration
and registration magic happens at [registerControllers](Registration.md).