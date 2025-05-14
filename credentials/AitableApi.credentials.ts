import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class AitableApi implements ICredentialType {
    name = 'aitableApi';
    displayName = 'Aitable API';
    documentationUrl = 'https://developers.aitable.ai/api/quick-start';
    properties: INodeProperties[] = [
        {
            displayName: 'API Token',
            name: 'apiToken',
            type: 'string',
            default: '',
            required: true,
        },
    ];
}