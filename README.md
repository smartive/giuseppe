![giuseppe](https://cloud.githubusercontent.com/assets/292951/14691860/f363e562-0753-11e6-89df-aab95645084f.png)

giuseppe [Italian: dʒuˈzɛppe] is a controller routing system for [Express](http://expressjs.com/) using [TypeScript](https://www.typescriptlang.org/) decorators and annotations named after the great Italian componist Giuseppe Verdi. Like Verdi, it composes things, but not a great piece of musical history! We compose routes for you. giuseppe is dedicated to
[Express](http://expressjs.com/) and depends on it. We were tired of writing all the route registrations by ourselves.

##### A bunch of badges

[![Build Status](https://travis-ci.org/smartive/giuseppe.svg)](https://travis-ci.org/smartive/giuseppe) [![npm](https://img.shields.io/npm/v/giuseppe.svg?maxAge=3600)](https://www.npmjs.com/package/giuseppe) [![Coverage status](https://img.shields.io/coveralls/smartive/giuseppe.svg?maxAge=3600)](https://coveralls.io/github/smartive/giuseppe)

## Table of contents

- [Docs](#docs)
- [Installation](#installation)
- [Basic usage](#basic-usage)
- [Testing](#testing)
- [Contribute](#contribute)
- [Changelog](#changelog)
- [Licence](#licence)

## Docs

This readme will give a short overview over the usable features. For more detailed information,
please find a more detailed documentation in the `docs/` folder.

- [Registration of controllers](docs/Registration.md)
- [Controllers](docs/Controllers.md)
- [Routes](docs/Routes.md)
- [Parameters](docs/Parameters.md)
- [Validators](docs/Validators.md)
- [Error handling](docs/ErrorHandling.md)

## Installation

To install this package, simply run

[![NPM](https://nodei.co/npm/giuseppe.png?downloads=true&stars=true)](https://nodei.co/npm/giuseppe/)

If not all `typings` are installed for giuseppe
you need to manually install the typings for this package.

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

#### Examples

There are many examples located in the [examples](examples) folder!
Please have a look there for various use cases :smile:.

## Testing

If you checked out this repository (yay!) and installed all the dependencies, you
can run the ninety-ish tests with

```bash
npm test
```

If you get any errors, maybe you didn't install the dependencies. There is a `npm run bootstrap`
command that will install them for you.

## Contribute

We're happy if you have any contributions! Every participation counts. Feel free to
open pull requests, issues or use any other form of contribution. Maybe we'll
set up a `CONTRIBUTING.md` file in the future. soon(tm) :smile:.

[Full list of contributors](https://github.com/smartive/giuseppe/graphs/contributors)

## Changelog

The changelog is based on [keep a changelog](http://keepachangelog.com) and is located here:

[Changelog](CHANGELOG.md)

## Licence

This software is licenced under the [MIT](LICENSE) licence.
