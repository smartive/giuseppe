import chai = require('chai');
import sinon = require('sinon');
import sinonChai = require('sinon-chai');
import {isString, isNumber} from './Validators';

let should = chai.should();
chai.use(sinonChai);

describe('Validators', () => {

    describe('String validator', () => {

        it('should validate a string correctly', () => {
            isString()('a string').should.be.true;
        });

        it('should validate an empty string correctly', () => {
            isString()('').should.be.false;
            isString(true)('').should.be.true;
        });

        it('should validate a non string correctly', () => {
            isString()(1).should.be.false;
            isString()(NaN).should.be.false;
            isString()({}).should.be.false;
            isString()([]).should.be.false;
        });

        it('should validate a null value correctly', () => {
            isString()(null).should.be.false;
        });

        it('should validate an undefined value correctly', () => {
            isString()(undefined).should.be.false;
        });

        it('should validator min length correctly');

        it('should validator max length correctly');

    });

    describe('Number validator', () => {

        it('should validate a number correctly', () => {
            isNumber()(1).should.be.true;
        });

        it('should validate a non number correctly', () => {
            isNumber()('a string').should.be.false;
        });

        it('should validate a NaN correctly', () => {
            isNumber()(NaN).should.be.false;
        });

        it('should validate a null value correctly', () => {
            isNumber()(null).should.be.false;
        });

        it('should validate an undefined value correctly', () => {
            isNumber()(undefined).should.be.false;
        });

        it('should validate min correctly');

        it('should validate max correctly');

        it('should validate multipleOf correctly');

    });

});
