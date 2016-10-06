import { VersionInformation } from '../models/VersionInformation';
import 'reflect-metadata';
import { IocContainer } from '../core/IoC';
import { IoCSymbols } from '../core/IoCSymbols';
import { Registrar } from '../core/Registrar';
import { DuplicateVersionInformation, VersionInformationInvalid, VersionInformationMissing } from '../errors/Errors';
import { Version, VERSION_KEY } from './VersionDecorator';
import chai = require('chai');

const should = chai.should();

describe('VersionDecorator', () => {

    afterEach(() => {
        IocContainer.get<Registrar>(IoCSymbols.registrar).resetControllerRegistrations();
    });

    it('should add a version information to a controller', () => {
        @Version({ from: 1 })
        class Ctrl {
        }

        let versionInfo: VersionInformation = Reflect.getOwnMetadata(VERSION_KEY, Ctrl);
        versionInfo.from.should.equal(1);
        versionInfo.until.should.equal(Infinity);
    });

    it('should add a version information to a route', () => {
        class Ctrl {
            @Version({ from: 1 })
            public foo(): void { }
        }

        let versionInfo: VersionInformation = Reflect.getOwnMetadata(VERSION_KEY, Ctrl, 'foo');
        versionInfo.from.should.equal(1);
        versionInfo.until.should.equals(Infinity);
    });

    it('should add a correct from version', () => {
        @Version({ from: 1 })
        class Ctrl {
        }

        let versionInfo: VersionInformation = Reflect.getOwnMetadata(VERSION_KEY, Ctrl);
        versionInfo.from.should.equal(1);
        versionInfo.until.should.equal(Infinity);
    });

    it('should add a correct until version', () => {
        @Version({ until: 1 })
        class Ctrl {
        }

        let versionInfo: VersionInformation = Reflect.getOwnMetadata(VERSION_KEY, Ctrl);
        versionInfo.until.should.equal(1);
        versionInfo.from.should.equal(-Infinity);
    });

    it('should add a correct from / until version', () => {
        @Version({ from: 1, until: 2 })
        class Ctrl {
        }

        let versionInfo: VersionInformation = Reflect.getOwnMetadata(VERSION_KEY, Ctrl);
        versionInfo.from.should.equal(1);
        versionInfo.until.should.equal(2);
    });

    it('should throw if from is not a normal number', () => {
        (() => {
            @Version({ from: 3.14 })
            class Ctrl {

            }
        }).should.throw(VersionInformationInvalid);

        (() => {
            @Version({ from: <any>"1" })
            class Ctrl {

            }
        }).should.throw(VersionInformationInvalid);

        (() => {
            @Version({ from: 0 })
            class Ctrl {

            }
        }).should.throw(VersionInformationInvalid);
    });

    it('should throw if until is not a normal number', () => {
        (() => {
            @Version({ until: 3.14 })
            class Ctrl {

            }
        }).should.throw(VersionInformationInvalid);

        (() => {
            @Version({ until: <any>"1" })
            class Ctrl {

            }
        }).should.throw(VersionInformationInvalid);

        (() => {
            @Version({ until: 0 })
            class Ctrl {

            }
        }).should.throw(VersionInformationInvalid);
    });

    it('should throw if neither from nor until is declared', () => {
        (() => {
            @Version({})
            class Ctrl {

            }
        }).should.throw(VersionInformationMissing);
    });

    it('should throw if from is greater then until', () => {
        (() => {
            @Version({ from: 3, until: 2 })
            class Ctrl {

            }
        }).should.throw(VersionInformationInvalid);
    });

    it('should throw if there are multiple version decorators on a controller', () => {
        (() => {
            @Version({ from: 2, until: 4 })
            @Version({ from: 2, until: 3 })
            class Ctrl {

            }
        }).should.throw(DuplicateVersionInformation);
    });

    it('should throw if there are multiple version decorators on a route', () => {
        (() => {
            class Ctrl {
                @Version({ from: 2, until: 4 })
                @Version({ from: 2, until: 3 })
                public foo(): void { }
            }
        }).should.throw(DuplicateVersionInformation);
    });

});
