import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "veiculos-restricoes",
    loadChildren: () =>
      import("./veiculos-restricoes/veiculos-restricoes.module").then(
        (m) => m.VeiculosRestricoesModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CadastroRoutingModule { }