function isNullOrUndefined(value: any): boolean {
    return value === null || value === undefined;
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
 * @param {number} [minLength] - Minimum length of the string.
 * @param {number} [maxLength] - Maximum length of the string.
 * @returns {Validator} - Validator function for the given parameters.
 */
export function isString({allowEmpty = false, minLength, maxLength}: {allowEmpty?: boolean, minLength?: number, maxLength?: number} = {}): Validator {
    return (value: string) => {
        if (isNullOrUndefined(value) || typeof value !== 'string') {
            return false;
        }

        if ((!allowEmpty && value === '')) {
            return false;
        }

        if (minLength && value.length < minLength) {
            return false;
        }

        return !(maxLength && value.length > maxLength);
    };
}

/**
 * Function that creates a number validator with some properties.
 *
 * @param {number} [min] - Lowest possible value.
 * @param {number} [max] - Highest possible value.
 * @param {number} [multipleOf] - The value must be a multiple of this (i.e. value mod multipleOf === 0).
 * @returns {Validator} - Validator function for the given parameters.
 */
export function isNumber({min, max, multipleOf}: {min?: number, max?: number, multipleOf?: number} = {}): Validator {
    return (value: number) => {
        if (isNullOrUndefined(value) || typeof value !== 'number' || isNaN(value)) {
            return false;
        }

        if (!isNullOrUndefined(min) && value < min) {
            return false;
        }

        if (!isNullOrUndefined(max) && value > max) {
            return false;
        }

        return !(!isNullOrUndefined(multipleOf) && value % multipleOf !== 0);
    };
}
