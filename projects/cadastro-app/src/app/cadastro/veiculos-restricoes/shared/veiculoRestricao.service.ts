import { Injectable, Injector } from "@angular/core";
import { VeiculoRestricao } from "./veiculoRestricao.model";
import { BaseResourceService } from "../../../shared/service/base-resource.service";


@Injectable({
  providedIn: "root",
})
export class VeiculoRestricaoService extends BaseResourceService<VeiculoRestricao> {
  constructor(protected override injector: Injector) {
    super(
      'https://apiqa.locaviaweb.com.br/api/' + "veiculos-restricoes",
      injector,
      VeiculoRestricao.fromJson
    );
  }
}