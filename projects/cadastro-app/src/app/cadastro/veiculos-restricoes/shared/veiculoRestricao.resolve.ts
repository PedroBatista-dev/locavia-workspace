import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve } from "@angular/router";
import { Observable } from "rxjs";
import { VeiculoRestricao } from "./veiculoRestricao.model";
import { VeiculoRestricaoService } from "./veiculoRestricao.service";

@Injectable()
export class VeiculoRestricaoResolve implements Resolve<VeiculoRestricao> {
  constructor(private veiculoRestricaoService: VeiculoRestricaoService) {}
  resolve(route: ActivatedRouteSnapshot): Observable<VeiculoRestricao> {
    return this.veiculoRestricaoService.getById(
      "VeiculosRestricoes.CodigoRestricao",
      route.params["CodigoRestricao"]
    );
  }
}