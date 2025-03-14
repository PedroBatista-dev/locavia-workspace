import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {path: '', redirectTo: '/cadastro/veiculos-restricoes/lista', pathMatch: 'full'},
  {path: 'cadastro', loadChildren: () => import('./cadastro/cadastro.module').then((m) => m.CadastroModule)},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }