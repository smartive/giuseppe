import 'reflect-metadata';
import { Giuseppe, GiuseppePlugin } from '../src';
import { ControllerDecorator } from '../src/controller/ControllerDecorator';
import { DuplicatePluginError } from '../src/errors';
import { ReturnTypeHandler } from '../src/routes/ReturnTypeHandler';
import { RouteDecorator } from '../src/routes/RouteDecorator';
import { RouteModificator } from '../src/routes/RouteModificator';
import chai = require('chai');
import sinon = require('sinon');
import sinonChai = require('sinon-chai');

chai.should();
chai.use(sinonChai);

describe('Core controller', () => {

    describe('@Decorator', () => {

        let giuseppe: Giuseppe;

        beforeEach(() => {
            giuseppe = new Giuseppe();
        });

        it('should register a controller in giuseppe.', () => {
            
        });

    });

});
