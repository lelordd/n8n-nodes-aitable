"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apitableApiRequest = void 0;
async function apitableApiRequest(method, endpoint, body = {}, qs = {}, apiVersion = 'v1') {
    const credentials = await this.getCredentials('apitableApi');
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
        const response = await this.helpers.httpRequest(options);
        if (!response.success) {
            throw new Error(`Aitable API Error: ${response.message}`);
        }
        return response;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(`Aitable Error: ${errorMessage}`);
    }
}
exports.apitableApiRequest = apitableApiRequest;
//# sourceMappingURL=GenericFunctions.js.map