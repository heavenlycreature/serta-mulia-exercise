const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const InputError = require('../exceptions/InputError');
const loadModel = require('../inference/loadModel');
require('dotenv').config();

(async () => {

    
    const server = Hapi.server({
        port: 3000,
        host: '0.0.0.0',
        routes: {
            cors: {
                origin: ['*'],
            }
        }
    })
    const model = await loadModel();
    server.app.model = model;

    server.route(routes);

    server.ext('onPreResponse', function (req, h) {
        const response = req.response;

        if (response instanceof InputError) {
            const newResponse = h.response({
                status: 'fail',
                message: `${response.message} silahkan gunakan foto lain`
            });
            newResponse.code(502);
            return newResponse;
        }
        if (response.isBoom) {
            const newResponse = h.response({
                status: 'fail',
                message: `${response.message}`
            });
            newResponse.code(500);
            return newResponse;
        }
        return h.continue;
    })

    await server.start();
    console.log(`Server berjalan pada port: ${server.info.uri}`);
})()