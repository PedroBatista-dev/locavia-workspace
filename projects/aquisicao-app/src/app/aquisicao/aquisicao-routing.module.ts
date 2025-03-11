import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "compras-ativos-motivos-pedido",
    loadChildren: () =>
      import("./compras-ativos-motivos-pedido/compras-ativos-motivos-pedido.module").then(
        (m) => m.ComprasAtivosMotivosPedidoModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AquisicaoRoutingModule { }