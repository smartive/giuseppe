---
layout: default
title: giuseppe - controller
---
# Controller

In terms of the api controller, there is not much to say. You need to decorate your
controllers class with the `@Controller` annotation so it registers itself with
the express router. If you forget that, nothing is gonna happen.

You can specify a route prefix for the whole controller which will be used for all
routes of the controller.

`DemoController.ts`:

```typescript
/* imports. */

@Controller('demo')
export class DemoController {
    private demos: Demo[] = [];

    @Get()
    public getDemos(): Demo[] {
        return this.demos;
    }

    @Get(':id')
    public getDemo(@UrlParam('id') id: number): Demo {
        let filtered = this.demos.filter(d => d.id === id);
        if (!filtered.length) {
            throw new Error('not found.');
        }
        return filtered[0];
    }

    @Put()
    public createDemo(@Body({required: true}) body: Demo): void {
        this.demos.push(body);
    }

    @Post(':id')
    public updateDemo(@UrlParam('id') id: number, @Body({required: true}) body: Demo): void {
        let filtered = this.demos.filter(d => d.id === id);
        if (!filtered.length) {
            throw new Error('not found.');
        }
        this.demos.splice(this.demos.indexOf(filtered[0]), 1, body);
    }

    @Delete(':id')
    public deleteDemo(@UrlParam('id') id: number): void {
        let filtered = this.demos.filter(d => d.id === id);
        if (!filtered.length) {
            throw new Error('not found.');
        }
        this.demos.splice(this.demos.indexOf(filtered[0]), 1);
    }

    @ErrorHandler()
    public err(req: Request, res: Response, err: Error): void {
        if (err instanceof RouteError && err.innerException.message === 'not found.') {
            res.status(404).end();
            return;
        }
        res.status(500).end();
    }
}
```