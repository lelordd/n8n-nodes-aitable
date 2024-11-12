import { INodeProperties } from 'n8n-workflow';

export const getSpacesOperation: INodeProperties = {
  displayName: 'Get Spaces',
  name: 'getSpaces',
  type: 'operation',
  description: 'Get a list of spaces the user has access to',
  defaults: {
    name: 'Get Spaces',
  },
  group: ['input'],
  version: 1,
  returnAll: true,
  returnResource: 'spaces',
  properties: [],
};

export const getViewsOperation: INodeProperties = {
  displayName: 'Get Views',
  name: 'getViews',
  type: 'operation',
  description: 'Get a list of views for a given datasheet',
  defaults: {
    name: 'Get Views',
  },
  group: ['input'],
  version: 1,
  returnAll: true,
  returnResource: 'views',
  properties: [
    {
      displayName: 'Datasheet ID',
      name: 'datasheetId',
      type: 'string',
      default: '',
      required: true,
      description: 'The ID of the datasheet to get views for',
    },
  ],
};

export const searchNodesOperation: INodeProperties = {
  displayName: 'Search Nodes',
  name: 'searchNodes',
  type: 'operation',
  description: 'Search for nodes in a given space',
  defaults: {
    name: 'Search Nodes',
  },
  group: ['input'],
  version: 1,
  returnAll: true,
  returnResource: 'nodes',
  properties: [
    {
      displayName: 'Space ID',
      name: 'spaceId',
      type: 'string',
      default: '',
      required: true,
      description: 'The ID of the space to search in',
    },
    {
      displayName: 'Node Type',
      name: 'type',
      type: 'string',
      default: 'Datasheet',
      required: true,
      description: 'The type of nodes to search for',
    },
    {
      displayName: 'Permissions',
      name: 'permissions',
      type: 'multiOptions',
      options: [
        {
          name: 'Viewer',
          value: 0,
        },
        {
          name: 'Editor',
          value: 1,
        },
        {
          name: 'Manager',
          value: 2,
        },
      ],
      default: [0, 1],
      required: true,
      description: 'The permissions to filter nodes by',
    },
  ],
};