import {registerControllersFromFolder} from '../../controllers/ControllerDecorator';
import express = require('express');

let newman = require('newman');

let app = express();

app.use(require('body-parser').json());

registerControllersFromFolder({folderPath: './build/.test/integration/controllers'}, 'api')
    .then(router => {
        app.use(router);
        app.listen(8080, () => {
            let newmanOptions = {
                    envJson: {},
                    asLibrary: true,
                    stopOnError: false,
                    exitCode: true,
                    responseHandler: 'TestResponseHandler'
                },
                collection = require('../../../.test/integration/giuseppe.postman_collection.json');
            if (process.argv.indexOf('--no-newman') === -1) {
                newman.execute(collection, newmanOptions, process.exit);
            }
        });
    });
