import { Controller, ControllerMetadata, Get, Giuseppe, HttpMethod } from 'giuseppe';
import { DuplicateRouteError } from 'giuseppe/errors';

import { GiuseppeVersionPlugin, Version } from '../src';
import { VersionInformationInvalidError } from '../src/VersionInformationInvalidError';
import { VersionInformationMissingError } from '../src/VersionInformationMissingError';
import { VersionsOverlapError } from '../src/VersionsOverlapError';

describe('GiuseppeRouteVersion', () => {

    afterEach(() => {
        (Giuseppe as any).registrar.controller = [];
    });

    it('should return a method decorator', () => {
        expect(Version()).toBeInstanceOf(Function);
    });

    it('should register a route modificator', () => {
        class Ctrl {
            @Version({ from: 1, until: 2 })
            public ctrlFunction(): void { }
        }

        const meta = new ControllerMetadata(Ctrl.prototype);

        expect(meta.modificators('ctrlFunction')).toMatchSnapshot();
    });

    it('should throw if no version is provided (neither from nor until)', () => {
        const fn = () => {
            class Ctrl {
                @Version()
                public ctrlFunction(): void { }
            }
        };

        expect(fn).toThrow(VersionInformationMissingError);
    });

    const cases = ['1', 1.5, -3];

    for (const num of cases) {
        it(`should throw if from is invalid (${num})`, () => {
            const fn = () => {
                class Ctrl {
                    @Version({ from: num as any })
                    public ctrlFunction(): void { }
                }
            };

            expect(fn).toThrow(VersionInformationInvalidError);
        });

        it(`should throw if until is invalid (${num})`, () => {
            const fn = () => {
                class Ctrl {
                    @Version({ until: num as any })
                    public ctrlFunction(): void { }
                }
            };

            expect(fn).toThrow(VersionInformationInvalidError);
        });
    }

    it('should throw if until is bigger than from', () => {
        const fn = () => {
            class Ctrl {
                @Version({ from: 2, until: 1 })
                public ctrlFunction(): void { }
            }
        };

        expect(fn).toThrow(VersionInformationInvalidError);
    });

    it('should create a router for a route that has a version', () => {
        class Ctrl {
            @Version({ from: 1 })
            public func(): void { }
        }

        const meta = new ControllerMetadata(Ctrl.prototype);
        const routeVersion = meta.modificators('func')[0];

        const result = routeVersion.modifyRoute([
            {
                function: () => { },
                id: 'id',
                method: HttpMethod.get,
                middlewares: [],
                name: 'func',
                url: 'url',
            },
        ]);

        expect(result).toMatchSnapshot();
    });

    it('should call the express router with the correct parameters for 1 version', () => {
        @Controller()
        class Ctrl {
            @Version({ from: 1 })
            @Get()
            public func(): void { }
        }

        const giusi = new Giuseppe();
        giusi.registerPlugin(new GiuseppeVersionPlugin());
        const spy = jest.spyOn(giusi.router, 'get');

        giusi.configureRouter('');

        expect(spy.mock.calls).toHaveLength(2);
        expect(spy.mock.calls[0]).toMatchSnapshot();
        expect(spy.mock.calls[1]).toMatchSnapshot();
    });

    it('should call the express router with the correct parameters for 2 versions', () => {
        @Controller()
        class Ctrl {
            @Version({ from: 1, until: 1 })
            @Get()
            public func(): void { }

            @Version({ from: 2 })
            @Get()
            public func2(): void { }
        }

        const giusi = new Giuseppe();
        giusi.registerPlugin(new GiuseppeVersionPlugin());
        const spy = jest.spyOn(giusi.router, 'get');

        giusi.configureRouter('');

        expect(spy.mock.calls).toMatchSnapshot();
    });

    it('should call the express router with the correct parameters for various versions', () => {
        @Controller()
        class Ctrl {
            @Version({ from: 1, until: 1 })
            @Get()
            public func(): void { }

            @Version({ from: 2, until: 3 })
            @Get()
            public func2(): void { }

            @Version({ from: 4, until: 8 })
            @Get()
            public func3(): void { }
        }

        const giusi = new Giuseppe();
        giusi.registerPlugin(new GiuseppeVersionPlugin());
        const spy = jest.spyOn(giusi.router, 'get');

        giusi.configureRouter('');

        expect(spy.mock.calls).toMatchSnapshot();
    });

    it('should call the express router with the correct parameters for mixed controllers', () => {
        @Controller()
        class Ctrl {
            @Version({ from: 1, until: 1 })
            @Get()
            public func(): void { }

            @Version({ from: 2, until: 3 })
            @Get()
            public func2(): void { }

            @Get('foo')
            public func3(): void { }
        }

        const giusi = new Giuseppe();
        giusi.registerPlugin(new GiuseppeVersionPlugin());
        const spy = jest.spyOn(giusi.router, 'get');

        giusi.configureRouter('');

        expect(spy.mock.calls).toMatchSnapshot();
    });

    it('should throw when version info overlap', () => {
        @Controller()
        class Ctrl {
            @Version({ from: 1, until: 2 })
            @Get()
            public func(): void { }

            @Version({ from: 2 })
            @Get()
            public func2(): void { }
        }

        const giusi = new Giuseppe();
        giusi.registerPlugin(new GiuseppeVersionPlugin());

        expect(() => giusi.configureRouter('')).toThrow(VersionsOverlapError);
    });

    it('should throw when a duplicate url is found (versioned and non versioned)', () => {
        @Controller()
        class Ctrl {
            @Version({ from: 1, until: 1 })
            @Get()
            public func(): void { }

            @Version({ from: 2 })
            @Get()
            public func2(): void { }

            @Get()
            public func3(): void { }
        }

        const giusi = new Giuseppe();
        giusi.registerPlugin(new GiuseppeVersionPlugin());

        expect(() => giusi.configureRouter('')).toThrow(DuplicateRouteError);
    });

});
