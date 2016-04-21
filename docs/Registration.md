# Registration of controllers

This part is actually very easy and straight forward. All controller classes that are
decorated with the `@Controller` annotation, will be registered with an express router.
If you code your class and use `@Get`, `@Post`, ... but you forget to annotate the controller,
nothing is gonna happen.

## Registration function

```typescript
import {registerControllers} from 'giuseppe';

/* init express app and more stuff */

app.use(registerControllers('baseUrl'));

/* start express server */
```

The function returns an express router. If no router is provided to the function (second
parameter), it instantiates it's own router and returns it at the end. The first parameter
defines the base url for the returned router.