import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompraVeiculoMotivoPedidoResolve } from './shared/compraVeiculoMotivoPedido.resolve';
import { ListagemComprasAtivosMotivosPedidoComponent } from './listagem-compras-ativos-motivos-pedido/listagem-compras-ativos-motivos-pedido.component';
import { FormularioComprasAtivosMotivosPedidoComponent } from './formulario-compras-ativos-motivos-pedido/formulario-compras-ativos-motivos-pedido.component';


const routes: Routes = [
  {
    path: "",
    redirectTo: "lista",
  },
  {
    path: "lista",
    component: ListagemComprasAtivosMotivosPedidoComponent,
  },
  {
    path: "novo",
    component: FormularioComprasAtivosMotivosPedidoComponent,
  },
  {
    path: ":CodigoMotivoPedido/editar",
    component: FormularioComprasAtivosMotivosPedidoComponent,
    resolve: { compraVeiculoMotivoPedido: CompraVeiculoMotivoPedidoResolve },
  },
  {
    path: ":CodigoMotivoPedido/consultar",
    component: FormularioComprasAtivosMotivosPedidoComponent,
    resolve: { compraVeiculoMotivoPedido: CompraVeiculoMotivoPedidoResolve },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComprasVeiculosMotivosPedidoRoutingModule {}