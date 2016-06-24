import {registerControllers} from '../../controllers/ControllerDecorator';
import './controllers/controller';
import express = require('express');

let newman = require('newman');

let app = express();

app.use(require('body-parser').json());
app.use(registerControllers('/api'));

app.listen(8080, () => {
    console.log('Up and running on port 8080');
});
