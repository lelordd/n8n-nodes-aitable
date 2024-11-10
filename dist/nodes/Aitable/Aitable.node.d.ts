import { IExecuteFunctions, ILoadOptionsFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
export declare class Aitable implements INodeType {
    description: INodeTypeDescription;
    methods: {
        loadOptions: {
            getFields(this: ILoadOptionsFunctions): Promise<{
                name: string;
                value: string;
                description: string;
            }[]>;
        };
    };
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
}
