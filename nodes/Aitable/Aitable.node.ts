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
          // Other operations can be added here
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

      // Fields for Create Operation
      {
        displayName: 'Fields',
        name: 'fieldsUi',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        displayOptions: {
          show: {
            operation: ['create'],
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
          // Get parameters
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
        }

        // Implement other operations ('update', 'delete', 'get', etc.) as needed

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

