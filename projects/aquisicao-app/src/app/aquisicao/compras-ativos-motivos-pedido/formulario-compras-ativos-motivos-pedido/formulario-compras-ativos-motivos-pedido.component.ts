import { Component, Injector } from '@angular/core';
import { Validators } from '@angular/forms';
import { CompraVeiculoMotivoPedido } from '../shared/compraVeiculoMotivoPedido.model';
import { CompraVeiculoMotivoPedidoService } from '../shared/compraVeiculoMotivoPedido.service';
import { BaseResourceFormComponent } from '../../../shared/components/base-resource-form/base-resource-form.component';
import { VeiculoRestricaoService } from 'projects/cadastro-app/src/app/cadastro/veiculos-restricoes/shared/veiculoRestricao.service';

@Component({
  selector: 'app-formulario-compras-ativos-motivos-pedido',
  templateUrl: './formulario-compras-ativos-motivos-pedido.component.html',
  styleUrls: ['./formulario-compras-ativos-motivos-pedido.component.css']
})
export class FormularioComprasAtivosMotivosPedidoComponent extends BaseResourceFormComponent<CompraVeiculoMotivoPedido> {

  override formName = 'Motivo Pedido de Compra de Ativo';
  items: any[] = [];

  constructor(
    protected compraVeiculoMotivoPedidoService: CompraVeiculoMotivoPedidoService,
    protected override injector: Injector,
    public veiculoRestricaoService: VeiculoRestricaoService,
  ) {
    super(
      injector,
      new CompraVeiculoMotivoPedido(),
      compraVeiculoMotivoPedidoService,
      CompraVeiculoMotivoPedido.fromJson
    )
  }

  protected buildResourceForm(): void {
    this.resourceForm = this.formBuilder.group({
      id: [null],
      Descricao: [null, [Validators.required, Validators.minLength(3)]],
      StatusMotivoPedido: [null, [Validators.required]],
      CodigoRestricao: [null],
      Estoque: ['N'],
      RenovacaoFrota: ['N'],
      NovaLocacao: ['N'],
      GerarAtivoInclusaoPedido: ['N']
    })
  }

  override loadResourcesOptions(): void {
    this.veiculoRestricaoService.getAll().subscribe(data => {
      this.items = data;
    });
  }

}