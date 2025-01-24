import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AquisicaoComponent } from './aquisicao/aquisicao.component';

const routes: Routes = [
  {path: '', redirectTo: '/aquisicao', pathMatch: 'full'},
  {path: 'aquisicao', component: AquisicaoComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
