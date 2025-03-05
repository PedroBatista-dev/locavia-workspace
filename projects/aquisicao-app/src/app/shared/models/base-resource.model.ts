export abstract class BaseResourceModel {
    id?: number;
    next?: number;
    previous?: number;
    [key: string]: any;
  }