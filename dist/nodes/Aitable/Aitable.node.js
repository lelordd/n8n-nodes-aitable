"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Aitable = void 0;
// Node implementation
class Aitable {
    constructor() {
        this.description = {
            displayName: 'Aitable',
            name: 'aitable',
            icon: 'file:aitable-newlogo.png',
            group: ['transform'],
            version: 1,
            description: 'Interact with the Aitable API',
            defaults: {
                name: 'Aitable',
            },
            inputs: ["main" /* NodeConnectionType.Main */],
            outputs: ["main" /* NodeConnectionType.Main */],
            credentials: [
                {
                    name: 'aitableApi',
                    required: true,
                },
            ],
            properties: [
                // Resource
                {
                    displayName: 'Resource',
                    name: 'resource',
                    type: 'options',
                    options: [
                        {
                            name: 'Record',
                            value: 'record',
                        },
                    ],
                    default: 'record',
                    required: true,
                },
                // Operation
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    options: [
                        {
                            name: 'Create',
                            value: 'create',
                            description: 'Create a record',
                            action: 'Create a record',
                        },
                        {
                            name: 'Update',
                            value: 'update',
                            description: 'Update a record',
                            action: 'Update a record',
                        },
                        {
                            name: 'Delete',
                            value: 'delete',
                            description: 'Delete a record',
                            action: 'Delete a record',
                        },
                        {
                            name: 'Get',
                            value: 'get',
                            description: 'Get a record',
                            action: 'Get a record',
                        },
                        {
                            name: 'Get All',
                            value: 'getAll',
                            description: 'Get all records',
                            action: 'Get all records',
                        },
                        {
                            name: 'Search',
                            value: 'search',
                            description: 'Search records',
                            action: 'Search records',
                        },
                    ],
                    default: 'create',
                    displayOptions: {
                        show: {
                            resource: ['record'],
                        },
                    },
                },
                // Datasheet ID
                {
                    displayName: 'Datasheet',
                    name: 'datasheetId',
                    type: 'options',
                    typeOptions: {
                        loadOptionsMethod: 'getDatasheets',
                    },
                    required: true,
                    default: '',
                    displayOptions: {
                        show: {
                            resource: ['record'],
                        },
                    },
                    description: 'Select the datasheet to operate on',
                },
                // Record ID (for get, update, delete)
                {
                    displayName: 'Record ID',
                    name: 'recordId',
                    type: 'string',
                    default: '',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['record'],
                            operation: ['get', 'update', 'delete'],
                        },
                    },
                    description: 'The ID of the record',
                },
                // Fields (for create, update, search)
                {
                    displayName: 'Fields',
                    name: 'fieldsUi',
                    type: 'fixedCollection',
                    typeOptions: {
                        multipleValues: true,
                    },
                    displayOptions: {
                        show: {
                            resource: ['record'],
                            operation: ['create', 'update', 'search'],
                        },
                    },
                    placeholder: 'Add Field',
                    default: {},
                    options: [
                        {
                            name: 'fieldValues',
                            displayName: 'Field',
                            values: [
                                {
                                    displayName: 'Field',
                                    name: 'field',
                                    type: 'options',
                                    typeOptions: {
                                        loadOptionsMethod: 'getFields',
                                        loadOptionsDependsOn: ['datasheetId'],
                                    },
                                    default: '',
                                    description: 'Select the field',
                                },
                                {
                                    displayName: 'Value',
                                    name: 'value',
                                    type: 'string',
                                    default: '',
                                    description: 'Set the value of the field',
                                },
                            ],
                        },
                    ],
                },
                // Additional Options (for getAll)
                {
                    displayName: 'Additional Options',
                    name: 'additionalOptions',
                    type: 'collection',
                    displayOptions: {
                        show: {
                            resource: ['record'],
                            operation: ['getAll'],
                        },
                    },
                    default: {},
                    options: [
                        {
                            displayName: 'Limit',
                            name: 'limit',
                            type: 'number',
                            typeOptions: {
                                minValue: 1,
                            },
                            default: 100,
                            description: 'Max number of results to return',
                        },
                        {
                            displayName: 'Return All',
                            name: 'returnAll',
                            type: 'boolean',
                            default: false,
                            description: 'Whether to return all results or only up to the limit',
                        },
                    ],
                },
            ],
        };
        this.methods = {
            loadOptions: {
                // Load Datasheets
                async getDatasheets() {
                    var _a, _b;
                    const response = await this.helpers.request({
                        method: 'GET',
                        url: 'https://tbl.automatiser.com/fusion/v1/spaces',
                        headers: {
                            Authorization: `Bearer ${(await this.getCredentials('aitableApi')).apiToken}`,
                        },
                        json: true,
                    });
                    const datasheetOptions = [];
                    if ((response === null || response === void 0 ? void 0 : response.success) && ((_a = response.data) === null || _a === void 0 ? void 0 : _a.spaces)) {
                        for (const space of response.data.spaces) {
                            const datasheetsResponse = await this.helpers.request({
                                method: 'GET',
                                url: `https://tbl.automatiser.com/fusion/v2/spaces/${space.id}/nodes`,
                                qs: { type: 'Datasheet' },
                                headers: {
                                    Authorization: `Bearer ${(await this.getCredentials('aitableApi')).apiToken}`,
                                },
                                json: true,
                            });
                            if ((datasheetsResponse === null || datasheetsResponse === void 0 ? void 0 : datasheetsResponse.success) && ((_b = datasheetsResponse.data) === null || _b === void 0 ? void 0 : _b.nodes)) {
                                for (const datasheet of datasheetsResponse.data.nodes) {
                                    datasheetOptions.push({
                                        name: `${datasheet.name} (Space: ${space.name})`,
                                        value: datasheet.id,
                                    });
                                }
                            }
                        }
                    }
                    return datasheetOptions;
                },
                // Load Fields
                async getFields() {
                    var _a;
                    const datasheetId = this.getNodeParameter('datasheetId');
                    const response = await this.helpers.request({
                        method: 'GET',
                        url: `https://tbl.automatiser.com/fusion/v1/datasheets/${datasheetId}/fields`,
                        headers: {
                            Authorization: `Bearer ${(await this.getCredentials('aitableApi')).apiToken}`,
                        },
                        json: true,
                    });
                    const fieldOptions = [];
                    if ((response === null || response === void 0 ? void 0 : response.success) && ((_a = response.data) === null || _a === void 0 ? void 0 : _a.fields)) {
                        for (const field of response.data.fields) {
                            fieldOptions.push({
                                name: field.name,
                                value: field.name,
                            });
                        }
                    }
                    return fieldOptions;
                },
            },
        };
    }
    async execute() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const items = this.getInputData();
        const returnData = [];
        const credentials = await this.getCredentials('aitableApi');
        for (let i = 0; i < items.length; i++) {
            try {
                const resource = this.getNodeParameter('resource', i);
                const operation = this.getNodeParameter('operation', i);
                if (resource === 'record') {
                    const datasheetId = this.getNodeParameter('datasheetId', i);
                    // Prepare the request options
                    const requestOptions = {
                        headers: {
                            Authorization: `Bearer ${credentials.apiToken}`,
                        },
                        json: true,
                    };
                    if (operation === 'create') {
                        // Create a record
                        const fieldValues = this.getNodeParameter('fieldsUi.fieldValues', i, []);
                        const fields = {};
                        for (const fieldValue of fieldValues) {
                            const field = fieldValue.field;
                            const value = fieldValue.value;
                            fields[field] = value;
                        }
                        const body = {
                            records: [
                                {
                                    fields,
                                },
                            ],
                        };
                        const response = await this.helpers.request({
                            method: 'POST',
                            url: `https://tbl.automatiser.com/fusion/v1/datasheets/${datasheetId}/records`,
                            body,
                            headers: requestOptions.headers,
                            json: true,
                        });
                        if ((response === null || response === void 0 ? void 0 : response.success) && ((_a = response.data) === null || _a === void 0 ? void 0 : _a.records)) {
                            returnData.push({ json: response.data.records[0] });
                        }
                        else {
                            throw new Error(`Aitable API Error: ${(response === null || response === void 0 ? void 0 : response.message) || 'Unknown error'}`);
                        }
                    }
                    else if (operation === 'update') {
                        // Update a record
                        const recordId = this.getNodeParameter('recordId', i);
                        const fieldValues = this.getNodeParameter('fieldsUi.fieldValues', i, []);
                        const fields = {};
                        for (const fieldValue of fieldValues) {
                            const field = fieldValue.field;
                            const value = fieldValue.value;
                            fields[field] = value;
                        }
                        const body = {
                            records: [
                                {
                                    recordId: recordId,
                                    fields,
                                },
                            ],
                        };
                        const response = await this.helpers.request({
                            method: 'PUT',
                            url: `https://tbl.automatiser.com/fusion/v1/datasheets/${datasheetId}/records`,
                            body,
                            headers: requestOptions.headers,
                            json: true,
                        });
                        if ((response === null || response === void 0 ? void 0 : response.success) && ((_b = response.data) === null || _b === void 0 ? void 0 : _b.records)) {
                            returnData.push({ json: response.data.records[0] });
                        }
                        else {
                            throw new Error(`Aitable API Error: ${(response === null || response === void 0 ? void 0 : response.message) || 'Unknown error'}`);
                        }
                    }
                    else if (operation === 'delete') {
                        // Delete a record
                        const recordId = this.getNodeParameter('recordId', i);
                        const qs = {
                            recordIds: recordId,
                        };
                        const response = await this.helpers.request({
                            method: 'DELETE',
                            url: `https://tbl.automatiser.com/fusion/v1/datasheets/${datasheetId}/records`,
                            qs,
                            headers: requestOptions.headers,
                            json: true,
                        });
                        if (response === null || response === void 0 ? void 0 : response.success) {
                            returnData.push({ json: { success: true, message: 'Record deleted successfully' } });
                        }
                        else {
                            throw new Error(`Aitable API Error: ${(response === null || response === void 0 ? void 0 : response.message) || 'Unknown error'}`);
                        }
                    }
                    else if (operation === 'get') {
                        // Get a record
                        const recordId = this.getNodeParameter('recordId', i);
                        const qs = {
                            recordIds: recordId,
                        };
                        const response = await this.helpers.request({
                            method: 'GET',
                            url: `https://tbl.automatiser.com/fusion/v1/datasheets/${datasheetId}/records`,
                            qs,
                            headers: requestOptions.headers,
                            json: true,
                        });
                        if ((response === null || response === void 0 ? void 0 : response.success) && ((_d = (_c = response.data) === null || _c === void 0 ? void 0 : _c.records) === null || _d === void 0 ? void 0 : _d.length) > 0) {
                            returnData.push({ json: response.data.records[0] });
                        }
                        else {
                            throw new Error(`Aitable API Error: ${(response === null || response === void 0 ? void 0 : response.message) || 'Unknown error'}`);
                        }
                    }
                    else if (operation === 'getAll') {
                        // Get all records
                        const additionalOptions = this.getNodeParameter('additionalOptions', i, {});
                        const returnAll = additionalOptions.returnAll;
                        const limit = additionalOptions.limit || 100;
                        const qs = {
                            fieldKey: 'name',
                        };
                        let allRecords = [];
                        let pageNum = 1;
                        const pageSize = 100;
                        if (returnAll) {
                            // Retrieve all records up to a maximum limit to prevent long response times
                            const maxRecords = 1000; // Set a maximum limit
                            while (true) {
                                qs.pageNum = pageNum;
                                qs.pageSize = pageSize;
                                const response = await this.helpers.request({
                                    method: 'GET',
                                    url: `https://tbl.automatiser.com/fusion/v1/datasheets/${datasheetId}/records`,
                                    qs,
                                    headers: requestOptions.headers,
                                    json: true,
                                });
                                if ((response === null || response === void 0 ? void 0 : response.success) && ((_e = response.data) === null || _e === void 0 ? void 0 : _e.records)) {
                                    allRecords = allRecords.concat(response.data.records);
                                    if (response.data.total <= pageNum * pageSize || allRecords.length >= maxRecords) {
                                        break;
                                    }
                                    else {
                                        pageNum++;
                                    }
                                }
                                else {
                                    throw new Error(`Aitable API Error: ${(response === null || response === void 0 ? void 0 : response.message) || 'Unknown error'}`);
                                }
                            }
                            // If total records exceed maxRecords, slice the array
                            if (allRecords.length > maxRecords) {
                                allRecords = allRecords.slice(0, maxRecords);
                            }
                        }
                        else {
                            // Retrieve limited records
                            qs.pageNum = 1;
                            qs.pageSize = limit;
                            const response = await this.helpers.request({
                                method: 'GET',
                                url: `https://tbl.automatiser.com/fusion/v1/datasheets/${datasheetId}/records`,
                                qs,
                                headers: requestOptions.headers,
                                json: true,
                            });
                            if ((response === null || response === void 0 ? void 0 : response.success) && ((_f = response.data) === null || _f === void 0 ? void 0 : _f.records)) {
                                allRecords = response.data.records;
                            }
                            else {
                                throw new Error(`Aitable API Error: ${(response === null || response === void 0 ? void 0 : response.message) || 'Unknown error'}`);
                            }
                        }
                        for (const record of allRecords) {
                            returnData.push({ json: record });
                        }
                    }
                    else if (operation === 'search') {
                        // Search records
                        const fieldValues = this.getNodeParameter('fieldsUi.fieldValues', i, []);
                        const qs = {
                            fieldKey: 'name',
                        };
                        if (fieldValues.length) {
                            const filters = fieldValues.map(fieldValue => {
                                const field = fieldValue.field;
                                const value = fieldValue.value;
                                return `{${field}}='${value}'`;
                            });
                            qs.filterByFormula = filters.join(' AND ');
                        }
                        const response = await this.helpers.request({
                            method: 'GET',
                            url: `https://tbl.automatiser.com/fusion/v1/datasheets/${datasheetId}/records`,
                            qs,
                            headers: requestOptions.headers,
                            json: true,
                        });
                        if ((response === null || response === void 0 ? void 0 : response.success) && ((_g = response.data) === null || _g === void 0 ? void 0 : _g.records.length) > 0) {
                            for (const record of response.data.records) {
                                returnData.push({ json: record });
                            }
                        }
                        else {
                            // No records found, return the specified JSON
                            const fieldName = (_h = fieldValues[0]) === null || _h === void 0 ? void 0 : _h.field;
                            const fieldValue = (_j = fieldValues[0]) === null || _j === void 0 ? void 0 : _j.value;
                            const result = {
                                recordId: "can't find",
                                [`${fieldName}`]: `can't find ${fieldValue}`,
                            };
                            returnData.push({ json: result });
                        }
                    }
                }
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