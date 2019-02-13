import { Request, Response } from 'express';
import { ControllerMetadata, ParameterDefinition } from 'giuseppe';

import { GiuseppeRequestParameter, Req } from '../src';

describe('@Req parameter', () => {

    it('should return a param decorator', () => {
        expect(Req()).toBeInstanceOf(Function);
        expect(Req().length).toBe(3);
    });

    it('should add the correct parameter declaration to the class', () => {
        class Ctrl {
            public func( @Req() req: Request): void { }
        }

        const meta = new ControllerMetadata(Ctrl.prototype);
        const ctrlParam = meta.parameters('func')[0];

        expect(ctrlParam).toBeInstanceOf(GiuseppeRequestParameter);
    });

    it('should inject the express request object', () => {
        const reqMock = ({} as any) as Request;
        const resMock = ({} as any) as Response;

        const param = new GiuseppeRequestParameter(0) as ParameterDefinition;
        expect(param.getValue(reqMock, resMock)).toBe(reqMock);
    });

});
