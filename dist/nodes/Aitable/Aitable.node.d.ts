import { IExecuteFunctions, ILoadOptionsFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
export declare class Aitable implements INodeType {
    description: INodeTypeDescription;
    methods: {
        loadOptions: {
            getFields(this: ILoadOptionsFunctions): Promise<any>;
        };
    };
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
}
