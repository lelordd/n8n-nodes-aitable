"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aitableApiRequest = void 0;
async function aitableApiRequest(method, endpoint, body = {}, qs = {}, apiVersion = 'v1') {
    const credentials = await this.getCredentials('aitableApi');
    if (!(credentials === null || credentials === void 0 ? void 0 : credentials.apiToken)) {
        throw new Error('No API token provided');
    }
    const options = {
        method,
        body,
        qs,
        url: `https://tbl.automatiser.com/fusion/${apiVersion}${endpoint}`,
        headers: {
            Authorization: `Bearer ${credentials.apiToken}`,
            'Content-Type': 'application/json',
        },
        json: true,
    };
    // Remove empty body or qs
    if (!Object.keys(body).length) {
        delete options.body;
    }
    if (!Object.keys(qs).length) {
        delete options.qs;
    }
    try {
        const response = (await this.helpers.httpRequest(options));
        if (!response.success) {
            throw new Error(`Aitable API Error: ${response.message}`);
        }
        return response;
    }
    catch (error) {
        throw new Error(`Aitable Error: ${error.message || 'Unknown error occurred'}`);
    }
}
exports.aitableApiRequest = aitableApiRequest;
//# sourceMappingURL=GenericFunctions.js.map