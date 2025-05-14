"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApitableApi = void 0;
class ApitableApi {
    constructor() {
        this.name = 'apitableApi';
        this.displayName = 'Aitable API';
        this.documentationUrl = 'https://developers.aitable.ai/api/quick-start';
        this.properties = [
            {
                displayName: 'API Token',
                name: 'apiToken',
                type: 'string',
                default: '',
                required: true,
            },
        ];
    }
}
exports.ApitableApi = ApitableApi;
//# sourceMappingURL=ApitableApi.credentials.js.map