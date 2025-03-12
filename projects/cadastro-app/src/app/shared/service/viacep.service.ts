import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViacepService {

  apiPath: string = 'https://viacep.com.br/ws';

  constructor(private http: HttpClient) {}

  buscarPorCep(cep: string): Observable<any> {
    const url = `${this.apiPath}/${cep}/json`;
    return this.http.get(url)
  }

  buscarEndereco(uf: string, cidade: string, endereco: string): Observable<any> {
    const url = `${this.apiPath}/${uf.toLowerCase()}/${cidade.toLowerCase()}/${endereco.toLowerCase()}/json`;
    return this.http.get(url)
  }
}