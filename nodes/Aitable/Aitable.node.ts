// Import necessary classes and interfaces
import {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  INodePropertyOptions,
  IDataObject,
} from 'n8n-workflow';

import { aitableApiRequest, IAitableApiResponse } from './GenericFunctions';

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
      // Resource Selection
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
        noDataExpression: true,
      },

      // Operation Selection
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
        ],
        default: 'create',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['record'],
          },
        },
      },

      // Datasheet Selection
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

      // Record ID for Get, Update, Delete
      {
        displayName: 'Record ID',
        name: 'recordId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['record'],
            operation: ['get', 'update', 'delete'],
          },
        },
        description: 'ID of the record to operate on',
      },

      // Fields for Create and Update Operations
      {
        displayName: 'Fields',
        name: 'fieldsUi',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        displayOptions: {
          show: {
            operation: ['create', 'update'],
            resource: ['record'],
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
                description: 'Select the field to set',
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

      // Additional options for Get All operation
      {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        default: false,
        displayOptions: {
          show: {
            operation: ['getAll'],
            resource: ['record'],
          },
        },
        description: 'Whether to return all results or limit the number of results',
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        typeOptions: {
          minValue: 1,
        },
        default: 100,
        displayOptions: {
          show: {
            operation: ['getAll'],
            resource: ['record'],
            returnAll: [false],
          },
        },
        description: 'Max number of results to return',
      },
    ],
  };

  methods = {
    loadOptions: {
      // Load Datasheets
      async getDatasheets(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const response = (await aitableApiRequest.call(
          this,
          'GET',
          '/spaces',
        )) as IAitableApiResponse;
        const datasheetOptions: INodePropertyOptions[] = [];

        if (response.success && response.data?.spaces) {
          for (const space of response.data.spaces) {
            const qs: IDataObject = {
              type: 'Datasheet',
            };
            const datasheetsResponse = (await aitableApiRequest.call(
              this,
              'GET',
              `/spaces/${space.id}/nodes`,
              {},
              qs,
              'v2',
            )) as IAitableApiResponse;

            if (datasheetsResponse.success && datasheetsResponse.data?.nodes) {
              for (const node of datasheetsResponse.data.nodes) {
                datasheetOptions.push({
                  name: `${node.name} (Space: ${space.name})`,
                  value: node.id,
                });
              }
            }
          }
        }

        return datasheetOptions;
      },

      // Load Fields
      async getFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const datasheetId = this.getNodeParameter('datasheetId') as string;
        const response = (await aitableApiRequest.call(
          this,
          'GET',
          `/datasheets/${datasheetId}/fields`,
        )) as IAitableApiResponse;
        const fieldOptions: INodePropertyOptions[] = [];

        if (response.success && response.data?.fields) {
          for (const field of response.data.fields) {
            fieldOptions.push({
              name: field.name,
              value: field.name, // Using field name as identifier
            });
          }
        }

        return fieldOptions;
      },
    },
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        if (operation === 'create') {
          // 'Create' Operation
          const datasheetId = this.getNodeParameter('datasheetId', i) as string;
          const fieldValues = this.getNodeParameter(
            'fieldsUi.fieldValues',
            i,
            [],
          ) as IDataObject[];

          // Prepare fields object
          const fields: IDataObject = {};
          for (const fieldValue of fieldValues) {
            const fieldName = fieldValue.field as string;
            let value = fieldValue.value as string;

            // Ensure value is a string
            if (typeof value !== 'string') {
              value = JSON.stringify(value);
            }

            // Trim leading/trailing whitespace
            value = value.trim();

            fields[fieldName] = value;
          }

          // Construct request body
          const body = {
            records: [
              {
                fields,
              },
            ],
          };

          // Query parameters
          const qs: IDataObject = {
            fieldKey: 'name',
          };

          // Make API request
          const response = (await aitableApiRequest.call(
            this,
            'POST',
            `/datasheets/${datasheetId}/records`,
            body,
            qs,
          )) as IAitableApiResponse;

          // Add response to return data
          if (response.success && response.data?.records) {
            returnData.push({
              json: response.data.records[0],
            });
          } else {
            throw new Error(`Aitable API Error: ${response.message || 'Unknown error'}`);
          }

        } else if (operation === 'get') {
          // 'Get' Operation

          // Get parameters
          const datasheetId = this.getNodeParameter('datasheetId', i) as string;
          const recordId = this.getNodeParameter('recordId', i) as string;

          const qs: IDataObject = {
            fieldKey: 'name',
          };

          // Make API request
          const response = (await aitableApiRequest.call(
            this,
            'GET',
            `/datasheets/${datasheetId}/records/${recordId}`,
            {},
            qs,
          )) as IAitableApiResponse;

          // Add response to return data
          if (response.success && response.data) {
            returnData.push({
              json: response.data,
            });
          } else {
            throw new Error(`Aitable API Error: ${response.message || 'Unknown error'}`);
          }

        } else if (operation === 'getAll') {
          // 'Get All' Operation

          // Get parameters
          const datasheetId = this.getNodeParameter('datasheetId', i) as string;
          const returnAll = this.getNodeParameter('returnAll', i) as boolean;
          const qs: IDataObject = {
            fieldKey: 'name',
          };

          let allRecords: any[] = [];
          let pageNum = 1;
          const pageSize = 100;

          if (returnAll) {
            // Retrieve all records
            while (true) {
              qs.pageNum = pageNum;
              qs.pageSize = pageSize;

              const response = (await aitableApiRequest.call(
                this,
                'GET',
                `/datasheets/${datasheetId}/records`,
                {},
                qs,
              )) as IAitableApiResponse;

              if (response.success && response.data?.records) {
                allRecords = allRecords.concat(response.data.records);

                if (response.data.total <= pageNum * pageSize) {
                  break;
                } else {
                  pageNum++;
                }
              } else {
                throw new Error(`Aitable API Error: ${response.message || 'Unknown error'}`);
              }
            }
          } else {
            // Retrieve limited records
            const limit = this.getNodeParameter('limit', i) as number;
            qs.pageNum = 1;
            qs.pageSize = limit;

            const response = (await aitableApiRequest.call(
              this,
              'GET',
              `/datasheets/${datasheetId}/records`,
              {},
              qs,
            )) as IAitableApiResponse;

            if (response.success && response.data?.records) {
              allRecords = response.data.records;
            } else {
              throw new Error(`Aitable API Error: ${response.message || 'Unknown error'}`);
            }
          }

          // Add records to return data
          returnData.push(...allRecords.map(record => ({ json: record })));

        } else if (operation === 'update') {
          // 'Update' Operation

          // Get parameters
          const datasheetId = this.getNodeParameter('datasheetId', i) as string;
          const recordId = this.getNodeParameter('recordId', i) as string;
          const fieldValues = this.getNodeParameter(
            'fieldsUi.fieldValues',
            i,
            [],
          ) as IDataObject[];

          // Prepare fields object
          const fields: IDataObject = {};
          for (const fieldValue of fieldValues) {
            const fieldName = fieldValue.field as string;
            let value = fieldValue.value as string;

            // Ensure value is a string
            if (typeof value !== 'string') {
              value = JSON.stringify(value);
            }

            // Trim leading/trailing whitespace
            value = value.trim();

            fields[fieldName] = value;
          }

          // Construct request body
          const body = {
            records: [
              {
                id: recordId,
                fields,
              },
            ],
          };

          // Query parameters
          const qs: IDataObject = {
            fieldKey: 'name',
          };

          // Make API request
          const response = (await aitableApiRequest.call(
            this,
            'PUT',
            `/datasheets/${datasheetId}/records`,
            body,
            qs,
          )) as IAitableApiResponse;

          // Add response to return data
          if (response.success && response.data?.records) {
            returnData.push({
              json: response.data.records[0],
            });
          } else {
            throw new Error(`Aitable API Error: ${response.message || 'Unknown error'}`);
          }

        } else if (operation === 'delete') {
          // 'Delete' Operation

          // Get parameters
          const datasheetId = this.getNodeParameter('datasheetId', i) as string;
          const recordId = this.getNodeParameter('recordId', i) as string;

          // Prepare query parameters
          const qs: IDataObject = {
            recordIds: recordId,
          };

          // Make API request
          const response = (await aitableApiRequest.call(
            this,
            'DELETE',
            `/datasheets/${datasheetId}/records`,
            {},
            qs,
          )) as IAitableApiResponse;

          // Add response to return data
          if (response.success) {
            returnData.push({
              json: { success: true },
            });
          } else {
            throw new Error(`Aitable API Error: ${response.message || 'Unknown error'}`);
          }

        } else {
          throw new Error(`Unsupported operation: ${operation}`);
        }

      } catch (error: any) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: error.message },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
