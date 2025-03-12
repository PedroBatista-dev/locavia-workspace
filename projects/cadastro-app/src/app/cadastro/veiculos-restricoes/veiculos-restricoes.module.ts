import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { VeiculosRestricoesRoutingModule } from "./veiculos-restricoes-routing.module";

import { MatTabsModule } from "@angular/material/tabs";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatTableModule } from "@angular/material/table";
import { MatMenuModule } from "@angular/material/menu";
import { MatIconModule } from "@angular/material/icon";
import { MatRadioModule } from "@angular/material/radio";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatListModule } from "@angular/material/list";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatTooltipModule } from "@angular/material/tooltip";

import { MatPaginatorModule } from "@angular/material/paginator";

import { VeiculoRestricaoResolve } from "./shared/veiculoRestricao.resolve";
import { SharedModule } from "../../shared/shared.module";
import { ListagemVeiculosRestricoesComponent } from "./listagem-veiculos-restricoes/listagem-veiculos-restricoes.component";
import { FormularioVeiculosRestricoesComponent } from "./formulario-veiculos-restricoes/formulario-veiculos-restricoes.component";
import { ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [
    ListagemVeiculosRestricoesComponent,
    FormularioVeiculosRestricoesComponent,
  ],
  imports: [
    CommonModule,
    VeiculosRestricoesRoutingModule,
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
    MatDialogModule,
    MatButtonModule,
    MatListModule,
    MatAutocompleteModule,
    MatTooltipModule,
    ReactiveFormsModule
  ],
  providers: [VeiculoRestricaoResolve],
})
export class VeiculosRestricoesModule {}