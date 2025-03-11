import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { AbstractControl, FormControl } from "@angular/forms";
import { MatSelect } from "@angular/material/select";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable,Subscription, forkJoin, of } from "rxjs";
import { debounceTime, map, startWith, switchMap } from "rxjs/operators";
import { FormPropertiesService } from "../../service/form-properties.service";
import { TableService } from "../../service/table.service";
import { customSwal } from "../../styles/sweetalert";

export interface IDisplayFormatAtributos {
  campoDB: string;
  atributo: string;
  valorUndefined?: any;
}

export interface IDisplayFormatMatSelect {
  format: string;
  atributos: Array<IDisplayFormatAtributos>;
}

@Component({
  selector: "app-mat-select-search",
  templateUrl: "./mat-select-search.component.html",
  styleUrls: ["./mat-select-search.component.scss"],
})
export class MatSelectSearchComponent implements OnInit {
  maxRecords = 0; //Quantidade maxima de itens no banco de dados
  showSearch = true; //Variavel responsavel por controlar a exibicao do campo pesquisar
  recordsCount = 10; //Variavel responsavel por definir a quantidade de registros que devem ser exibidos
  selectedValue = {
    key: "",
    value: "",
    data: {},
  }; //Variavel que contem o registro selecionado do mat select
  search!: FormControl; //controle responsavel pela busca
  options!: Observable<any>; //observable responsavel pelo retorno da busca
  @Input() limitRecords: number = 10;
  @Input() control!: AbstractControl; //controle que recebera o valor selecionado
  @Input() labelCustom!: string; //label do campo
  @Input() service: any; //servico que sera utilzado para comunicacao com o backend
  @Input() controlRequired: boolean = false; //informa se o campo sera obrigatorio ou nao
  @Input() valueShow!: string; // valor a ser exibido no campo apos a consulta
  @Input() key!: string; //chave de retorno do objeto pesquisado
  @Input() orderBy!: string; //valor usado para ordenar a pesquisa
  @Input() filter!: string; //campo onde sera realizada a busca do texto informado
  @Input() formLink: string = ""; //utilizado para informar o compoenente que deve ser chamado para cadastro de novo registro
  @Input() condicoes!: string; //usar esta variavel para utilizar o campo filters do metodo get; lembrar de separar as condicoes por (ponto e virgula);
  @Input() condicoesRegistro!: string; // variavel para passar string literal;
  @Output() selectionChange = new EventEmitter();
  @Output() selectionChangeWithCompleteData = new EventEmitter();
  @Output() changeInitialControlAuxValue = new EventEmitter();
  @Input() datasource!: Array<any>; // Array de objetos contendo as seguintes propriedades { key: '', value: ''} utilizar o value com a chave da informacao e key o que deve ser exibido para o usuario
  @Input() dataSourceCustomChanged$ = new BehaviorSubject<Array<any>>([]); // behavior contendo os dados do datasource vindo atualizados da api, sempre utilizar em conjunto ao isCustomDataSource
  @Input() forceReturnValueAndKey!: boolean; // PODE SER USADO APENAS COM DATASOURCE -- Boolean para definir se o selectionChangeWithCompleteData irá emitir o valor de key e value ao mesmo tempo caso exista datasource -- dessa forma o controlAux ficaria definido com os valores de key e value, porém o objeto pode ser manipulado em alguma função chamada pelo selectionChangeWithCompleteData($event)
  @Input() isCustomDataSource!: boolean; // define se o datasource do mat select vem de forma personalizada (através do dataSourceChanged$)

  @Input() allRecordsEmpresa: boolean = false; // Usado apenas para requisições que contem a entidade Empresa para trazer todos os registros e ignorar a trava de empresa liga ao usuario logado.
  @Input() fields: string = ""; //Usado para acrescentar as colunas a serem retornadas na consulta. Ex: 'Fornecedores__Categorias.CodigoCategoria, Forncedores.CodigoFornecedor'
  @Input() columnsOnlyFields: boolean = false; // Usado para definir os columns apenas como os campos adicionados no fields
  @Input() sendEmptyColumns: boolean = false; // Usado para não enviar columns no header da requisição
  @Input() readonly: boolean = false;
  @Input() columnsFilterKey: boolean = false; // Usado para adicionar o filter e key no inicio ou no fim da array de columns.
  @Input() disabled: boolean = false;
  @Input() controlAux!: FormControl; //controle que ira receber o objeto contendo a key e o value show exemplo ({CodigoImposto: 0, Descricao: ''})
  columnsFilter: Array<any> = []; //Array contendo um objeto no seguinte formato: [{Filtro: 'Descrição', CampoBD: 'VeiculosGrupos.Descricao', Selecionado: 'S', Visivel: 'S', Atributo: 'Descricao'}]
  @Input() showNaoDefinido = true;
  @Input() displayFormat!: IDisplayFormatMatSelect; //responsavel pela exibicao dos valoers no mat-select
  @Input() hideArrow: boolean = false; //responsavel por esconder a seta do mat select
  @Input() extraItemKey!: string; //Chave contendo o caminho do atributo extra a ser exibido na listagem de opções (serve para estado ou qualquer campo que desejar exibir).
  @Input() includeDocFilter: boolean = false; //Para Incluir CPF ou CNPJ na razão Social
  @Input() cityWithUf: boolean = false; //Flag que irá definir se o campo cidade será concatenado com Uf
  @Input() positionExtraItem: string = ""; // posição do item extra, default ficará centralizado, os valores aceitos são 'left' e 'right';
  @Input() panelAbove: boolean = false; // Determina a localização do painel. true = acima / false = auto
  @Input() filterEnd: string = ""; // 
  @ViewChild("selectSearch") select!: MatSelect; // captura o elemento mat select para manipulacoes

  @Output() searchValueChanged: EventEmitter<string> = new EventEmitter<string>();

  subscriptions = new Subscription();

  inputFocus = false;

  recordsSearch: Array<any> = []; //armazena os registros listados

  constructor(
    public tableService: TableService,
    private formPropertiesService: FormPropertiesService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.validarParametros();
    this.search = new FormControl("");
    if (this.isCustomDataSource) {
      this.preparaSearchValueChangesWithDataSource();
    } else {
      this.preparaSearchValueChanges();
    }
    this.preparaControlValueChanges();
    this.getValueReadOnly();
    if (this.service?.filtersSearch) {
      // clona os filtros para serem exibidos com os valores definidos no server
      this.columnsFilter = JSON.parse(JSON.stringify(this.service.filtersSearch));
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  tratarCondicoes() {
    //busca as condicoes fixas definidas em cada service
    if (this.service?.conditionsFixed) {
      let condicoesAdicionadas = this.condicoes ? this.condicoes.split(";") : [];

      for (let condicao of this.service.conditionsFixed) {
        if (!condicoesAdicionadas.includes(condicao.condition)) condicoesAdicionadas.push(condicao.condition);
      }

      this.condicoes = condicoesAdicionadas.join(";");
    }
  }

  // caso o a propriedade readonly estiver ativa e control possuir valor o sistema ira retornar os dados solilcitados
  public getValueReadOnly() {
    if (this.readonly && this.control.value) {
      let columns = [this.key, this.filter];
      this.subscriptions.add(
        this.service.getById(this.key, this.control.value, columns).subscribe((retorno: any) => {
          this.selectedValue = {
            value: this.retornarObjectKey(retorno, this.key),
            key: this.retornarObjectKey(retorno, this.valueShow),
            data: retorno,
          };
        })
      );
    }
  }

  // funcao responsavel por registrar o evento scroll do componente mat-select
  public selectRegisterEventScroll() {
    this.select.panel?.nativeElement.addEventListener("scroll", (event: any) => this.eventScroll(event.target));
  }

  // funcao do scroll do componete mat-select
  public eventScroll(target: any) {
    // esconde o pesquisar caso tenha ocorrido o evento scroll; habilita se o scrool estiver no top do panel
    if (target.clientHeight + 55 < target.scrollHeight && this.search.value == "")
      this.showSearch = target.scrollTop <= 0;
    // verifica se chegou ao final do scroll do panel;
    if (target.scrollHeight - target.scrollTop - target.clientHeight <= 5) {
      if (this.recordsCount < this.maxRecords) {
        // soma mais 10 para exibicao de registros
        this.recordsCount += 10;
        // armazena o valor anterio a pesquisa
        const valorAnt = this.search.value;
        // chamao novamente o vento values change do componente
        this.search.setValue(valorAnt);
      }
    }
  }

  get controlIsRequired(): boolean {
    return this.control.errors?.['required'];
  }

  public preparaControlValueChanges() {
    this.subscriptions.add(
      this.control.valueChanges
        .pipe(
          map((val) => {
            if (val == null) {
              this.selectedValue.key = "";
              this.selectedValue.value = "";
            }

            this.search.setValue("");
          })
        )
        .subscribe()
    );
  }

  public preparaSearchValueChanges() {
    this.options = this.search.valueChanges.pipe(
      startWith(""),
      debounceTime(200),
      switchMap((val) => {
        const retorno = this.filtrarAutoComplete(val || "", this.service, this.valueShow, this.key, this.filter);
        this.getValueReadOnly();
        return retorno;
      })
    );
  }

  public preparaSearchValueChangesWithDataSource() {
    this.search.valueChanges
      .pipe(
        startWith(""),
        debounceTime(200),
        switchMap((val) => {
          this.searchValueChanged.emit(val);
          return of([]);
        })
      )
      .subscribe();

    this.dataSourceCustomChanged$.subscribe((source) => {
      this.options = of(source || []);
      this.getValueReadOnly();
    });
  }

  public onSelectionChange(event: any) {
    let selected = null;

    if (this.key) {
      let trataKey = this.key.split(".");
      let key = trataKey[trataKey.length - 1];
      selected = event.value !== null ? this.recordsSearch.find((item) => item[key] == event.value) : null;
    }

    if (!this.key && this.datasource) {
      selected = event.value !== null ? this.datasource.find((item) => item.key == event.value) : null;
    }

    if (this.forceReturnValueAndKey && this.datasource) {
      selected =
        event.value !== null
          ? this.datasource.find((item) => {
            return item.value == event.value;
          })
          : null;
    }

    if (this.controlAux) this.controlAux.setValue(selected);

    this.selectionChange.emit(event);
    this.selectionChangeWithCompleteData.emit(selected);
  }

  public onOpenedChange() {
    let inputPesquisa = document.querySelector(".mat-input-search") as HTMLInputElement;
    if (inputPesquisa && !this.inputFocus && !this.control.value) inputPesquisa.focus();

    this.inputFocus = this.select.panelOpen;

    // manda exibir o campo de pesquisa
    this.showSearch = true;
    // seta a quantidade de registros que devem ser exibidos por padrao
    this.recordsCount = this.limitRecords;
    // limpa o campo de pesquisa
    this.search.setValue("");
    // atribui o evento de scroll do componente
    this.selectRegisterEventScroll();
  }

  public onFocus() {
    // se o componente nao foi manipulado e o valor do control esta vazio exibe o componente
    if (this.control.value == null && !this.control.touched) this.select.open();
  }

  filtrarAutoComplete(value: string, service: any, valueShow: string, key: string, filter: string) {
    if (this.datasource) {
      return of(this.datasource.filter((option) => option.key.toLowerCase().includes(value.toLowerCase())));
    } else {
      this.tratarCondicoes();
      let stringBuscaPesquisa = "";

      let columns = [filter, key];

      // verifica se possui colunas extras a serem exibidas
      if (this.fields) {
        // Limpa as colunas padrão definidas como filter e key
        if (this.columnsOnlyFields) {
          columns = [];
        }

        let colunasExtras = this.fields.split(",");
        for (let coluna of colunasExtras) columns.push(coluna);
      }

      if (this.columnsFilterKey) {
        columns.splice(0, 2);
        columns.push(filter);
        columns.push(key);
      }

      if (this.columnsFilter.length > 0) {
        this.columnsFilter.forEach((valor) => {
          if (valor.CampoBD !== filter && valor.CampoBD !== key) columns.push(valor.CampoBD);
        });
        // busca o regitro de pesquisa default
        let filtroDefault = this.columnsFilter.find((valores) => valores.Selecionado === "S");

        if (filtroDefault) {
          // monta a string de pesquisa
          if (filtroDefault.Filtro === "CNPJ" || filtroDefault.Filtro === "CPF") {
            value = value.replace(/[^0-9]/g, '')
          }
          if (this.orderBy) {
            stringBuscaPesquisa = `search=${filtroDefault.CampoBD}=${value}${this.condicoes && this.condicoes != "" ? "&filters=" + this.condicoes : ""
              }&orderBy=${this.orderBy}=ASC${this.filterEnd ? `&${this.filterEnd}` : ""}`;
          } else {
            stringBuscaPesquisa = `search=${filtroDefault.CampoBD}=${value}${this.condicoes && this.condicoes != "" ? "&filters=" + this.condicoes : ""
              }&orderBy=${filtroDefault.CampoBD}=ASC${this.filterEnd ? `&${this.filterEnd}` : ""}`;
          }
        }
      }
      if (stringBuscaPesquisa === "")
        stringBuscaPesquisa = `search=${filter}=${value}${this.condicoes && this.condicoes != "" ? "&filters=" + this.condicoes : ""
          }&orderBy=${filter}=ASC${this.filterEnd ? `&${this.filterEnd}` : ""}`;

      let stringBuscaRegistro = `filters=${key}=${this.control.value ?? 0}${this.condicoesRegistro ?? ""}`;

      //verifica se o displayFormat foi informado
      if (this.displayFormat) {
        for (let coluna of this.displayFormat.atributos) {
          if (!columns.includes(coluna.campoDB)) columns.push(coluna.campoDB);
        }
      }

      // Se a prop sendEmptyColumns for true, limpa as colunas
      if (this.sendEmptyColumns) {
        columns = [];
      }

      let requests = [];
      if (this.select.panelOpen) {
        if (this.control.value) {
          requests.push(service.getByPaginate(1, this.recordsCount, stringBuscaRegistro, columns));
          requests.push(service.getByPaginate(1, this.recordsCount, stringBuscaPesquisa, columns));
        } else {
          requests.push(service.getByPaginate(1, this.recordsCount, stringBuscaPesquisa, columns));
        }
      } else {
        if (this.control.value)
          requests.push(service.getByPaginate(1, this.recordsCount, stringBuscaRegistro, columns));
      }

      return forkJoin([...requests]).pipe(
        map((data: any[]) => {
          let registroSelecionado = this.control.value ? data[0].data.items : [];
          registroSelecionado = registroSelecionado.map((registro: any) => {
            let keyFormatada = "";
            //verifica se o display format foi informado
            if (this.displayFormat) {
              keyFormatada = this.displayFormat.format;
              for (let atr of this.displayFormat.atributos) {
                let searchRegExp = new RegExp(atr.atributo, "g");
                keyFormatada = keyFormatada.replace(
                  searchRegExp,
                  atr.valorUndefined ?? ""
                );
              }
            } else keyFormatada = this.retornarObjectKey(registro, valueShow);

            return {
              key: keyFormatada,
              value: this.retornarObjectKey(registro, key),
              data: registro,
            };
          });

          let registros = this.control.value ? (data[1] ? data[1].data.items : []) : data[0].data.items;
          this.recordsSearch = registros;
          registros = registros.map((registro: any) => {
            let keyFormatada = "";
            //verifica se o display format foi informado
            if (this.displayFormat) {
              keyFormatada = this.displayFormat.format;
              for (let atr of this.displayFormat.atributos) {
                let searchRegExp = new RegExp(atr.atributo, "g");
                keyFormatada = keyFormatada.replace(
                  searchRegExp,
                  atr.valorUndefined ?? ""
                );
              }
            } else keyFormatada = this.retornarObjectKey(registro, valueShow);

            return {
              key: keyFormatada,
              value: this.retornarObjectKey(registro, key),
              data: registro,
            };
          });

          this.maxRecords = this.control.value
            ? data[1]
              ? Number(data[1].data.meta.totalItems)
              : 0
            : Number(data[0].data.meta.totalItems);

          if (registroSelecionado.length > 0) {
            this.selectedValue = registroSelecionado[0];

            // setar o valor do control auxiliar também ao iniciar o componente
            if (this.controlAux && this.controlAux.value == null) {
              this.controlAux.setValue(this.selectedValue.data);
              this.changeInitialControlAuxValue.emit(this.selectedValue.data);
            }

            // verifica se o registro selecionado ja esta no array de registros se nao adiciona o mesmo
            const existe = registros.find((registro: any) => registro.value == registroSelecionado[0].value);
            if (!existe) registros.push(registroSelecionado[0]);
          }

          return registros;
        })
      );
    }
  }

  // funcao que retorna uma atributo de um objeto independente do nivel
  retornarObjectKey(object: any, atributo: any) {
    let retorno: any;
    // verifica se o elemento a ser exibido esta em outro nivel do objeto utilizando o '.'
    if (atributo.includes(".")) {
      const controls = atributo.split(".");
      for (let control of controls) {
        if (!retorno) retorno = object[control];
        else retorno = retorno[control];
      }
    } else {
      retorno = object[atributo];
    }
    return retorno;
  }

  public capturaColumnFilter() {
    let filtro;
    if (this.columnsFilter.length > 0) {
      filtro = this.columnsFilter.find((valor) => valor.Selecionado === "S");
    }
    return filtro ? "por " + filtro.Filtro : "";
  }

  public capturaAtributoColumnFilter(objeto: any) {
    if (this.columnsFilter.length > 0 && this.select.panelOpen) {
      let filtro = this.columnsFilter.find((valor) => valor.Selecionado === "S");
      let retorno = "";
      if (this.valueShow !== filtro?.Atributo) retorno = this.retornarObjectKey(objeto, filtro?.Atributo);
      return retorno ?? "";
    }
    return "";
  }

  public setFiltro(filtro: any) {
    this.columnsFilter.forEach((filtroBusca) => {
      if (filtroBusca.Filtro === filtro.Filtro) filtroBusca.Selecionado = "S";
      else filtroBusca.Selecionado = "N";
    });
    this.search.setValue("");
  }

  mensagemErro(campo: string, message?: string) {
    if (campo) {
      if (!message) return `- atributo ${campo} não foi informado;`;
      else return `- atributo ${campo} ${message};`;
    }
    return "";
  }

  validarParametros() {
    let erros = [];
    if (!this.labelCustom) erros.push(this.mensagemErro("labelCustom"));

    if (!this.datasource) {
      if (!this.valueShow) erros.push(this.mensagemErro("valueShow"));

      if (!this.key) erros.push(this.mensagemErro("key"));

      if (!this.filter) erros.push(this.mensagemErro("filter"));
    }

    if (!this.datasource && !this.service) {
      erros.push(this.mensagemErro("service ou datasource"));
    }

    if (this.isCustomDataSource) {
      if (!this.dataSourceCustomChanged$) {
        erros.push(
          this.mensagemErro("dataSourceCustomChanged$", "deve ser fornecido quando isCustomDataSource é verdadeiro.")
        );
      }

      if (!this.datasource) {
        erros.push(
          this.mensagemErro(
            "datasource",
            "deve ser fornecido quando isCustomDataSource é verdadeiro. (pode ser apenas um valor para inicializar o componente"
          )
        );
      }
    }

    if (this.forceReturnValueAndKey) {
      if (!this.datasource) {
        erros.push(this.mensagemErro("datasource", "deve ser fornecido quando forceReturnValueAndKey é verdadeiro."));
      }
    }

    if (this.datasource && this.service) {
      erros.push(this.mensagemErro("service", "não deve ser fornecido em conjunto com o datasource"));
    }

    if (this.control === undefined) erros.push(this.mensagemErro("control"));
    else if (!(this.control instanceof FormControl))
      erros.push(this.mensagemErro("control", "não é uma instancia de FormControl"));

    if (this.controlAux !== undefined) {
      if (!(this.controlAux instanceof FormControl))
        erros.push(this.mensagemErro("controlAux", "não é uma instancia de FormControl"));
    }

    if (erros.length > 0)
      throw "Verifique os atributos abaixo do componente app-mat-select-search: \n" + erros.join("\n");
  }

  displayLabel(option: any) {
    let atributoColumn = this.capturaAtributoColumnFilter(option.data);
    let extraItem = '';
    if (this.extraItemKey) {
      if (this.cityWithUf) {
        const cidade = this.retornarObjectKey(option.data, `${this.extraItemKey}.Descricao`);
        const uf = this.retornarObjectKey(option.data, `${this.extraItemKey}.Estado`);
        extraItem = cidade && uf ? `${cidade}/${uf}` : '';
      } else {
        extraItem = this.retornarObjectKey(option.data, this.extraItemKey)
      }
      if (extraItem) {
        return this.formatExtraItem(atributoColumn, option.key, extraItem);
      } else {
        return atributoColumn !== "" ? option.key + " - " + atributoColumn : option.key;
      }
    }


    const hasCPFCNPJ = option?.data?.Pessoa?.CNPJ || option?.data?.Pessoa?.CPF;
    const keySplit = typeof option.key === 'string' ? option.key.split(' / ') : [];
    const formatKey = keySplit.length > 1 && hasCPFCNPJ ? `${keySplit[0]}` : option.key;


    return atributoColumn !== "" && !this.displayFormat ? atributoColumn + " - " + option.key : formatKey;
  }

  formatExtraItem(atributoColumn: any, key: any, extraItem: any): string {
    switch (this.positionExtraItem) {
      case "left":
        return `${extraItem} ${`${atributoColumn ? `- ${atributoColumn} -` : ' -'}`} ${key}`;
      case "right":
        return `${key} ${`${atributoColumn ? `- ${atributoColumn} -` : ' -'}`} ${extraItem}`;
      default:
        return `${`${atributoColumn ? `${atributoColumn} -` : ''}`} ${extraItem} - ${key}`;
    }
  }

  openLink() {
    this.formPropertiesService.setFormID(this.formLink);
    let acesso = this.formPropertiesService.accessForm();
    if (!acesso) {
      // informa o usuario que ele nao tem acesso
      customSwal.fire({
        position: "center",
        icon: "info",
        title: "Acesso não permitido!",
        showConfirmButton: true,
      });
    } else {
      const link = this.router.serializeUrl(this.router.createUrlTree([this.formLink]));
      window.open(link, "_blank");
    }
  }
}