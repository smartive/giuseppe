# Parameters

giuseppe does support the injection of several types of parameters. If
you decorate your route function parameters, they will be registered
in the functions metadata and are injected at runtime. If some type of
parameter injection is missing, feel free to open an issue or a pull
request :wink:. If a parameter is not decorated, it will be ignored (`undefined`)
since the order of the parameters does matter.

Most parameter decorators receive a `name` and an optional `options` argument.
The name is used to identify the specific field in express and the options
to define the behaviour of the param.

## Options

All parameters optionally accept an object for its configuration.
The configuration options are described below.

### General

As a base for all parameter options there is the following interface:
```typescript
export interface ParamOptions {
    required?: boolean;
    validator?: Validator|Validator[];
}
```

| Option    | Description                                                 |
| --------- | ----------------------------------------------------------- |
| required  | Marks the parameter as required                             |
| validator | One or multiple validators that all must evaluate to `true` |

### Query

For the query parameter decorator, there exists special options, which are specified below:

| Option    | Description                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------------- |
| alias     | One or multiple alias(es) for the given query parameter.<br>If multiple aliases are hit, the first one is returned. |
| factory   | A factory method for the type. Accepts an `any` raw value and must return the desired type.                         |

### Body

For the body parameter decorator, there exists special options, which are specified below:

| Option    | Description                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------------- |
| factory   | A factory method for the type. Accepts an `any` raw value and must return the desired type.                         |

### Cookie

For the cookie parameter decorator, there exists special options, which are specified below:

| Option    | Description                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------------- |
| factory   | A factory method for the type. Accepts an `any` raw value and must return the desired type.                         |

## Decorators

### General

All parameters are type checked at runtime. During the parse method, the constructor
of the decorated parameter type is used to check for the type. If the parsing
process throws an error, you get notified via an [`@ErrorHandler`](ErrorHandling.md) 
or the default error handler.

It is possible to use your own types for parsing (example below), but keep
in mind that your class constructor needs an `any` argument to receive the
passed query / body / whatever parameter from the client. If your type
lacks this any argument, the application will throw an appropriate error during
the design time at startup.

The example below will throw a design time error.

```typescript
class Foobar {
}

/* ... */

@Get()
public getDemo(@Query('limit') limit: Foobar): Demo {
}
```

The example below will work (i.e. if the passed limit parameter 
is an object with a limit variable).

```typescript
class Foobar {
    public limit: number;
    
    constructor(value: any) {
        this.limit = value.limit;
    }
}

/* ... */

@Get()
public getDemo(@Query('limit') limit: Foobar): Demo {
}
```

### Request

```typescript
/* ... */

@Get()
public getDemo(@Req() request: Request): void {
}

/* ... */
```

Injects the express `Request` object.

No options possible.

### Response

```typescript
/* ... */

@Get()
public getDemo(@Res() response: Response): void {
}

/* ... */
```

Injects the express `Response` object. May be used to set own status codes
or send a file or other custom stuff.

No options possible

### Query

```typescript
/* ... */

@Get()
public getDemo(@Query('limit') limit: number): Demo {
}

/* ... */
```

Get a query parameter that is passed by the client. Typically filtering, sorting
limiting stuff.

You must pass a name and can pass an optional options argument with the required
boolean flag and validators.

### Url

```typescript
/* ... */

@Get(':id')
public getDemo(@UrlParam('id') id: number): Demo {
}

/* ... */
```

Get an url parameter that is passed by the client. In terms of rest, this
is usually used to identify an object inside a route.

You must pass a name but cannot set any options since url parameter are
always required. Validation is obsolete since you should not use a complex
object as part of a route.

### Body

```typescript
/* ... */

@Put()
public createDemo(@Body() body: Demo): void {
}

/* ... */
```

Gets the request body. This parameter can be parsed to your own classes.

You do not need a name, but you can pass options like required and validators.

_*Note*_: Expected behaviour of express! If you do not use any package
like [body-parser](https://github.com/expressjs/body-parser) your body
argument will always be undefined.

### Header

```typescript
/* ... */

@Get()
public getAll(@Header('Accept-Language') lang: string = 'de'): Demo {
}

/* ... */
```

Get a request header sent by the client. Usefull for getting language settings
or anything like that.

You must pass a name and can pass an optional options argument with the required
boolean flag and validators.

### Cookie

```typescript
/* ... */

@Get()
public getAll(@Cookie('language') lang: string = 'de'): Demo {
}

/* ... */
```

Get a request cookie sent by the client. Can be used with the cookie functions
of express. Those functions provide functionality for setting and clearing
a cookie.

You must pass a name and can pass an optional options argument with the required
boolean flag, validators and a possible factory.