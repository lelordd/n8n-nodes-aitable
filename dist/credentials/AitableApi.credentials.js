"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AitableApi = void 0;
class AitableApi {
    constructor() {
        this.name = 'aitableApi';
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
exports.AitableApi = AitableApi;
//# sourceMappingURL=AitableApi.credentials.js.map