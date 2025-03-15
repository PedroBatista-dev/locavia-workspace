import { Component, Injector } from '@angular/core'; 
import { CompraVeiculoMotivoPedido } from '../shared/compraVeiculoMotivoPedido.model';
import { CompraVeiculoMotivoPedidoService } from '../shared/compraVeiculoMotivoPedido.service';
import { BaseListAbstract } from '../../../shared/components/base-list-abstract/base-list-abstract.component';

@Component({
  selector: 'app-listagem-compras-ativos-motivos-pedido',
  templateUrl: './listagem-compras-ativos-motivos-pedido.component.html',
  styleUrls: ['./listagem-compras-ativos-motivos-pedido.component.css']
})
export class ListagemComprasAtivosMotivosPedidoComponent extends BaseListAbstract<CompraVeiculoMotivoPedido> {

  override displayedColumns: string[] = [
    "Descricao",
    "Acoes",
  ];
  override displayedColumnsFilter: any[] = [
    ["Descricao", "Descricao_like"],
  ];

  override key: string = "id";

  constructor(
    protected compraVeiculoMotivoPedidoService: CompraVeiculoMotivoPedidoService,
    protected override injector: Injector
  ) {
    super(
      injector,
      new CompraVeiculoMotivoPedido(),
      compraVeiculoMotivoPedidoService,
      CompraVeiculoMotivoPedido.fromJson
    )
  }
}