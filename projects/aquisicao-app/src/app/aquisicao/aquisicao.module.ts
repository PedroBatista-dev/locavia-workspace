import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AquisicaoComponent } from './aquisicao.component';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    AquisicaoComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forChild([
      {
        path: '',
        component: AquisicaoComponent
      }
    ])
  ]
})
export class AquisicaoModule { }
