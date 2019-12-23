---
layout: default
title: giuseppe - migration
---
# Migration guide(s)

In this document, you'll find some important changes (mostly the breaking ones) that you need to make
so that your application is "compliant" with a higher giuseppe version.

## v1.x to v2.x

The core of giuseppe was rewritten. There are a few new concepts now (like plugins) which makes giuseppe
more versatile. Everything is wrapped in a plugin now. So if someone wants a feature that is not in giuseppe
itself, that one person can write a plugin and implement the feature (like additional routes, controllers, params, etc).

### New startup code

Giuseppe is now an instance of a certain class. Not just a register function anymore.
So when your code was:

```typescript
import { Controller, Get, registerControllers } from 'giuseppe';
import express = require('express');

@Controller()
class PingPongController {

    @Get('ping')
    public ping(): any {
        return {ping: 'pong'};
    }

}

let app = express();

app.use(registerControllers('/api'));

app.listen(8080, () => {
    console.log('Up and running on port 8080');
});
```

You now want to write:

```typescript
import { Controller, Get, Giuseppe } from 'giuseppe';

@Controller()
class PingPongController {

    @Get('ping')
    public ping(): any {
        return {ping: 'pong'};
    }

}

const app = new Giuseppe();
app.start(8080, '/api');
```

Or with the `loadControllers` method:

```typescript
import { registerControllersFromFolder } from 'giuseppe';

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

You now want to write:

```typescript
import { Giuseppe } from 'giuseppe';

const giusi = new Giuseppe();

giusi
    .loadControllers('./controllers/**/*.js')
    .then(() => giusi.start());
```

### No @Version

The `@Version` decorator for routes was removed. It's available through a plugin (`RouteModificator`) now.
So instead of `import {@Version} from 'giuseppe'` you'll need to install the plugin: `npm i giuseppe-version-plugin`
And import `@Version` from there.

### No @Req and @Res

The `@Req` and the `@Res` decorator for parameters were removed. They're available through a plugin now.
Since you can use return types now to distinguish the handling, you shouldn't need the @Res param much longer.

If you depend on it though, find the plugin here: `npm i giuseppe-reqres-plugin`
