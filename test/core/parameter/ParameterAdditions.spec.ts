import { isArray, isNumber, isString } from '../../../src/core/parameters/ParameterAdditions';

describe('Validators', () => {

    describe('String validator', () => {

        it('should validate a string correctly', () => {
            expect(isString()('a string')).toBeTruthy();
        });

        it('should validate an empty string correctly', () => {
            expect(isString()('')).toBeFalsy();
            expect(isString({ allowEmpty: true })('')).toBeTruthy();
        });

        it('should validate a non string correctly', () => {
            expect(isString()(1)).toBeFalsy();
            expect(isString()(NaN)).toBeFalsy();
            expect(isString()({})).toBeFalsy();
            expect(isString()([])).toBeFalsy();
        });

        it('should validate a null value correctly', () => {
            expect(isString()(null)).toBeFalsy();
        });

        it('should validate an undefined value correctly', () => {
            expect(isString()(undefined)).toBeFalsy();
        });

        it('should validator min length correctly', () => {
            expect(isString({ min: 3 })('aaa')).toBeTruthy();
            expect(isString({ min: 4 })('aaa')).toBeFalsy();
        });

        it('should validator max length correctly', () => {
            expect(isString({ max: 3 })('aaa')).toBeTruthy();
            expect(isString({ max: 2 })('aaa')).toBeFalsy();
        });

    });

    describe('Number validator', () => {

        it('should validate a number correctly', () => {
            expect(isNumber()(1)).toBeTruthy();
        });

        it('should validate a non number correctly', () => {
            expect(isNumber()('a string')).toBeFalsy();
        });

        it('should validate a NaN correctly', () => {
            expect(isNumber()(NaN)).toBeFalsy();
        });

        it('should validate a null value correctly', () => {
            expect(isNumber()(null)).toBeFalsy();
        });

        it('should validate an undefined value correctly', () => {
            expect(isNumber()(undefined)).toBeFalsy();
        });

        it('should validate min correctly', () => {
            expect(isNumber({ min: 4 })(4)).toBeTruthy();
            expect(isNumber({ min: 5 })(4)).toBeFalsy();
        });

        it('should validate max correctly', () => {
            expect(isNumber({ max: 4 })(4)).toBeTruthy();
            expect(isNumber({ max: 3 })(4)).toBeFalsy();
        });

        it('should validate multipleOf correctly', () => {
            expect(isNumber({ multipleOf: 4 })(4)).toBeTruthy();
            expect(isNumber({ multipleOf: 5 })(4)).toBeFalsy();
        });

    });

    describe('Array validator', () => {

        it('should validate an array correctly', () => {
            expect(isArray()([])).toBeTruthy();
        });

        it('should validate a non array correctly', () => {
            expect(isArray()('a string')).toBeFalsy();
        });

        it('should validate a null value correctly', () => {
            expect(isArray()(null)).toBeFalsy();
        });

        it('should validate an undefined value correctly', () => {
            expect(isArray()(undefined)).toBeFalsy();
        });

        it('should validate min correctly', () => {
            expect(isArray({ min: 4 })([1, 2, 3, 4])).toBeTruthy();
            expect(isArray({ min: 5 })([1, 2, 3, 4])).toBeFalsy();
        });

        it('should validate max correctly', () => {
            expect(isArray({ max: 4 })([1, 2, 3, 4])).toBeTruthy();
            expect(isArray({ max: 3 })([1, 2, 3, 4])).toBeFalsy();
        });

        it('should validate type correctly', () => {
            expect(isArray({ type: Number })([1, 2, 3])).toBeTruthy();
            expect(isArray({ type: Number })([1, 2, '3'])).toBeFalsy();
        });

        it('should validate multiple types correctly', () => {
            expect(isArray({ type: [Number, String] })([1, 2, '3'])).toBeTruthy();
            expect(isArray({ type: [Number, String] })([1, {}, '3'])).toBeFalsy();
        });

        it('should validate a validator correctly', () => {
            expect(isArray({ validator: isString({ min: 3 }) })(['aaa', 'bbb', 'ccc'])).toBeTruthy();
            expect(isArray({ validator: isString({ min: 3 }) })(['aaa', 'bb', 'ccc'])).toBeFalsy();
        });

        it('should validate multiple validators correctly', () => {
            expect(isArray({ validator: [isString({ min: 3 }), isString({ max: 5 })] })(['aaa', 'bbb', 'ccc'])).toBeTruthy();
            expect(isArray({ validator: [isString({ min: 3 }), isString({ max: 5 })] })(['aaa', 'bbbbbb', 'ccc']))
                .toBeFalsy();
        });

    });

});
