import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { loadRemoteModule } from '@angular-architects/module-federation';

const AQUISICAO_APP_URL = "http://localhost:4300/remoteEntry.js";

const routes: Routes = [
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {
    path: 'aquisicao',
    loadChildren: () => {
      return loadRemoteModule({
        remoteEntry: AQUISICAO_APP_URL,
        remoteName: "aquisicaoApp",
        exposedModule: "./AquisicaoModule"
      }).then(m => m.AquisicaoModule).catch(err => console.log(err));
    }
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

export const routeCompArr = [HomeComponent];
