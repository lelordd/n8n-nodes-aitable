"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Aitable = void 0;
const n8n_workflow_1 = require("n8n-workflow");
class Aitable {
    constructor() {
        this.description = {
            displayName: 'Aitable',
            name: 'aitable',
            icon: 'file:aitable.svg',
            group: ['transform'],
            version: 1,
            subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
            description: 'Interact with Aitable API',
            defaults: {
                name: 'Aitable',
            },
            inputs: ['main'],
            outputs: ['main'],
            credentials: [
                {
                    name: 'aitableApi',
                    required: true,
                },
            ],
            properties: [
                {
                    displayName: 'Resource',
                    name: 'resource',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Space',
                            value: 'space',
                        },
                        {
                            name: 'Node',
                            value: 'node',
                        },
                        {
                            name: 'Datasheet',
                            value: 'datasheet',
                        },
                        {
                            name: 'Field',
                            value: 'field',
                        },
                    ],
                    default: 'space',
                },
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: {
                        show: {
                            resource: ['space'],
                        },
                    },
                    options: [
                        {
                            name: 'Get List of Spaces',
                            value: 'getSpaces',
                            action: 'Get list of spaces',
                        },
                    ],
                    default: 'getSpaces',
                },
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: {
                        show: {
                            resource: ['node'],
                        },
                    },
                    options: [
                        {
                            name: 'Get Node List',
                            value: 'getNodes',
                            action: 'Get node list',
                        },
                        {
                            name: 'Search Nodes',
                            value: 'searchNodes',
                            action: 'Search nodes',
                        },
                    ],
                    default: 'getNodes',
                },
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: {
                        show: {
                            resource: ['datasheet'],
                        },
                    },
                    options: [
                        {
                            name: 'Get All Records',
                            value: 'getAllRecords',
                            action: 'Get all records from a datasheet',
                        },
                        {
                            name: 'Get Views',
                            value: 'getViews',
                            action: 'Get views of a datasheet',
                        },
                        {
                            name: 'Create Records',
                            value: 'createRecords',
                            action: 'Create records in a datasheet',
                        },
                    ],
                    default: 'getAllRecords',
                },
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: {
                        show: {
                            resource: ['field'],
                        },
                    },
                    options: [
                        {
                            name: 'Get Fields',
                            value: 'getFields',
                            action: 'Get fields of a datasheet',
                        },
                    ],
                    default: 'getFields',
                },
                {
                    displayName: 'Space ID',
                    name: 'spaceId',
                    type: 'string',
                    default: '',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['node'],
                        },
                    },
                    description: 'The ID of the space',
                },
                {
                    displayName: 'Datasheet ID',
                    name: 'datasheetId',
                    type: 'string',
                    default: '',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['datasheet', 'field'],
                            operation: ['getAllRecords', 'getViews', 'getFields', 'createRecords'],
                        },
                    },
                    description: 'The ID of the datasheet',
                },
                {
                    displayName: 'View ID',
                    name: 'viewId',
                    type: 'string',
                    default: '',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['datasheet'],
                            operation: ['getAllRecords', 'createRecords'],
                        },
                    },
                    description: 'The ID of the view',
                },
                {
                    displayName: 'Records',
                    name: 'records',
                    type: 'fixedCollection',
                    typeOptions: {
                        multipleValues: true,
                    },
                    displayOptions: {
                        show: {
                            resource: ['datasheet'],
                            operation: ['createRecords'],
                        },
                    },
                    default: {},
                    options: [
                        {
                            name: 'record',
                            displayName: 'Record',
                            values: [
                                {
                                    displayName: 'Title',
                                    name: 'title',
                                    type: 'string',
                                    default: '',
                                    description: 'Title of the record',
                                },
                                {
                                    displayName: 'Long Text',
                                    name: 'longText',
                                    type: 'string',
                                    default: '',
                                    description: 'Long text content',
                                },
                                {
                                    displayName: 'Long Text 2',
                                    name: 'longText2',
                                    type: 'string',
                                    default: '',
                                    description: 'Additional long text content',
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        this.methods = {
            loadOptions: {
                async getFields() {
                    var _a;
                    try {
                        const credentials = await this.getCredentials('aitableApi');
                        if (!credentials) {
                            throw new Error('No credentials got returned!');
                        }
                        const datasheetId = this.getNodeParameter('datasheetId');
                        const options = {
                            method: 'GET',
                            url: `https://aitable.ai/fusion/v1/datasheets/${datasheetId}/fields`,
                            headers: {
                                'Authorization': `Bearer ${credentials.apiToken}`,
                                'Accept': 'application/json',
                            },
                            json: true,
                        };
                        if (!this.helpers) {
                            throw new Error('The request could not be completed because helpers are unavailable.');
                        }
                        const response = await this.helpers.httpRequest(options);
                        if (!(response === null || response === void 0 ? void 0 : response.success) || !((_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.fields)) {
                            throw new Error('Failed to load fields from Aitable API');
                        }
                        return response.data.fields.map((field) => ({
                            name: field.name,
                            value: field.name,
                            description: `Type: ${field.type}${field.isPrimary ? ' (Primary)' : ''}`,
                        }));
                    }
                    catch (error) {
                        throw new Error(`Error loading fields: ${error.message}`);
                    }
                },
            },
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const resource = this.getNodeParameter('resource', 0);
        const operation = this.getNodeParameter('operation', 0);
        for (let i = 0; i < items.length; i++) {
            try {
                let response;
                const credentials = await this.getCredentials('aitableApi');
                if (!credentials) {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'No credentials got returned!');
                }
                const options = {
                    headers: {
                        'Authorization': `Bearer ${credentials.apiToken}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    method: 'GET',
                    url: '',
                    json: true,
                };
                switch (resource) {
                    case 'space':
                        switch (operation) {
                            case 'getSpaces':
                                options.url = 'https://aitable.ai/fusion/v1/spaces';
                                break;
                            default:
                                throw new n8n_workflow_1.NodeOperationError(this.getNode(), `The operation "${operation}" is not supported!`);
                        }
                        break;
                    case 'node':
                        const spaceId = this.getNodeParameter('spaceId', i);
                        switch (operation) {
                            case 'getNodes':
                                options.url = `https://aitable.ai/fusion/v1/spaces/${spaceId}/nodes`;
                                break;
                            case 'searchNodes':
                                options.url = `https://aitable.ai/fusion/v2/spaces/${spaceId}/nodes?type=Datasheet&permissions=0,1`;
                                break;
                            default:
                                throw new n8n_workflow_1.NodeOperationError(this.getNode(), `The operation "${operation}" is not supported!`);
                        }
                        break;
                    case 'datasheet':
                        const datasheetId = this.getNodeParameter('datasheetId', i);
                        switch (operation) {
                            case 'getAllRecords':
                                const getAllViewId = this.getNodeParameter('viewId', i);
                                options.url = `https://aitable.ai/fusion/v1/datasheets/${datasheetId}/records?viewId=${getAllViewId}`;
                                break;
                            case 'getViews':
                                options.url = `https://aitable.ai/fusion/v1/datasheets/${datasheetId}/views`;
                                break;
                            case 'createRecords':
                                const viewId = this.getNodeParameter('viewId', i);
                                options.method = 'POST';
                                options.url = `https://aitable.ai/fusion/v1/datasheets/${datasheetId}/records?viewId=${viewId}&fieldKey=name`;
                                const recordsData = this.getNodeParameter('records.record', i, []);
                                const records = recordsData.map(record => ({
                                    fields: {
                                        "Title": record.title,
                                        "Long text": record.longText,
                                        "Long text 2": record.longText2
                                    }
                                }));
                                options.body = {
                                    records,
                                    fieldKey: "name"
                                };
                                break;
                            default:
                                throw new n8n_workflow_1.NodeOperationError(this.getNode(), `The operation "${operation}" is not supported!`);
                        }
                        break;
                    case 'field':
                        const fieldDatasheetId = this.getNodeParameter('datasheetId', i);
                        switch (operation) {
                            case 'getFields':
                                options.url = `https://aitable.ai/fusion/v1/datasheets/${fieldDatasheetId}/fields`;
                                break;
                            default:
                                throw new n8n_workflow_1.NodeOperationError(this.getNode(), `The operation "${operation}" is not supported!`);
                        }
                        break;
                    default:
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), `The resource "${resource}" is not supported!`);
                }
                if (!options.url) {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), `The operation "${operation}" is not supported!`);
                }
                if (!this.helpers) {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'The request could not be completed because helpers are unavailable.');
                }
                try {
                    response = await this.helpers.httpRequest(options);
                }
                catch (error) {
                    throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
                }
                returnData.push({ json: response });
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: error.message } });
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.Aitable = Aitable;
//# sourceMappingURL=Aitable.node.js.map