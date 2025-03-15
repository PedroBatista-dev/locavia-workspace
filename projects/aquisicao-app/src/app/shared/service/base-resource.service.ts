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

  getAll(query = "", columns?: Array<string>): Observable<T[]> {
    const url = `${this.apiPath}${query}`;

    return this.http
      .get(url, {
        headers: new HttpHeaders().append("columns", columns ?? []),
      })
      .pipe(map((data: any) => data), catchError(this.handleError));
  }

  getById(id: string | number, columns?: Array<string>): Observable<T> {
    const url = `${this.apiPath}/${id}`;

    return this.http
      .get(url, {
        headers: new HttpHeaders().append("columns", columns ?? []),
      })
      .pipe(map((data: any) => data), catchError(this.handleError));
  }

  getByPaginate(
    page: number,
    limit: number | "*",
    query: string = "",
    custom_url?: string
  ): Observable<any[]> {
    let url = "";

    if (custom_url) {
      url = `${this.apiPath}${custom_url}?_page=${page}&_limit=${limit}&${query}`;
    } else {
      url = `${this.apiPath}?_page=${page}&_limit=${limit}&${query}`;
    }

    return this.http
      .get(url, { observe: 'response' })
      .pipe(map((data: any) => {
        const totalItens = data.headers.get('X-Total-Count');
        const dados = data.body;

        return { totalItens, dados };
      }), catchError(this.handleError));
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
    else url = `${this.apiPath}/${resource[key]}`;
    return this.http.put(url, resource).pipe(map(this.jsonDataToResource.bind(this)), catchError(this.handleError));
  }

  delete(query: string, custom_url:string = ""): Observable<any> {
    const url = `${this.apiPath}${custom_url}/${query}`;

    return this.http.delete(url).pipe(
      map((retorno: any) => retorno),
      catchError(this.handleError)
    );
  }

  protected jsonDataToResource(jsonData: any): T {
    return this.jsonDataToResourceFn(jsonData.data);
  }

  protected handleError(error: any): Observable<any> {
    return throwError(error);
  }
}