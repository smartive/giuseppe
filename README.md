# giuseppe
![giuseppe](https://cloud.githubusercontent.com/assets/1067213/14689133/51624568-0746-11e6-9d93-eabc6d5f97e2.png)

> [Italian: dʒuˈzɛppe]

A controller routing system for expressJS with typescript decorators and annotations.
Named after Giuseppe Verdi the great componist. Like Verdi, we compose things, 
but not a great piece of art! We compose routes for you. `giuseppe` is dedicated to
[expressJS](http://expressjs.com/) and depends on it. We were tired of writting all the
route registrations by ourselfes.

## Docs

This readme will give a short overview over the usable features. For more detailed information,
please find a more detailed documentation in the `docs/` folder.

- [Registration of controllers](docs/Registration.md)
- [Controllers]()
- [Routes]()
- [Parameters]()
- [Validators]()
- [Error handling]()

## Installation

To install this package, simply run

```bash
npm i --save giuseppe
```

If not all `typings` are installed - actually they should, since the postinstall hook 
tells npm to do so - you need to manually install the typings for this package.

The dependend typings are:
- `es6-shim`
- `express`
- `express-serve-static-core`
- `http-status`
- `mime`
- `node`
- `serve-static`

This package installs the transpiled `*.js` files instead of `*.ts` files, since the compiler tries
to compile them everytime. The declaration files with the JSDocs are provided aswell so your 
autocomplete does work as it should.

## Basic usage

To start with a very simple "ping-pong" example, just use the following lines of code (app.ts):

```typescript
import {Controller, Get, registerControllers} from 'giuseppe';
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

If you run this basic example, the pingpong controller will be registered to the route
`/api/ping` since no controller route prefix is given.

Now you clearly do not want to code all your controllers in your `app.ts`. You can decorate any
class you want, the only condition is, that the class is loaded before the `registerControllers`
function is called.

`controllers.ts`:

```typescript
import {Controller, Get, Query} from 'giuseppe';

@Controller()
export class PingPongController {
    
    @Get('ping')
    public ping(): any {
        return {ping: 'pong'};
    }
    
}

@Controller('echo')
export class EchoController {
    
    @Get()
    public ping(@Query('data') data: string): string {
        return 'you gave me: ' + data;
    }
    
}
```

`app.ts`:

```typescript
import './controllers';
import {registerControllers} from 'giuseppe';
import express = require('express');

let app = express();

app.use(registerControllers('/api'));

app.listen(8080, () => {
    console.log('Up and running on port 8080');
});
```

In the example above, the two controllers are registered in expressJS with the routes
`/api/ping` and `/api/echo`. The echo route does listen to a `Query` parameter with the
name `data`. If it's not provided, undefined is injected.

This was a short example of the possiblities of giuseppe. Please find a more detailed version
of the documentation in the [links at the start](#docs) and/or the `docs/` folder.

## Testing

If you checked out this repository (yay!) and installed all the dependencies, you
can run the ninety-ish tests with

```bash
npm test
```

Actually you cannot do something wrong, since the `pretest` hook will install the dependencies,
install the typings and compiles giuseppe. 

## Contribute

We're happy if you have any contributions! Every participation counts. Feel free to
open pull requests, issues or use any other form of contribution. Maybe we'll
set up a `CONTRIBUTING.md` file in the future. soon(tm) :smile:.

## Contributers

The author of the package is [Christoph Bühler](https://github.com/buehler)
but without the help of [smartive](https://smartive.ch), this package would not
have been possible. All the people of smartive contributed to this package in their
own awesome way and will maintain it in the future.

## Changelog

## Licence

This software is licenced under the [MIT](https://github.com/smartive/giuseppe/blob/master/LICENSE) licence.