export namespace Validators {
    export type Validator = (value: any) => boolean;

    /**
     * Function that creates a string validator with some properties.
     *
     * @param {boolean} [allowEmpty=false] - Let empty string "" be a valid result.
     * @param {number} [minLength=0] - Let empty string "" be a valid result.
     * @param {number} [maxLength] - Let empty string "" be a valid result.
     * @returns {Validator} - Validator function for the given parameters.
     */
    export function isString(allowEmpty: boolean = false, minLength: number = 0, maxLength?: number): Validator {
        return (value: any) => {
            if (!nullCheck(value) || typeof value !== 'string') {
                return false;
            }

            let str: string = value;

            if ((!allowEmpty && str === '')) {
                return false;
            }

            if (minLength >= 0 && str.length < minLength) {
                return false;
            }

            return !(maxLength && str.length > maxLength);
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
        return (value: any) => {
            if (!nullCheck(value) || typeof value !== 'number') {
                return false;
            }

            let nr: number = value;

            if (min !== undefined && nr < min) {
                return false;
            }

            if (max !== undefined && nr > max) {
                return false;
            }

            return !(multipleOf !== undefined && nr % multipleOf !== 0);
        };
    }

    function nullCheck(value: any): boolean {
        return value !== null && value !== undefined;
    }

}
