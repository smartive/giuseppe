import chai = require('chai');
import sinon = require('sinon');
import sinonChai = require('sinon-chai');
import {isStringValidator, isNumberValidator} from './Validators';

let should = chai.should();
chai.use(sinonChai);

describe('Validators', () => {

    describe('String validator', () => {

        it('should validate a string correctly', () => {
            isStringValidator('a string').should.be.true;
        });

        it('should validate an empty string correctly', () => {
            isStringValidator('').should.be.true;
        });

        it('should validate a non string correctly', () => {
            isStringValidator(1).should.be.false;
            isStringValidator(NaN).should.be.false;
            isStringValidator({}).should.be.false;
            isStringValidator([]).should.be.false;
        });

        it('should validate a null value correctly', () => {
            isStringValidator(null).should.be.false;
        });

        it('should validate an undefined value correctly', () => {
            isStringValidator(undefined).should.be.false;
        });

    });

    describe('Number validator', () => {

        it('should validate a number correctly', () => {
            isNumberValidator(1).should.be.true;
        });

        it('should validate a non number correctly', () => {
            isNumberValidator('a string').should.be.false;
        });

        it('should validate a NaN correctly', () => {
            isNumberValidator(NaN).should.be.false;
        });

        it('should validate a null value correctly', () => {
            isNumberValidator(null).should.be.false;
        });

        it('should validate an undefined value correctly', () => {
            isNumberValidator(undefined).should.be.false;
        });

    });

});
