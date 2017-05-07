import 'reflect-metadata';
import { ReturnType } from '../../routes/ReturnType';
import * as httpStatus from 'http-status';

export class JsonDefaultReturnType implements ReturnType<any> {
    public type: string = 'default';

    public getHeaders(): { [field: string]: string; } {
        return {
            'Content-Type': 'application/json',
        };
    }

    public getStatus(value: any): number {
        if (value) {
            return httpStatus.OK;
        }
        return httpStatus.NO_CONTENT;
    }

    public getValue(value: any): string {
        return JSON.stringify(value);
    }
}
