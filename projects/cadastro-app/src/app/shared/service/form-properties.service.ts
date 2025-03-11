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

  // funcao responsavel por capturar o id do formulario
  setFormID(url: string) {
    let form = url.split('/')
    // seta a acao corrente que o usuario esta tentando 
    this.setCurrentAction(form)
    // remove as acoes de editar, consultar, lista, filtrar e novo e remove as possiveis chaves
    form = form.filter((item) => !['consultar', 'editar', 'novo', 'filtrar', 'lista'].includes(item) && isNaN(Number(item)))
    let formID = form[form.length - 1]
    this.form = this.searchFormProperties(formID)
  }

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

  // funcao que busca no menu o formulario e suas respectivas propriedades
  searchFormProperties(formId: string, item?: any): any {
    if (formId === item?.id)
      return item
    else {
      let retorno
      const form = item.children || item.sub || item.footer
      if (form) {
        retorno = this.searchFormProperties(formId, form)
        if (retorno)
          return retorno
      } else {
        if (Array.isArray(item)) {
          for (let aux of item) {
            let retorno: any = this.searchFormProperties(formId, aux)
            if (retorno)
              return retorno
          }
        }
      }
    }
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

  // funcao que monta o menu de acoes das listagens baseado nas acoes do formulario
  mountActionsMenu(menu: MatMenuListItem[]) {
    if (this.form.actions.length > 0) {
      // filtra as acoes diferentes de Inserir, Editar, Deletar e Consultar das acoes
      let acoes = this.form.actions.filter((acao: any) => !['Inserir'].includes(acao.title))
      // monta os itens do menu
      for (let acao of acoes) {
        // verifica se possui acesso a acao 
        if (this.activeAction(acao.title)) {
          let itemMenu = {
            menuLinkText: acao.title,
            menuIcon: acao.icon,
            isDisabled: false,
            iconType: acao.iconType,
          }
          menu.push(itemMenu)
        }
      }
    }
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