import {
  IExecuteFunctions,
  IHookFunctions,
  ILoadOptionsFunctions,
  IDataObject,
  IHttpRequestOptions,
  IHttpRequestMethods,
} from 'n8n-workflow';

export interface IAitableApiResponse {
  success: boolean;
  message?: string;
  data?: {
    [key: string]: any;
    spaces?: Array<{
      id: string;
      name: string;
    }>;
    nodes?: Array<{
      id: string;
      name: string;
    }>;
    fields?: Array<{
      id: string;
      name: string;
    }>;
    records?: Array<any>;
    // Add other properties as needed
  };
}

export async function aitableApiRequest(
  this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body: IDataObject = {},
  qs: IDataObject = {},
  apiVersion = 'v1',
): Promise<IAitableApiResponse> {
  const credentials = await this.getCredentials('aitableApi');

  if (!credentials?.apiToken) {
    throw new Error('No API token provided');
  }

  const options: IHttpRequestOptions = {
    method,
    body,
    qs,
    url: `https://tbl.automatiser.com/fusion/${apiVersion}${endpoint}`,
    headers: {
      Authorization: `Bearer ${credentials.apiToken}`,
      'Content-Type': 'application/json',
    },
    json: true,
  };

  // Remove empty body or qs
  if (!Object.keys(body).length) {
    delete options.body;
  }

  if (!Object.keys(qs).length) {
    delete options.qs;
  }

  try {
    const response = (await this.helpers.httpRequest!(options)) as IAitableApiResponse;

    if (!response.success) {
      throw new Error(`Aitable API Error: ${response.message}`);
    }

    return response;
  } catch (error: any) {
    throw new Error(`Aitable Error: ${error.message || 'Unknown error occurred'}`);
  }
}
