import {Get} from '../../../../routes/RouteDecorators';
import {Controller} from '../../../../controllers/ControllerDecorator';
import {Demo} from '../../models/Demo';

@Controller('products')
export class ProductController {
    private products: Demo[] = [];

    @Get()
    public getProducts(): Demo[] {
        return this.products;
    }
}
