export const RETURN_TYPE_HANDLER_KEY = 'giuseppe:ReturnTypeHandler';

export type ReturnType = StringConstructor | BooleanConstructor | NumberConstructor | ObjectConstructor | (new () => object);

export interface ReturnTypeHandler {
    type: ReturnType;
}
