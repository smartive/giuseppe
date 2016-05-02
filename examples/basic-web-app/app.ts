import {registerControllers} from '../../index';
import './controllers';
import express = require('express');

let app = express();

app.use(require('body-parser').json());
app.use(registerControllers('/api'));

app.listen(8080, () => {
    console.log('Up and running on port 8080');
});
