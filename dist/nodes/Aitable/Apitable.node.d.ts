import { IExecuteFunctions, ILoadOptionsFunctions, INodeExecutionData, INodeType, INodeTypeDescription, INodePropertyOptions } from 'n8n-workflow';
export declare class Apitable implements INodeType {
    description: INodeTypeDescription;
    methods: {
        loadOptions: {
            getDatasheets(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
            getFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
        };
    };
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
}
