import {registerControllersFromFolder} from '../../index';
import express = require('express');

let app = express();

app.use(require('body-parser').json());

registerControllersFromFolder({ folderPath: './controllers', recursive: true }).then(router => {
    app.use(router);

    app.listen(8080, () => {
        console.log('Up and running on port 8080');
    });

});
