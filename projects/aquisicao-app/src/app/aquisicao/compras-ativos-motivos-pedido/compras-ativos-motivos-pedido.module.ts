import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ComprasVeiculosMotivosPedidoRoutingModule } from './compras-ativos-motivos-pedido-routing.module';
import { CompraVeiculoMotivoPedidoResolve } from './shared/compraVeiculoMotivoPedido.resolve';
import { ListagemComprasAtivosMotivosPedidoComponent } from './listagem-compras-ativos-motivos-pedido/listagem-compras-ativos-motivos-pedido.component';
import { FormularioComprasAtivosMotivosPedidoComponent } from './formulario-compras-ativos-motivos-pedido/formulario-compras-ativos-motivos-pedido.component';
import { SharedModule } from '../../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import {  HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [ListagemComprasAtivosMotivosPedidoComponent, FormularioComprasAtivosMotivosPedidoComponent],
  imports: [
    CommonModule,
    ComprasVeiculosMotivosPedidoRoutingModule,
    SharedModule,
    MatTabsModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTableModule,
    MatPaginatorModule,
    MatMenuModule,
    MatIconModule,
    MatRadioModule,
    MatButtonModule,
    MatTooltipModule,
    MatListModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [CompraVeiculoMotivoPedidoResolve]
})
export class ComprasAtivosMotivosPedidoModule {}