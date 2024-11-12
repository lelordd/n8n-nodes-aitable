import { OptionsWithUri } from 'request';
import {
  IExecuteFunctions,
  IHookFunctions,
  ILoadOptionsFunctions,
} from 'n8n-core';
import { IAitableSpace, IAitableView, IAitableNode } from './types';

export async function aitableApiRequest(
  this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
  method: string,
  resource: string,
  body: any = {},
  qs: IDataObject = {},
  uri?: string,
  option: IDataObject = {}
): Promise<any> {
  const credentials = await this.getCredentials('aitableApi');
  const options: OptionsWithUri = {
    headers: {
      'Authorization': `Bearer ${credentials.apiToken}`,
    },
    method,
    qs,
    body,
    uri: uri || `https://aitable.ai/fusion/v1${resource}`,
    json: true,
  };

  try {
    return await this.helpers.request!(options);
  } catch (error) {
    throw new Error(`Aitable error: ${error}`);
  }
}

export async function getSpaces(
  this: IExecuteFunctions
): Promise<IAitableSpace[]> {
  const response = await aitableApiRequest.call(this, 'GET', '/spaces');
  return response.data.spaces;
}

export async function getViews(
  this: IExecuteFunctions,
  datasheetId: string
): Promise<IAitableView[]> {
  const response = await aitableApiRequest.call(this, 'GET', `/datasheets/${datasheetId}/views`);
  return response.data.views;
}

export async function searchNodes(
  this: IExecuteFunctions,
  spaceId: string,
  type: string,
  permissions: number[]
): Promise<IAitableNode[]> {
  const qs = {
    type,
    permissions: permissions.join(','),
  };
  const response = await aitableApiRequest.call(this, 'GET', `/spaces/${spaceId}/nodes`, {}, qs);
  return response.data.nodes;
}