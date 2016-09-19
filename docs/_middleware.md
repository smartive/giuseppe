---
layout: default
title: giuseppe - middleware
---
# Middleware

giuseppe does support middleware. Since there are good libraries
out there (e.g. [passportJS](http://passportjs.org/) for authentication)
we do wanna support middleware. It is possible through the controller
decorator or the various route decorators. You can add your middleware
as an open parameter list and add as many as you may want. If you use
the controller decorator, the middleware is preceded to all route 
middlewares.

*Note*: If you do forget to call `next();` in your middleware, your
route is going nowhere and will block the rest of the application.
(This is actually normal expressJS behaviour).

## Example

```typescript
/* load passportJS */

@Controller('high-secure', passport.authenticate('local'))
export class DemoController {
    @Get()
    public getDemos(): Demo[] {
        return [];
    }
}
```

So your authentication middleware will be called for all routes on the
`DemoController`.