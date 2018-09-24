'use strict';

const logger = require('./lib/logger');

const brotli = require('./lib/brotli/middleware');
const gzip = require('./lib/gzip/middleware');
const imagemin = require('./lib/imagemin/middleware');
const webpAccept = require('./lib/webp-accept/middleware');
const webpUrl = require('./lib/webp-url/middleware');

const middleware = [gzip, brotli, webpAccept, webpUrl, imagemin];

/**
 * Origin Request CloudFront event handler.
 */
exports.handler = async (event, context, callback) => {
    const request = event.Records[0].cf.request;

    let response = null;

    try {
        for (let i = 0; i < middleware.length; i++) {
            const middlewareResponse = await middleware[i](request, response);
            if (middlewareResponse) {
                response = middlewareResponse;
            }
        }
    } catch (error) {
        logger.error(error);
        response = null;
    }

    // Bypass lambda if no response was generated or error occurred.
    if (response === null) {
        response = request;
    }

    callback(null, response);
};
