import { 
    IExecuteFunctions,
    ILoadOptionsFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeApiError,
    NodeOperationError,
    IHttpRequestOptions,
    IDataObject,
} from 'n8n-workflow';

export class Aitable implements INodeType {
    description: INodeTypeDescription = {
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
                        operation: ['getAllRecords'],
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
                        name: 'recordsValues',
                        displayName: 'Record',
                        values: [
                            {
                                displayName: 'Fields',
                                name: 'fields',
                                type: 'collection',
                                typeOptions: {
                                    multipleValues: false,
                                },
                                default: {},
                                options: [
                                    {
                                        displayName: 'Field Names or IDs',
                                        name: 'fieldNames',
                                        type: 'multiOptions',
                                        typeOptions: {
                                            loadOptionsMethod: 'getFields',
                                        },
                                        default: [],
                                        description: 'Choose from the list of fields in your datasheet',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    };

    methods = {
        loadOptions: {
            async getFields(this: ILoadOptionsFunctions) {
                const datasheetId = this.getNodeParameter('datasheetId') as string;
                const credentials = await this.getCredentials('aitableApi');

                if (!credentials) {
                    throw new Error('No credentials provided!');
                }

                const options: IHttpRequestOptions = {
                    headers: {
                        'Authorization': `Bearer ${credentials.apiToken}`,
                        'Accept': 'application/json',
                    },
                    method: 'GET',
                    url: `https://aitable.ai/fusion/v1/datasheets/${datasheetId}/fields`,
                    json: true,
                };

                try {
                    const response = await this.helpers?.request?.(options);
                    const fields = response?.fields || [];

                    return fields.map((field: any) => ({
                        name: field.name,
                        value: field.id,
                    }));
                } catch (error) {
                    throw new Error(`Error loading fields: ${error}`);
                }
            },
        },
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];
        const resource = this.getNodeParameter('resource', 0) as string;
        const operation = this.getNodeParameter('operation', 0) as string;

        for (let i = 0; i < items.length; i++) {
            try {
                let response;
                const credentials = await this.getCredentials('aitableApi');

                if (!credentials) {
                    throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
                }

                const options: IHttpRequestOptions = {
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
                                throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not supported!`);
                        }
                        break;

                    case 'node':
                        const spaceId = this.getNodeParameter('spaceId', i) as string;
                        switch (operation) {
                            case 'getNodes':
                                options.url = `https://aitable.ai/fusion/v1/spaces/${spaceId}/nodes`;
                                break;
                            case 'searchNodes':
                                options.url = `https://aitable.ai/fusion/v2/spaces/${spaceId}/nodes?type=Datasheet&permissions=0,1`;
                                break;
                            default:
                                throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not supported!`);
                        }
                        break;

                    case 'datasheet':
                        const datasheetId = this.getNodeParameter('datasheetId', i) as string;
                        switch (operation) {
                            case 'getAllRecords':
                                const viewId = this.getNodeParameter('viewId', i) as string;
                                options.url = `https://aitable.ai/fusion/v1/datasheets/${datasheetId}/records?viewId=${viewId}`;
                                break;
                            case 'getViews':
                                options.url = `https://aitable.ai/fusion/v1/datasheets/${datasheetId}/views`;
                                break;
                            case 'createRecords':
                                options.method = 'POST';
                                options.url = `https://aitable.ai/fusion/v1/datasheets/${datasheetId}/records`;
                                const records = this.getNodeParameter('records.recordsValues', i, []) as IDataObject[];
                                options.body = {
                                    records: records.map((record) => ({
                                        fields: record.fields,
                                    })),
                                };
                                break;
                            default:
                                throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not supported!`);
                        }
                        break;

                    case 'field':
                        const fieldDatasheetId = this.getNodeParameter('datasheetId', i) as string;
                        switch (operation) {
                            case 'getFields':
                                options.url = `https://aitable.ai/fusion/v1/datasheets/${fieldDatasheetId}/fields`;
                                break;
                            default:
                                throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not supported!`);
                        }
                        break;

                    default:
                        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported!`);
                }

                if (!options.url) {
                    throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not supported!`);
                }

                try {
                    response = await this.helpers?.request?.(options);
                } catch (error) {
                    throw new NodeApiError(this.getNode(), error);
                }

                returnData.push({ json: response });
            } catch (error) {
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
