import {
  IExecuteFunctions,
  IHookFunctions,
  ILoadOptionsFunctions,
  IDataObject,
  IHttpRequestOptions,
  IHttpRequestMethods,
} from 'n8n-workflow';

export async function aitableApiRequest(
  this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body: IDataObject = {},
  qs: IDataObject = {},
  apiVersion: string = 'v1',
) {
  const credentials = await this.getCredentials('aitableApi');

  if (!credentials?.apiToken) {
    throw new Error('No API token provided');
  }

  const options: IHttpRequestOptions = {
    method,
    body,
    qs,
    url: `https://aitable.ai/fusion/${apiVersion}${endpoint}`,
    headers: {
      Authorization: `Bearer ${credentials.apiToken}`,
      'Content-Type': 'application/json',
    },
    json: true,
  };

  if (!Object.keys(body).length) {
    delete options.body;
  }

  if (!Object.keys(qs).length) {
    delete options.qs;
  }

  try {
    const response = await this.helpers.request!(options);

    if (!response.success) {
      throw new Error(`Aitable API Error: ${response.message}`);
    }

    return response;
  } catch (error: any) {
    throw new Error(
      `Aitable Error: ${error.message || 'Unknown error occurred'}`,
    );
  }
}

export async function aitableApiRequestAllItems(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  propertyName: string,
  method: IHttpRequestMethods,
  endpoint: string,
  body: IDataObject = {},
  query: IDataObject = {},
): Promise<any> {
  const returnData: IDataObject[] = [];

  let responseData;
  query.pageNum = 1;
  query.pageSize = 100;

  do {
    responseData = await aitableApiRequest.call(this, method, endpoint, body, query);
    if (!responseData.data || !responseData.data[propertyName]) {
      throw new Error(`No data returned for ${propertyName}`);
    }
    returnData.push(...responseData.data[propertyName]);
    query.pageNum++;
  } while (
    responseData.data.pageNum * responseData.data.pageSize < responseData.data.total
  );

  return returnData;
}
