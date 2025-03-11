import { HttpClient, HttpHeaders, HttpRequest } from "@angular/common/http";
import { Injector } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, map, pluck } from "rxjs/operators";
import { BaseResourceModel } from "../models/base-resource.model";
import Paginate from "../models/paginate.model";

export abstract class BaseResourceService<T extends BaseResourceModel> {
  protected http: HttpClient;
  protected headers?: HttpHeaders;
  constructor(
    protected apiPath: string,
    protected injector: Injector,
    protected jsonDataToResourceFn: (jsonData: any) => T
  ) {
    this.http = injector.get(HttpClient);
  }

  getCustom(url = "", columns?: Array<string>, headers?: {}): Observable<T[]> {
    return this.http
      .get(url, {
        headers: new HttpHeaders(headers).append("columns", columns ?? []),
      })
      .pipe(map(this.jsonDataToResources.bind(this)), catchError(this.handleError));
  }

  getAll(query = "", columns?: Array<string>): Observable<T[]> {
    const url = `${this.apiPath}${query}`;

    return this.http
      .get(url, {
        headers: new HttpHeaders().append("columns", columns ?? []),
      })
      .pipe(map(this.jsonDataToResources.bind(this)), catchError(this.handleError));
  }

  customGetId(query: string, columns?: Array<string>): Observable<T> {
    let url: string;
    let aux = Math.floor(Date.now() * Math.random()).toString(36);
    url = `${this.apiPath}?aux=${aux}&${query}`;
    return this.http
      .get(url, {
        headers: new HttpHeaders().append("columns", columns ?? []),
      })
      .pipe(map(this.jsonDataToResourceById.bind(this)), catchError(this.handleError));
  }

  getById(param: string, id: string | number, columns?: Array<string>): Observable<T> {
    let url: string;
    // gera um id aleatorio somente para realizar a diferenciacao das requisicoes
    let aux = Math.floor(Date.now() * Math.random()).toString(36);
    if (id) url = `${this.apiPath}?filters=${param}=${id}&aux=${aux}`;
    else url = `${this.apiPath}`;
    return this.http
      .get(url, {
        headers: new HttpHeaders().append("columns", columns ?? []),
      })
      .pipe(map(this.jsonDataToResourceById.bind(this)), catchError(this.handleError));
  }

  getByPaginate(
    page: number,
    limit: number | "*",
    query: string = "",
    columns?: Array<string>,
    custom_url?: string
  ): Observable<Paginate<T>> {
    let url = "";

    if (custom_url) {
      url = `${this.apiPath}${custom_url}?page=${page}&limit=${limit}&${query}`;
    } else {
      url = `${this.apiPath}?page=${page}&limit=${limit}&${query}`;
    }

    return this.http
      .get(url, {
        headers: new HttpHeaders().append("columns", columns ?? []),
      })
      .pipe(map((data: any) => this.jsonDataToResourcesPaginate(data)), catchError(this.handleError));
  }

  create(resource: T, custom_url?: string): Observable<T> {
    let url = "";
    if (custom_url) url = `${this.apiPath}/${custom_url}`;
    else url = this.apiPath;
    return this.http.post(url, resource).pipe(map(this.jsonDataToResource.bind(this)), catchError(this.handleError));
  }

  update(resource: any, key: any, custom_url?: string): Observable<T> {
    let url = "";
    if (custom_url) url = `${this.apiPath}/${custom_url}`;
    else url = `${this.apiPath}?${key}=${resource[key]}`;
    return this.http.put(url, resource).pipe(map(this.jsonDataToResource.bind(this)), catchError(this.handleError));
  }

  customAction(method: string, path: string, resource: any, query?: string, columns?: Array<string>): Observable<any> {
    let url = "";
    if (query) url = `${this.apiPath}/${path}?${query}`;
    else url = `${this.apiPath}/${path}`;

    let req: HttpRequest<T>;

    if (method === "GET") {
      req = new HttpRequest(method, url, {
        headers: new HttpHeaders().append("columns", columns ?? []),
      });
    } else {
      req = new HttpRequest(method, url, resource);
    }

    return this.http.request(req).pipe(
      pluck("body"),
      map((retorno: any) => retorno),
      catchError(this.handleError)
    );
  }

  customUrl(method: string, path: string, resource: any): Observable<any> {
    let url = `https://apiqa.locaviaweb.com.br/api/${path}`;

    let req: HttpRequest<T>;

    req = new HttpRequest(method, url, resource);
    return this.http.request(req).pipe(
      map((retorno: any) => retorno?.body),
      catchError(this.handleError)
    );
  }

  postToGetData(resource: any, path?: string): Observable<any> {
    let url = `${this.apiPath}`;
    if (path) url = `${url}/${path}`;

    return this.http.post(url, resource).pipe(catchError(this.handleError));
  }

  delete(query: string, custom_url:string = ""): Observable<any> {
    const url = `${this.apiPath}${custom_url}?${query}`;

    return this.http.delete(url).pipe(
      map((retorno: any) => retorno),
      catchError(this.handleError)
    );
  }

  toQueryString(obj: { [key: string]: Partial<T> } | Partial<T>, prefix = "", deep = 1): string {
    return Object.entries(obj)
      .map(([key, value]) => {
        if (typeof value === "object") {
          const delimiter = deep === 1 ? "." : "__";
          const fullKey = prefix ? `${prefix}${delimiter}${key}` : key;
          return this.toQueryString(value, fullKey, deep + 1);
        } else {
          return `${prefix}.${key}=${value}`;
        }
      })
      .join(";");
  }

  // PROTECTED METHODS
  protected jsonDataToResourcesPaginate(jsonData: any[]): Paginate<T> {
    return jsonData as Paginate<T>;
  }

  protected jsonDataToResources(jsonData: Paginate<T>): T[] {
    const resources: T[] = [];
    jsonData.data!.items!.forEach((element: any) => resources.push(this.jsonDataToResourceFn(element)));
    return resources;
  }

  protected jsonDataToResource(jsonData: any): T {
    return this.jsonDataToResourceFn(jsonData.data);
  }

  protected jsonDataToResourceById(jsonData: any): T {
    return this.jsonDataToResourceFn(jsonData.data.items[0]);
  }

  protected handleError(error: any): Observable<any> {
    return throwError(error);
  }
}