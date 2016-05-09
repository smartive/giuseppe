import chai = require('chai');
import sinon = require('sinon');
import sinonChai = require('sinon-chai');
import {isString, isNumber, isArray} from './Validators';

let should = chai.should();
chai.use(sinonChai);

describe('Validators', () => {

    describe('String validator', () => {

        it('should validate a string correctly', () => {
            isString()('a string').should.be.true;
        });

        it('should validate an empty string correctly', () => {
            isString()('').should.be.false;
            isString({allowEmpty: true})('').should.be.true;
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

        it('should validator min length correctly', () => {
            isString({min: 3})('aaa').should.be.true;
            isString({min: 4})('aaa').should.be.false;
        });

        it('should validator max length correctly', () => {
            isString({max: 3})('aaa').should.be.true;
            isString({max: 2})('aaa').should.be.false;
        });

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

        it('should validate min correctly', () => {
            isNumber({min: 4})(4).should.be.true;
            isNumber({min: 5})(4).should.be.false;
        });

        it('should validate max correctly', () => {
            isNumber({max: 4})(4).should.be.true;
            isNumber({max: 3})(4).should.be.false;
        });

        it('should validate multipleOf correctly', () => {
            isNumber({multipleOf: 4})(4).should.be.true;
            isNumber({multipleOf: 5})(4).should.be.false;
        });

    });

    describe('Array validator', () => {

        it('should validate an array correctly', () => {
            isArray()([]).should.be.true;
        });

        it('should validate a non array correctly', () => {
            isArray()('a string').should.be.false;
        });

        it('should validate a null value correctly', () => {
            isArray()(null).should.be.false;
        });

        it('should validate an undefined value correctly', () => {
            isArray()(undefined).should.be.false;
        });

        it('should validate min correctly', () => {
            isArray({min: 4})([1, 2, 3, 4]).should.be.true;
            isArray({min: 5})([1, 2, 3, 4]).should.be.false;
        });

        it('should validate max correctly', () => {
            isArray({max: 4})([1, 2, 3, 4]).should.be.true;
            isArray({max: 3})([1, 2, 3, 4]).should.be.false;
        });

        it('should validate type correctly', () => {
            isArray({type: Number})([1, 2, 3]).should.be.true;
            isArray({type: Number})([1, 2, '3']).should.be.false;
        });

    });

});
