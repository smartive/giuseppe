/**
 * Return type handler. This element registers a hander for specific return types. When an object is received from
 * a route function, it's constructor name is checked against all various registered return type handler. When no one
 * is found, giuseppe throws an error, otherwise the registered handler (or the default) will be used.
 *
 * @export
 * @interface ReturnType
 * @template TValue Type for the incomming value
 * @template TResult Type for the returned value of the `getValue` function
 */
export interface ReturnType<TValue, TResult = string> {
    /**
     * The name of the type that is handled. This can be 'String', 'Number', or anything else.
     * One special name is possible: 'default'. The default is used whenever no other types that matches are found.
     *
     * @type {string}
     * @memberof ReturnType
     */
    type: string;

    /**
     * Returns the headers for the given value. The function must return something. Even if it's an empty header hash.
     *
     * @param {TValue} [value]
     * @returns {{ [field: string]: string }}
     * @memberof ReturnType
     */
    getHeaders(value?: TValue): { [field: string]: string };

    /**
     * Get the return http status code for the given value.
     *
     * @param {TValue} [value]
     * @returns {number}
     * @memberof ReturnType
     */
    getStatus(value?: TValue): number;

    /**
     * Get the stringified value for a given value. This value is sent by express with the set headers and
     * status codes. This function is only called if an actual value exists.
     *
     * @param {TValue} value
     * @returns {string}
     * @memberof ReturnType
     */
    getValue(value: TValue): TResult;
}
