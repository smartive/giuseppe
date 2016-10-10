import 'reflect-metadata';
import { Configuration } from './Configuration';
import { injectable } from 'inversify';

@injectable()
export class InitialConfiguration implements Configuration {
    public versionHeaderName = 'Accept-Version';
}
