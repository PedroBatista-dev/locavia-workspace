import { Component, Injector } from '@angular/core';
import { Validators } from '@angular/forms';
import { CompraVeiculoMotivoPedido } from '../shared/compraVeiculoMotivoPedido.model';
import { CompraVeiculoMotivoPedidoService } from '../shared/compraVeiculoMotivoPedido.service';
//import { VeiculoRestricaoService } from 'src/app/cadastro/veiculos-restricoes/shared/veiculoRestricao.service';
import { BaseResourceFormComponent } from '../../shared/components/base-resource-form/base-resource-form.component';

@Component({
  selector: 'app-formulario-compras-ativos-motivos-pedido',
  templateUrl: './formulario-compras-ativos-motivos-pedido.component.html',
  styleUrls: ['./formulario-compras-ativos-motivos-pedido.component.css']
})
export class FormularioComprasAtivosMotivosPedidoComponent extends BaseResourceFormComponent<CompraVeiculoMotivoPedido> {

  override formName = 'Motivo Pedido de Compra de Ativo';

  constructor(
    protected compraVeiculoMotivoPedidoService: CompraVeiculoMotivoPedidoService,
    protected override injector: Injector,
    //public veiculoRestricaoService: VeiculoRestricaoService,
  ) {
    super(
      injector,
      new CompraVeiculoMotivoPedido(),
      compraVeiculoMotivoPedidoService,
      CompraVeiculoMotivoPedido.fromJson,
      'compraVeiculoMotivoPedido'
    )
  }

  protected buildResourceForm(): void {
    this.resourceForm = this.formBuilder.group({
      CodigoMotivoPedido: [null],
      Descricao: [null, [Validators.required, Validators.minLength(3)]],
      StatusMotivoPedido: [null, [Validators.required]],
      CodigoRestricao: [null],
      Estoque: ['N'],
      RenovacaoFrota: ['N'],
      NovaLocacao: ['N'],
      GerarAtivoInclusaoPedido: ['N']
    })
  }

}