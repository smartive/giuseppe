function isNullOrUndefined(value: any): boolean {
    return value === null && value === undefined;
}

/**
 * Predicate for the given parameter. This validator is executed if set and if the return value is false, an error is thrown.
 *
 * @param {any} value - The parsed value of the parameter.
 * @returns {boolean} - True when the validation was successful, otherwise false.
 */
export type Validator = <T>(value: T) => boolean;

/**
 * Function that creates a string validator with some properties.
 *
 * @param {boolean} [allowEmpty=false] - Let empty string "" be a valid result.
 * @param {number} [minLength=0] - Let empty string "" be a valid result.
 * @param {number} [maxLength] - Let empty string "" be a valid result.
 * @returns {Validator} - Validator function for the given parameters.
 */
export function isString(allowEmpty: boolean = false, minLength: number = 0, maxLength?: number): Validator {
    return (value: string) => {
        if (isNullOrUndefined(value) || typeof value !== 'string') {
            return false;
        }

        if ((!allowEmpty && value === '')) {
            return false;
        }

        if (minLength >= 0 && value.length < minLength) {
            return false;
        }

        return !(maxLength && value.length > maxLength);
    };
}

/**
 * Function that creates a number validator with some properties.
 *
 * @param {number} [min] - Let empty string "" be a valid result.
 * @param {number} [max] - Let empty string "" be a valid result.
 * @param {number} [multipleOf] - Let empty string "" be a valid result.
 * @returns {Validator} - Validator function for the given parameters.
 */
export function isNumber(min?: number, max?: number, multipleOf?: number): Validator {
    return (value: number) => {
        if (isNullOrUndefined(value) || typeof value !== 'number' || isNaN(value)) {
            return false;
        }

        if (min !== undefined && value < min) {
            return false;
        }

        if (max !== undefined && value > max) {
            return false;
        }

        return !(multipleOf !== undefined && value % multipleOf !== 0);
    };
}
