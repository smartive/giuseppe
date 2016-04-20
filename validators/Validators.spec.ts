import chai = require('chai');
import sinon = require('sinon');
import sinonChai = require('sinon-chai');
import {IsStringValidator, IsNumberValidator} from './Validators';

let should = chai.should();
chai.use(sinonChai);

describe('Validators', () => {

    describe('String validator', () => {

        it('should validate a string correctly', () => {
            IsStringValidator('a string').should.be.true;
        });

        it('should validate an empty string correctly', () => {
            IsStringValidator('').should.be.true;
        });

        it('should validate a non string correctly', () => {
            IsStringValidator(1).should.be.false;
            IsStringValidator(NaN).should.be.false;
            IsStringValidator({}).should.be.false;
            IsStringValidator([]).should.be.false;
        });

        it('should validate a null value correctly', () => {
            IsStringValidator(null).should.be.false;
        });

        it('should validate an undefined value correctly', () => {
            IsStringValidator(undefined).should.be.false;
        });

    });

    describe('Number validator', () => {

        it('should validate a number correctly', () => {
            IsNumberValidator(1).should.be.true;
        });

        it('should validate a non number correctly', () => {
            IsNumberValidator('a string').should.be.false;
        });

        it('should validate a NaN correctly', () => {
            IsNumberValidator(NaN).should.be.false;
        });

        it('should validate a null value correctly', () => {
            IsNumberValidator(null).should.be.false;
        });

        it('should validate an undefined value correctly', () => {
            IsNumberValidator(undefined).should.be.false;
        });

    });

});
