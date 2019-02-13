import { Request, Response } from 'express';
import { ControllerMetadata, ParameterDefinition } from 'giuseppe';

import { GiuseppeResponseParameter, Res } from '../src';

describe('@Res parameter', () => {

    it('should return a param decorator', () => {
        expect(Res()).toBeInstanceOf(Function);
        expect(Res().length).toBe(3);
    });

    it('should add the correct parameter declaration to the class', () => {
        class Ctrl {
            public func( @Res() res: Response): void { }
        }

        const meta = new ControllerMetadata(Ctrl.prototype);
        const ctrlParam = meta.parameters('func')[0];

        expect(ctrlParam).toBeInstanceOf(GiuseppeResponseParameter);
    });

    it('should inject the express request object', () => {
        const reqMock = ({} as any) as Request;
        const resMock = ({} as any) as Response;

        const param = new GiuseppeResponseParameter(0) as ParameterDefinition;
        expect(param.getValue(reqMock, resMock)).toBe(resMock);
    });

});
