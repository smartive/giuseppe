export const PARAMETER_DEFINITION_KEY: string = 'giuseppe:ParameterDefinition';

export interface ParameterDefinition {
    readonly name: string;
    readonly type: Function;
    readonly index: number;
}
