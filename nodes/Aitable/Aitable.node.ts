import {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  INodePropertyOptions,
  IDataObject,
  IHttpRequestMethods,
} from 'n8n-workflow';

import { aitableApiRequest, aitableApiRequestAllItems } from './GenericFunctions';

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
        noDataExpression: true,
        options: [
          {
            name: 'Record',
            value: 'record',
          },
        ],
        default: 'record',
      },

      // Operation Selection
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['record'],
          },
        },
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
        ],
        default: 'getAll',
      },

      // Common Parameters for All Operations
      {
        displayName: 'Datasheet',
        name: 'datasheetId',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getDatasheets',
        },
        required: true,
        default: '',
        description: 'Datasheet to operate on',
        displayOptions: {
          show: {
            resource: ['record'],
          },
        },
      },

      // Parameters for 'Create' and 'Update' Operations
      {
        displayName: 'Fields',
        name: 'fieldsUi',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            operation: ['create', 'update'],
            resource: ['record'],
          },
        },
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
                description: 'Field to set',
              },
              {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
                description: 'Value to set',
              },
            ],
          },
        ],
      },

      // Parameter for 'Update' and 'Delete' Operations
      {
        displayName: 'Record ID',
        name: 'recordId',
        type: 'string',
        default: '',
        required: true,
        description: 'ID of the record',
        displayOptions: {
          show: {
            operation: ['update', 'delete', 'get'],
            resource: ['record'],
          },
        },
      },

      // Parameters for 'Get All' Operation
      {
        displayName: 'View',
        name: 'viewId',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getViews',
          loadOptionsDependsOn: ['datasheetId'],
        },
        required: true,
        default: '',
        description: 'View of the datasheet',
        displayOptions: {
          show: {
            operation: ['getAll'],
            resource: ['record'],
          },
        },
      },
      {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        default: false,
        description: 'Whether to return all results',
        displayOptions: {
          show: {
            resource: ['record'],
            operation: ['getAll'],
          },
        },
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        default: 50,
        description: 'Max number of results to return',
        typeOptions: {
          minValue: 1,
          maxValue: 1000,
        },
        displayOptions: {
          show: {
            resource: ['record'],
            operation: ['getAll'],
            returnAll: [false],
          },
        },
      },
    ],
  };

  methods = {
    loadOptions: {
      // Load Datasheets
      async getDatasheets(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        try {
          const response = await aitableApiRequest.call(this, 'GET', '/spaces');
          if (!response.success || !response.data?.spaces) {
            throw new Error('Failed to load spaces');
          }

          // Collect all datasheets from all spaces
          const datasheetOptions: INodePropertyOptions[] = [];

          for (const space of response.data.spaces) {
            const qs: IDataObject = {
              type: 'Datasheet',
              permissions: '0,1',
            };
            const datasheetsResponse = await aitableApiRequest.call(
              this,
              'GET',
              `/spaces/${space.id}/nodes`,
              {},
              qs,
              'v2',
            );

            if (datasheetsResponse.success && datasheetsResponse.data?.nodes) {
              for (const node of datasheetsResponse.data.nodes) {
                datasheetOptions.push({
                  name: `${node.name} (Space: ${space.name})`,
                  value: node.id,
                });
              }
            }
          }

          return datasheetOptions;
        } catch (error: any) {
          throw new Error(`Error loading datasheets: ${error.message}`);
        }
      },

      // Load Views
      async getViews(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        try {
          const datasheetId = this.getNodeParameter('datasheetId', undefined) as string;
          const response = await aitableApiRequest.call(
            this,
            'GET',
            `/datasheets/${datasheetId}/views`,
          );

          if (!response.success || !response.data?.views) {
            throw new Error('Failed to load views');
          }

          return response.data.views.map((view: { id: string; name: string }) => ({
            name: view.name,
            value: view.id,
          }));
        } catch (error: any) {
          throw new Error(`Error loading views: ${error.message}`);
        }
      },

      // Load Fields
      async getFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        try {
          const datasheetId = this.getNodeParameter('datasheetId', undefined) as string;
          const response = await aitableApiRequest.call(
            this,
            'GET',
            `/datasheets/${datasheetId}/fields`,
          );

          if (!response.success || !response.data?.fields) {
            throw new Error('Failed to load fields');
          }

          return response.data.fields.map((field: { id: string; name: string }) => ({
            name: field.name,
            value: field.id,
          }));
        } catch (error: any) {
          throw new Error(`Error loading fields: ${error.message}`);
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
        if (resource === 'record') {
          if (operation === 'create') {
            // 'Create' Operation
            const datasheetId = this.getNodeParameter('datasheetId', i) as string;
            const fieldsUi = this.getNodeParameter('fieldsUi', i) as IDataObject;
            const fieldValues = (fieldsUi as IDataObject).fieldValues as IDataObject[];

            const fields: IDataObject = {};
            for (const fieldValue of fieldValues) {
              fields[fieldValue.field as string] = fieldValue.value;
            }

            const body = {
              records: [{ fields }],
            };

            const response = await aitableApiRequest.call(
              this,
              'POST',
              `/datasheets/${datasheetId}/records`,
              body,
            );

            returnData.push(
              ...this.helpers.constructExecutionMetaData(
                this.helpers.returnJsonArray(response.data.records),
                { itemData: { item: i } },
              ),
            );
          } else if (operation === 'update') {
            // 'Update' Operation
            const datasheetId = this.getNodeParameter('datasheetId', i) as string;
            const recordId = this.getNodeParameter('recordId', i) as string;
            const fieldsUi = this.getNodeParameter('fieldsUi', i) as IDataObject;
            const fieldValues = (fieldsUi as IDataObject).fieldValues as IDataObject[];

            const fields: IDataObject = {};
            for (const fieldValue of fieldValues) {
              fields[fieldValue.field as string] = fieldValue.value;
            }

            const body = {
              records: [
                {
                  id: recordId,
                  fields,
                },
              ],
            };

            const response = await aitableApiRequest.call(
              this,
              'PUT',
              `/datasheets/${datasheetId}/records`,
              body,
            );

            returnData.push(
              ...this.helpers.constructExecutionMetaData(
                this.helpers.returnJsonArray(response.data.records),
                { itemData: { item: i } },
              ),
            );
          } else if (operation === 'delete') {
            // 'Delete' Operation
            const datasheetId = this.getNodeParameter('datasheetId', i) as string;
            const recordId = this.getNodeParameter('recordId', i) as string;

            const qs = {
              recordIds: recordId,
            };

            const response = await aitableApiRequest.call(
              this,
              'DELETE',
              `/datasheets/${datasheetId}/records`,
              {},
              qs,
            );

            returnData.push(
              ...this.helpers.constructExecutionMetaData(
                this.helpers.returnJsonArray({ success: response.success }),
                { itemData: { item: i } },
              ),
            );
          } else if (operation === 'get') {
            // 'Get' Operation
            const datasheetId = this.getNodeParameter('datasheetId', i) as string;
            const recordId = this.getNodeParameter('recordId', i) as string;

            const response = await aitableApiRequest.call(
              this,
              'GET',
              `/datasheets/${datasheetId}/records/${recordId}`,
            );

            returnData.push(
              ...this.helpers.constructExecutionMetaData(
                this.helpers.returnJsonArray(response.data),
                { itemData: { item: i } },
              ),
            );
          } else if (operation === 'getAll') {
            // 'Get All' Operation
            const datasheetId = this.getNodeParameter('datasheetId', i) as string;
            const viewId = this.getNodeParameter('viewId', i) as string;
            const returnAll = this.getNodeParameter('returnAll', i) as boolean;

            const qs: IDataObject = {
              viewId,
            };

            if (returnAll) {
              const records = await aitableApiRequestAllItems.call(
                this,
                'records',
                'GET',
                `/datasheets/${datasheetId}/records`,
                {},
                qs,
              );

              returnData.push(
                ...this.helpers.constructExecutionMetaData(
                  this.helpers.returnJsonArray(records),
                  { itemData: { item: i } },
                ),
              );
            } else {
              const limit = this.getNodeParameter('limit', i) as number;
              qs.pageSize = limit;

              const response = await aitableApiRequest.call(
                this,
                'GET',
                `/datasheets/${datasheetId}/records`,
                {},
                qs,
              );

              returnData.push(
                ...this.helpers.constructExecutionMetaData(
                  this.helpers.returnJsonArray(response.data.records),
                  { itemData: { item: i } },
                ),
              );
            }
          }
        }
      } catch (error: any) {
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
