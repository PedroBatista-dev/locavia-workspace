import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ListagemVeiculosRestricoesComponent } from "./listagem-veiculos-restricoes/listagem-veiculos-restricoes.component";
import { FormularioVeiculosRestricoesComponent } from "./formulario-veiculos-restricoes/formulario-veiculos-restricoes.component";


const routes: Routes = [
  {
    path: "",
    redirectTo: "lista",
    pathMatch: 'full'
  },
  {
    path: "lista",
    component: ListagemVeiculosRestricoesComponent,
  },
  {
    path: "novo",
    component: FormularioVeiculosRestricoesComponent,
  },
  {
    path: ":id/editar",
    component: FormularioVeiculosRestricoesComponent,
  },
  {
    path: ":id/consultar",
    component: FormularioVeiculosRestricoesComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VeiculosRestricoesRoutingModule {}