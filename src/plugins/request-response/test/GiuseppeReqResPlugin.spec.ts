import { GiuseppeReqResPlugin, GiuseppeRequestParameter, GiuseppeResponseParameter } from '../src';

describe('GiuseppeReqResPlugin', () => {

    it('should return the constructor name', () => {
        const plugin = new GiuseppeReqResPlugin();

        expect(plugin.name).toBe('GiuseppeReqResPlugin');
    });

    it('should contain the res and req parameter', () => {
        const plugin = new GiuseppeReqResPlugin();
        plugin.initialize();

        expect(plugin.parameterDefinitions).toContain(GiuseppeRequestParameter);
        expect(plugin.parameterDefinitions).toContain(GiuseppeResponseParameter);
    });

});
