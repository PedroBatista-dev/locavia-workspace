import { Injectable, Injector } from "@angular/core";
import { VeiculoRestricao } from "./veiculoRestricao.model";
import { BaseResourceService } from "../../../shared/service/base-resource.service";


@Injectable({
  providedIn: "root",
})
export class VeiculoRestricaoService extends BaseResourceService<VeiculoRestricao> {
  constructor(protected override injector: Injector) {
    super(
      'http://localhost:3001/veiculosRestricoes',
      injector,
      VeiculoRestricao.fromJson
    );
  }
}