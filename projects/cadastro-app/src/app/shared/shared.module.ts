import { CommonModule } from "@angular/common";
import { BodyComponent } from "./components/body/body.component";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatDialogModule } from "@angular/material/dialog";
import { MatMenuModule } from "@angular/material/menu";
import { MatButtonModule } from "@angular/material/button";
import { MatRadioModule } from "@angular/material/radio";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSelectModule } from "@angular/material/select";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatNativeDateModule } from "@angular/material/core";
import { MatTabsModule } from "@angular/material/tabs";
import { NgModule } from "@angular/core";
import { ErrorValidatorsDirective } from "./directives/error-validators.directive";
import { ButtonFormComponent } from "./components/button-form/button-form.component";
import { ShowInfoComponent } from "./components/show-info/show-info.component";
import { ListErrorFormComponent } from "./components/list-error-form.component/list-error-form.component";
import { FilterSearchItemsComponent } from "./components/filter-search-items/filter-search-items.component";

@NgModule({
  declarations: [
    BodyComponent,
    ErrorValidatorsDirective,
    ButtonFormComponent,
    ShowInfoComponent,
    ListErrorFormComponent,
    FilterSearchItemsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDialogModule,
    MatMenuModule,
    MatButtonModule,
    MatRadioModule,
    MatListModule,
    MatIconModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatNativeDateModule,
    MatTabsModule,
  ],
  exports: [
    BodyComponent,
    ErrorValidatorsDirective,
    ButtonFormComponent,
    ShowInfoComponent,
    ListErrorFormComponent,
    FilterSearchItemsComponent
  ],
})
export class SharedModule {}