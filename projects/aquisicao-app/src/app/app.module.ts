import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AquisicaoModule } from './aquisicao/aquisicao.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AquisicaoModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
