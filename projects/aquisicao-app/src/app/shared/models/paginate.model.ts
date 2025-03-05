export default class Paginate<T> {
    status?: boolean;
    statusCode?: number;
    erros?: Erros[];
    data?: Data<T>;    
}

export class Erros {
    mensage?: string;
}

export class Data<T> {
    items?: T[];
    meta?: Meta;
    links?: Links;
}

export class Meta {
    totalItems?: number;
    itemCount?: number;
    itemsPerPage?: number;
    totalPages?: number;
    currentPage?: number;
}

export class Links {
    first?: string;
    previous?: string;
    next?: string;
    last?: string;
}