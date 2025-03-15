import { Component, Injector } from '@angular/core';
import { VeiculoRestricao } from '../shared/veiculoRestricao.model';
import { VeiculoRestricaoService } from '../shared/veiculoRestricao.service';
import { BaseListAbstract } from '../../../shared/components/base-list-abstract/base-list-abstract.component';


@Component({
  selector: 'app-listagem-veiculos-restricoes',
  templateUrl: './listagem-veiculos-restricoes.component.html',
  styleUrls: ['./listagem-veiculos-restricoes.component.css']
})
export class ListagemVeiculosRestricoesComponent extends BaseListAbstract<VeiculoRestricao> {

  override displayedColumns: string[] = ['Descricao', 'Acoes'];
  override displayedColumnsFilter: any[] = [
    ['Descrição', 'VeiculosRestricoes.Descricao'],
  ];

  override key: string = 'id';

  constructor(private veiculoRestricaoService: VeiculoRestricaoService, protected override injector: Injector) {
    super(injector, new VeiculoRestricao(), veiculoRestricaoService, VeiculoRestricao.fromJson)
  }

}