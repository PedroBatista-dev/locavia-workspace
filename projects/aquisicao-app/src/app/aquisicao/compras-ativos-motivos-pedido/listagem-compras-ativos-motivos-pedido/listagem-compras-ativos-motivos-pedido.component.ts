import { Component, Injector } from '@angular/core'; 
import { CompraVeiculoMotivoPedido } from '../shared/compraVeiculoMotivoPedido.model';
import { CompraVeiculoMotivoPedidoService } from '../shared/compraVeiculoMotivoPedido.service';
import { BaseListAbstract } from '../../../shared/components/base-list-abstract/base-list-abstract.component';
import { TableService } from '../../../shared/service/table.service';

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
    ["Descricao", "ComprasVeiculosMotivosPedido.Descricao"],
  ];

  override key: string = "CodigoMotivoPedido";

  constructor(
    protected compraVeiculoMotivoPedidoService: CompraVeiculoMotivoPedidoService,
    protected override injector: Injector, public override tableService: TableService
  ) {
    super(
      injector,
      new CompraVeiculoMotivoPedido(),
      compraVeiculoMotivoPedidoService,
      CompraVeiculoMotivoPedido.fromJson
    )
  }
}