import { GiuseppeReqResPlugin } from '../../../src';
import { GiuseppeRequestParameter } from '../../../src/plugins/request-response/Req';
import { GiuseppeResponseParameter } from '../../../src/plugins/request-response/Res';

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
