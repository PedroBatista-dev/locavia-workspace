import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {path: '', redirectTo: '/aquisicao', pathMatch: 'full'},
  {path: 'aquisicao', loadChildren: () => import('./aquisicao/aquisicao.module').then((m) => m.AquisicaoModule)},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
