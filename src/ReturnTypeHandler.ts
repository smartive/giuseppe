import { ReturnType } from './routes/ReturnType';
import { Response } from 'express';

export class ReturnTypeHandler {
    private returnTypes: { [type: string]: ReturnType<any> } = {};
    
    constructor(types: ReturnType<any>[]) {
        for (const type of types) {
            this.returnTypes[type.type] = type;
        }
    }

    public handleValue(value: any, response: Response): void {
        const handler = value ? this.returnTypes[value.constructor.name] || this.returnTypes['default'] : this.returnTypes['default'];
        if (!handler) {
            throw new Error('no handl0r!');
        }

        response
            .status(handler.getStatus(value))
            .set(handler.getHeaders(value));
        
        if (value) {
            response.send(handler.getValue(value));
        }

        response.end();
    }
}
