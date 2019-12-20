import { Giuseppe } from 'giuseppe';

import { GiuseppeVersionPlugin } from '../src';

describe('GiuseppeVersionPlugin', () => {

    it('should return the constructor name', () => {
        const plugin = new GiuseppeVersionPlugin();

        expect(plugin.name).toBe('GiuseppeVersionPlugin');
    });

    it('should register itself in giuseppe', () => {
        const plugin = new GiuseppeVersionPlugin();
        const giuseppe = new Giuseppe();

        giuseppe.registerPlugin(plugin);

        expect((giuseppe as any).plugins.some(p => p.name === 'GiuseppeVersionPlugin')).toBeTruthy();
    });

});
