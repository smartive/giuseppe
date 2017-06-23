import 'reflect-metadata';

import * as httpStatus from 'http-status';

import { ReturnType } from '../../routes/ReturnType';

/**
 * Definition of the json headers.
 */
const jsonHeader = {
    'Content-Type': 'application/json',
};

/**
 * Return type handler for the default return values. Does convert everything into JSON and returns the stringified
 * value to giuseppe and therefore express. If no value is provided, httpStatus.NO_CONTENT (204) is set, otherwise OK (200).
 * 
 * @export
 * @class JsonDefaultReturnType
 * @implements {ReturnType<any>}
 */
export class JsonDefaultReturnType implements ReturnType<any> {
    public type: string = 'default';

    public getHeaders(): { [field: string]: string; } {
        return jsonHeader;
    }

    public getStatus(value?: any): number {
        if (value === undefined || value === null) {
            return httpStatus.NO_CONTENT;
        }
        return httpStatus.OK;
    }

    public getValue(value: any): string {
        return JSON.stringify(value);
    }
}
