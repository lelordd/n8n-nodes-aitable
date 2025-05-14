import { IExecuteFunctions, IHookFunctions, ILoadOptionsFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
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
    };
}
export declare function aitableApiRequest(this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions, method: IHttpRequestMethods, endpoint: string, body?: IDataObject, qs?: IDataObject, apiVersion?: string): Promise<IAitableApiResponse>;
