import 'reflect-metadata';
import { Giuseppe } from '../../src/';
import { Controller } from '../../src/core/controller/GiuseppeController';
import chai = require('chai');
import sinonChai = require('sinon-chai');

chai.should();
chai.use(sinonChai);

describe('Core controller', () => {

    describe('@Decorator', () => {

        let giuseppe: Giuseppe;

        beforeEach(() => {
            giuseppe = new Giuseppe();
        });

        it('should return Controller decorator', () => {
            Controller().should.be.a('function')
                .and.have.lengthOf(1);
        });

        it('should register a controller in giuseppe.', () => {
            @Controller()
            class Ctrl { }

            giuseppe.controller.should.have.length(1);
        });

    });

});
