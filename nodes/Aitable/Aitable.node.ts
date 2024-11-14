import {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  INodePropertyOptions,
  IDataObject,
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
            name: 'Get All',
            value: 'getAll',
            description: 'Get all records',
            action: 'Get all records',
          },
          // ... other operations
        ],
        default: 'getAll',
      },
      {
        displayName: 'Space',
        name: 'spaceId',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getSpaces',
        },
        required: true,
        default: '',
        description: 'Space containing the datasheet',
        displayOptions: {
          show: {
            operation: ['getAll'],
            resource: ['record'],
          },
        },
      },
      {
        displayName: 'Datasheet',
        name: 'datasheetId',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getDatasheets',
          loadOptionsDependsOn: ['spaceId'],
        },
        required: true,
        default: '',
        description: 'Datasheet to operate on',
        displayOptions: {
          show: {
            operation: ['getAll'],
            resource: ['record'],
          },
        },
      },
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
        description: 'Whether to return all results or only up to a given limit',
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
          maxValue: 100,
        },
        displayOptions: {
          show: {
            resource: ['record'],
            operation: ['getAll'],
            returnAll: [false],
          },
        },
      },
      // ... other properties
    ],
  };

  methods = {
    loadOptions: {
      async getSpaces(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        try {
          const response = await aitableApiRequest.call(this, 'GET', '/spaces');
          if (!response.success || !response.data?.spaces) {
            throw new Error('Failed to load spaces or invalid response format');
          }
          return response.data.spaces.map((space: { id: string; name: string }) => ({
            name: space.name,
            value: space.id,
          }));
        } catch (error: any) {
          throw new Error(`Error loading spaces: ${error.message}`);
        }
      },

      async getDatasheets(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        try {
          const spaceId = this.getNodeParameter('spaceId', undefined) as string;
          const qs: IDataObject = {
            type: 'Datasheet',
            permissions: '0,1',
          };
          const response = await aitableApiRequest.call(
            this,
            'GET',
            `/spaces/${spaceId}/nodes`,
            {},
            qs,
            'v2',
          );
          if (!response.success || !response.data?.nodes) {
            throw new Error('Failed to load datasheets or invalid response format');
          }
          return response.data.nodes.map((node: { id: string; name: string }) => ({
            name: node.name,
            value: node.id,
          }));
        } catch (error: any) {
          throw new Error(`Error loading datasheets: ${error.message}`);
        }
      },

      async getViews(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        try {
          const datasheetId = this.getNodeParameter('datasheetId', undefined) as string;
          const response = await aitableApiRequest.call(
            this,
            'GET',
            `/datasheets/${datasheetId}/views`,
            {},
            {},
            'v1',
          );
          if (!response.success || !response.data?.views) {
            throw new Error('Failed to load views or invalid response format');
          }
          return response.data.views.map((view: { id: string; name: string }) => ({
            name: view.name,
            value: view.id,
          }));
        } catch (error: any) {
          throw new Error(`Error loading views: ${error.message}`);
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
          if (operation === 'getAll') {
            const datasheetId = this.getNodeParameter('datasheetId', i) as string;
            const viewId = this.getNodeParameter('viewId', i) as string;
            const returnAll = this.getNodeParameter('returnAll', i) as boolean;
            const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

            const qs: IDataObject = {
              viewId,
              ...filters,
            };

            if (returnAll === true) {
              const response = await aitableApiRequestAllItems.call(
                this,
                'records',
                'GET',
                `/datasheets/${datasheetId}/records`,
                {},
                qs,
              );
              returnData.push(
                ...this.helpers.constructExecutionMetaData(
                  this.helpers.returnJsonArray(response),
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
          // ... other operations
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
