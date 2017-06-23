/**
 * Return type handler. This element registers a hander for specific return types. When an object is received from
 * a route function, it's constructor name is checked against all various registered return type handler. When no one
 * is found, giuseppe throws an error, otherwise the registered handler (or the default) will be used.
 * 
 * @export
 * @interface ReturnType
 * @template T 
 */
export interface ReturnType<T> {
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
     * @param {T} [value] 
     * @returns {{ [field: string]: string }} 
     * @memberof ReturnType
     */
    getHeaders(value?: T): { [field: string]: string };

    /**
     * Get the return http status code for the given value.
     * 
     * @param {T} [value] 
     * @returns {number} 
     * @memberof ReturnType
     */
    getStatus(value?: T): number;

    /**
     * Get the stringified value for a given value. This value is sent by express with the set headers and
     * status codes. This function is only called if an actual value exists.
     * 
     * @param {T} value 
     * @returns {string} 
     * @memberof ReturnType
     */
    getValue(value: T): string;
}
