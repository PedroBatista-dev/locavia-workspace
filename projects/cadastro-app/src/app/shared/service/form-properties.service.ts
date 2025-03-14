import { Injectable } from '@angular/core';
import { MatMenuListItem } from '../components/menu-acoes/menu-acoes.component';

@Injectable({
  providedIn: 'root'
})
export class FormPropertiesService {

  form: any
  private currentAction!: string

  constructor(
  ) {}

  // busca a acao corrente que o usuario esta tentando realizar no form
  private setCurrentAction(fragment: Array<string>) {
    type AcoesKeys = 'consultar' | 'filtrar' | 'lista' | 'editar' | 'novo';

    let acoes: Record<AcoesKeys, string> = {
      'consultar': 'Consultar',
      'filtrar': 'Consultar',
      'lista': 'Consultar',
      'editar': 'Editar',
      'novo': 'Inserir'
    }
    let action = fragment.find((aux) => ['consultar', 'editar', 'novo', 'filtrar', 'lista'].includes(aux)) as AcoesKeys | undefined;
    this.currentAction = action ? acoes[action] : 'Consultar';
  }

  // funcao que busca as acoes do formulario
  getActionsAvailableForm() {
    let acoes = []
    if (this.form) {
      for (let action of this.form.actions)
        acoes.push(action.title)
    }
    return acoes.length > 0 ? `Ações Disponíveis: ${acoes.join(', ')}` : ''
  }

  //função que verifica se a acao do formulario deve ficar ativa
  activeAction(acao: string) {
    if (this.form) {
      let action = this.form.actions.find((aux: any) => aux.title === acao)
      if (action) {
        return true
      }
      return false
    } else
      return true
  }

  // função para verificar se o usuário tem acesso para acessar o form
  accessForm() {
    // verifica se a acao que o usuario esta tentando realizar o mesmo possui acesso
    return this.activeAction(this.currentAction)
  }

}