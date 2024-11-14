import { INodeProperties } from 'n8n-workflow';

export const operationFields: INodeProperties[] = [
	{
		displayName: 'Datasheet ID',
		name: 'datasheetId',
		type: 'string',
		default: '',
		required: true,
		description: 'The ID of the datasheet',
		displayOptions: {
			show: {
				resource: ['record'],
				operation: ['create', 'delete', 'get', 'getAll', 'update'],
			},
		},
	},
	{
		displayName: 'View ID',
		name: 'viewId',
		type: 'string',
		default: '',
		required: true,
		description: 'The ID of the view',
		displayOptions: {
			show: {
				resource: ['record'],
				operation: ['getAll'],
			},
		},
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: {
				resource: ['record'],
				operation: ['getAll'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Max number of results to return',
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		displayOptions: {
			show: {
				resource: ['record'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
	},
	{
		displayName: 'Fields',
		name: 'fieldsUi',
		placeholder: 'Add Field',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['record'],
				operation: ['create', 'update'],
			},
		},
		default: {},
		options: [
			{
				name: 'fieldValues',
				displayName: 'Field',
				values: [
					{
						displayName: 'Field Name',
						name: 'fieldName',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Field Value',
						name: 'fieldValue',
						type: 'string',
						default: '',
					},
				],
			},
		],
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['record'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'string',
				default: '',
				description: 'Comma-separated list of fields to return',
			},
			{
				displayName: 'Filter By Formula',
				name: 'filterByFormula',
				type: 'string',
				default: '',
				description: 'Filter formula to apply',
			},
			{
				displayName: 'Sort',
				name: 'sort',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						name: 'field',
						displayName: 'Field',
						values: [
							{
								displayName: 'Field',
								name: 'field',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Direction',
								name: 'direction',
								type: 'options',
								options: [
									{
										name: 'ASC',
										value: 'asc',
									},
									{
										name: 'DESC',
										value: 'desc',
									},
								],
								default: 'asc',
							},
						],
					},
				],
			},
		],
	},
];
