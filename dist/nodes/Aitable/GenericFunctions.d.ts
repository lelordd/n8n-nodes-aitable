import { IExecuteFunctions, IHookFunctions, ILoadOptionsFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
export interface IApitableApiResponse {
    success: boolean;
    message?: string;
    data?: {
        [key: string]: unknown;
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
        records?: Array<unknown>;
    };
}
export declare function apitableApiRequest(this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions, method: IHttpRequestMethods, endpoint: string, body?: IDataObject, qs?: IDataObject, apiVersion?: string): Promise<IApitableApiResponse>;
