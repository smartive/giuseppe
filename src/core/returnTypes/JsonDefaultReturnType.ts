import 'reflect-metadata';
import { ReturnType } from '../../routes/ReturnType';
import * as httpStatus from 'http-status';

const jsonHeader = {
    'Content-Type': 'application/json',
};

export class JsonDefaultReturnType implements ReturnType<any> {
    public type: string = 'default';

    public getHeaders(): { [field: string]: string; } {
        return jsonHeader;
    }

    public getStatus(value: any): number {
        if (value === undefined || value === null) {
            return httpStatus.NO_CONTENT;
        }
        return httpStatus.OK;
    }

    public getValue(value: any): string {
        return JSON.stringify(value);
    }
}
