import { Component, Injector } from "@angular/core";
import { Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { VeiculoRestricao } from "../shared/veiculoRestricao.model";
import { VeiculoRestricaoService } from "../shared/veiculoRestricao.service";
import { BaseResourceFormComponent } from "../../../shared/components/base-resource-form/base-resource-form.component";
import { ViacepService } from "../../../shared/service/viacep.service";

@Component({
  selector: "app-formulario-veiculos-restricoes",
  templateUrl: "./formulario-veiculos-restricoes.component.html",
  styleUrls: ["./formulario-veiculos-restricoes.component.scss"],
})
export class FormularioVeiculosRestricoesComponent extends BaseResourceFormComponent<VeiculoRestricao> {

  override formName = 'Restrição do Veículo'

  constructor(
    protected veiculoRestricaoService: VeiculoRestricaoService,
    protected override injector: Injector,
    public viaCepService: ViacepService,
    private dialog: MatDialog
  ) {
    super(
      injector,
      new VeiculoRestricao(),
      veiculoRestricaoService,
      VeiculoRestricao.fromJson,
      "veiculoRestricao"
    );
  }

  protected buildResourceForm() {
    this.resourceForm = this.formBuilder.group({
      CodigoRestricao: [null],
      Descricao: [null, [Validators.required, Validators.minLength(2)]],
      VincularCliente: ['N', [Validators.required, Validators.maxLength(1)]],
      TipoVinculoCliente: ['P'],
      VincularContratoMaster: ['N', [Validators.required, Validators.maxLength(1)]],
      TipoVinculoContratoMaster: ['P'],
      ManterStatusAtual: ['N'],
      RestringirMovimentacao: ['N'],
    });
  }
  
  public setCheckboxRestricao(event: any, field: string, typeField: string): void {
    if (event.checked) {
      this.resourceForm.get(field)!.setValue("S");
      this.resourceForm.get(typeField)!.setValidators([Validators.required]);
      this.resourceForm.get(typeField)!.updateValueAndValidity();  
    } else {
      this.resourceForm.get(field)!.setValue("N");
      this.resourceForm.get(typeField)!.clearValidators();
      this.resourceForm.get(typeField)!.updateValueAndValidity();
      this.resourceForm.get(typeField)!.setValue('P');
    }
  }
  
  public setCheckboxCliente(): void {
    if (this.resourceForm.get('VincularContratoMaster')!.value == 'S' && this.resourceForm.get('TipoVinculoContratoMaster')!.value == 'O') {
      this.resourceForm.get('VincularCliente')!.setValue("S");
      this.resourceForm.get('TipoVinculoCliente')!.setValue("O");
      this.resourceForm.get('TipoVinculoCliente')!.setValidators([Validators.required]);
      this.resourceForm.get('TipoVinculoCliente')!.updateValueAndValidity();
    }
  }
}