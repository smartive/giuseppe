---
layout: default
title: giuseppe - by smartive AG
---
giuseppe [Italian: dʒuˈzɛppe] is a controller routing system for [Express](http://expressjs.com/) using [TypeScript](https://www.typescriptlang.org/) 
decorators and annotations named after the great Italian componist Giuseppe Verdi. Like Verdi, 
it composes things, but not a great piece of musical history! We compose routes for you. giuseppe is dedicated to
[Express](http://expressjs.com/) and depends on it. We were tired of writing all the route registrations by ourselves.

##### A bunch of badges

[![Build Status](https://travis-ci.org/smartive/giuseppe.svg)](https://travis-ci.org/smartive/giuseppe) [![npm](https://img.shields.io/npm/v/giuseppe.svg?maxAge=3600)](https://www.npmjs.com/package/giuseppe) [![Coverage status](https://img.shields.io/coveralls/smartive/giuseppe.svg?maxAge=3600)](https://coveralls.io/github/smartive/giuseppe)

## Table of contents

- [Installation](#installation)
- [Basic usage](#basic-usage)
- [Testing](#testing)
- [Contribute](#contribute)
- [Changelog](#changelog)
- [Licence](#licence)

## Installation

To install this package, simply run

[![NPM](https://nodei.co/npm/giuseppe.png?downloads=true&stars=true)](https://nodei.co/npm/giuseppe/)

The suggested method would actually be: use the yeoman generator which we created @ 
[generator-giuseppe](http://giuseppe-generator.smartive.ch/).
It installs all dependencies and libraries that you need.

When you use the manual way npm should install all typing dependencies.
They are listed in the `package.json` with the `@types` prefix.

This package installs the transpiled `*.js` files instead of `*.ts` files, since the compiler tries
to compile them everytime. The declaration files with the JSDocs are provided aswell so your 
autocomplete does work as it should.

## Migrate to new major versions

If you are migrating from the 1.x version (or any other version for the future) please have a look at our
[migration documents](./migration)

### tsconfig.json

If you don't use the [yeoman generator](http://giuseppe-generator.smartive.ch/) to scaffold your application, you need
to provide the typescript compiler with the correct parameters to ensure, your application
is compiled in the correct way.

```json
{
  "compilerOptions": {
    "target": "<<ES VERSION>>",
    "module": "commonjs",
    "moduleResolution": "node",
    "removeComments": true,
    "outDir": "./build",
    "sourceMap": false,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "exclude": [
    "node_modules",
    "build"
  ]
}
```

The code above is an example, but you can copy and paste it to your project. The
only thing you need to adjust is the `ES VERSION` part.

Despite the fact, that this configs are listed here, we strongly suggest
that you use the [generator-giuseppe](http://giuseppe-generator.smartive.ch/) for yeoman.

## Basic usage

To start with a very simple "ping-pong" example, just use the following lines of code (app.ts):

```typescript
import { Controller, Get, Giuseppe } from 'giuseppe';

@Controller()
class PingPongController {
    
    @Get('ping')
    public ping(): any {
        return {ping: 'pong'};
    }
    
}

const giusi = new Giuseppe();

giusi.start();
```

If you run this basic example, the pingpong controller will be registered to the route
`/api/ping` since no controller route prefix is given.

Now you clearly do not want to code all your controllers in your `app.ts`. You can decorate any
class you want, the only condition is, that the class is loaded before the `registerControllers`
function is called.

`controllers.ts`:

```typescript
import { Controller, Get, Query } from 'giuseppe';

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
import { Giuseppe } from 'giuseppe';

const giusi = new Giuseppe();

giusi.start(8080, '/api');
```

In the example above, the two controllers are registered in expressJS with the routes
`/api/ping` and `/api/echo`. The echo route does listen to a `Query` parameter with the
name `data`. If it's not provided, undefined is injected.

This was a short example of the possiblities of giuseppe. Please find more details in the other topics of this
documentation and the [API documentation](./api/).

## Testing

If you checked out this repository (yay!) and installed all the dependencies, you
can run the tests with

```typescript
npm test
```

If you get any errors, maybe you didn't install the dependencies.

## Contribute

We're happy if you have any contributions! Every participation counts. Feel free to
open pull requests, issues or use any other form of contribution. Maybe we'll
set up a `CONTRIBUTING.md` file in the future. soon(tm).

If you want to create a plugin for giuseppe, use the other yeoman generator @ 
[generator-giuseppe-plugin](http://giuseppe-plugin-generator.smartive.ch/)

[Full list of contributors](https://github.com/smartive/giuseppe/graphs/contributors)

## Changelog

The changelog is based on [keep a changelog](http://keepachangelog.com) and is located here:

[Changelog](https://github.com/smartive/giuseppe/blob/master/CHANGELOG.md)

## Licence

This software is licenced under the [MIT](LICENSE) licence.
