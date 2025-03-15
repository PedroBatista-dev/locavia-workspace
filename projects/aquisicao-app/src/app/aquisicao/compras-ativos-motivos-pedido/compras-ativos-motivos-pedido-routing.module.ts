import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListagemComprasAtivosMotivosPedidoComponent } from './listagem-compras-ativos-motivos-pedido/listagem-compras-ativos-motivos-pedido.component';
import { FormularioComprasAtivosMotivosPedidoComponent } from './formulario-compras-ativos-motivos-pedido/formulario-compras-ativos-motivos-pedido.component';


const routes: Routes = [
  {
    path: "",
    redirectTo: "lista",
    pathMatch: 'full'
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
    path: ":id/editar",
    component: FormularioComprasAtivosMotivosPedidoComponent,
  },
  {
    path: ":id/consultar",
    component: FormularioComprasAtivosMotivosPedidoComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComprasVeiculosMotivosPedidoRoutingModule {}