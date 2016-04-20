/**
 * Validator that checks if the constructor of a given value is "String".
 *
 * @param {any} value - Value to check.
 * @returns {boolean} - True if the constructor of the given value is "String", otherwise false.
 */
export function IsStringValidator(value: any): boolean {
    return value !== null && value !== undefined && value.constructor === String;
}

/**
 * Validator that checks if the constructor of a given value is "Number" and the value is not NaN.
 *
 * @param {any} value - Value to check.
 * @returns {boolean} - True if the constructor of the given value is "Number" and the value is not NaN, otherwise false.
 */
export function IsNumberValidator(value: any): boolean {
    return value !== null && value !== undefined && value.constructor === Number && !isNaN(value);
}
