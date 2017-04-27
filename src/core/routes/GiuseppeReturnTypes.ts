import { ReturnTypeHandler, ReturnType } from '../../routes/ReturnTypeHandler';

class Foobar {}

export class GiuseppeStringReturnType implements ReturnTypeHandler {
    public type: ReturnType = Foobar;
}
