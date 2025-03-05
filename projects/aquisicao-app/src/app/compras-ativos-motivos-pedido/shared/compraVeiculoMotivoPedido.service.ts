import { Injectable, Injector } from '@angular/core';
import { CompraVeiculoMotivoPedido } from './compraVeiculoMotivoPedido.model';
import { BaseResourceService } from '../../shared/service/base-resource.service';

@Injectable({
  providedIn: 'root'
})
export class CompraVeiculoMotivoPedidoService extends BaseResourceService<CompraVeiculoMotivoPedido> {

  constructor(protected override injector: Injector) {
    super('https://apiqa.locaviaweb.com.br/api/' + 'compra-veiculo-motivo-pedido', injector, CompraVeiculoMotivoPedido.fromJson)
  }
}