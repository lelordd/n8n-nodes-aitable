import { IExecuteFunctions } from 'n8n-core';
import {
  IDataObject,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { getSpaces, getViews, searchNodes } from './GenericFunctions';
import { getSpacesOperation, getViewsOperation, searchNodesOperation } from './OperationDescription';

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
      getSpacesOperation,
      getViewsOperation,
      searchNodesOperation,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: IDataObject[] = [];

    const operation = this.getNodeParameter('operation', 0) as string;
    switch (operation) {
      case 'getSpaces':
        const spaces = await getSpaces.call(this);
        returnData.push(...this.helpers.returnJsonArray(spaces));
        break;
      case 'getViews':
        const datasheetId = this.getNodeParameter('datasheetId', 0) as string;
        const views = await getViews.call(this, datasheetId);
        returnData.push(...this.helpers.returnJsonArray(views));
        break;
      case 'searchNodes':
        const spaceId = this.getNodeParameter('spaceId', 0) as string;
        const type = this.getNodeParameter('type', 0) as string;
        const permissions = this.getNodeParameter('permissions', 0, [0, 1]) as number[];
        const nodes = await searchNodes.call(this, spaceId, type, permissions);
        returnData.push(...this.helpers.returnJsonArray(nodes));
        break;
      default:
        throw new Error(`The operation "${operation}" is not supported!`);
    }

    return [this.helpers.returnJsonArray(returnData)];
  }
}