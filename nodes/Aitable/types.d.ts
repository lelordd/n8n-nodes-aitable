export interface IAitableSpace {
  id: string;
  name: string;
  isAdmin: boolean;
}

export interface IAitableView {
  id: string;
  name: string;
  type: string;
}

export interface IAitableNode {
  id: string;
  name: string;
  type: string;
  icon: string;
  isFav: boolean;
  parentId: string;
  permissions: number;
}