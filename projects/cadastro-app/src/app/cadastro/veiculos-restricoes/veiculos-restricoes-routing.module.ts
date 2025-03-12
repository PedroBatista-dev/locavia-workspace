import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { VeiculoRestricaoResolve } from "./shared/veiculoRestricao.resolve";
import { ListagemVeiculosRestricoesComponent } from "./listagem-veiculos-restricoes/listagem-veiculos-restricoes.component";
import { FormularioVeiculosRestricoesComponent } from "./formulario-veiculos-restricoes/formulario-veiculos-restricoes.component";


const routes: Routes = [
  {
    path: "",
    redirectTo: "lista",
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
    path: ":CodigoRestricao/editar",
    component: FormularioVeiculosRestricoesComponent,
    resolve: { veiculoRestricao: VeiculoRestricaoResolve },
  },
  {
    path: ":CodigoRestricao/consultar",
    component: FormularioVeiculosRestricoesComponent,
    resolve: { veiculoRestricao: VeiculoRestricaoResolve },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VeiculosRestricoesRoutingModule {}