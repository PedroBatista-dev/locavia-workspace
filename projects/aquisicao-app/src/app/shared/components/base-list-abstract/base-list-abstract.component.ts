import { SelectionModel } from "@angular/cdk/collections";
import { AfterContentChecked, Directive, Injector, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { SweetAlertIcon } from "sweetalert2";
import { BaseResourceModel } from "../../models/base-resource.model";
import Paginate from "../../models/paginate.model";
import { BaseResourceService } from "../../service/base-resource.service";
import { FilterDataModel } from "../../models/filter-data.model";
import { TableService } from "../../service/table.service";
import { customSwal } from "../../styles/sweetalert";
import { MatMenuListItem } from "../menu-acoes/menu-acoes.component";
import { FormPropertiesService } from "../../service/form-properties.service";

@Directive()
export abstract class BaseListAbstract<T extends BaseResourceModel> implements OnInit, OnDestroy, AfterContentChecked {
  setLoader: boolean = true;

  displayedColumns: string[] = [];
  displayedColumnsFilter: any[] = [];
  columns: Array<string> = [];

  //Menu de Ações - ms
  delay = 10000;
  lastCall: any;
  lastElement: any;

  listNavigation: number[] = [];
  dataSource = new MatTableDataSource();
  paginator!: MatPaginator;
  length: number | undefined = 0;
  pageSize = 5;
  pageSizeOptions: number[] = [5, 10, 15, 20];
  pageIndex: number = 0;
  pageEvent!: PageEvent;
  key!: string;
  userPaginatorPreferences: Array<any> = [];
  selection = new SelectionModel<any>(true, []);

  filtro!: Array<string>;
  @Input() filtroExpressao: string = "";

  resources!: any[];

  private subscription = new Subscription();

  public tableService!: TableService;

  protected router: Router;

  pesquisa = new FormControl("");
  @ViewChild(MatPaginator, { static: false }) paginatorTable!: MatPaginator;

  query: string = "";

  // string que contem as acoes disponiveis no formulario
  actionsAvailable = "";
  // cria a lista de acoes do formulario
  menuListItems: MatMenuListItem[] = [];

  activeActionNew: boolean = false;
  userLogged: any; //Variavel por capturar o usuario logado e seus dados

  private formPropertiesService!: FormPropertiesService;

  constructor(
    protected injector: Injector,
    public resource: T,
    protected resourceService: BaseResourceService<T>,
    protected jsonDataToResourceFn: (jsonData: any) => T
  ) {
    this.router = this.injector.get(Router);

    this.formPropertiesService = this.injector.get(FormPropertiesService);
    // busca as acoes disponiveis no formulario
    this.actionsAvailable = this.formPropertiesService.getActionsAvailableForm();
    // verifica se acao de inserir deve ficar habilitada
    this.activeActionNew = this.formPropertiesService.activeAction("Inserir");
  }

  ngOnInit() {
    this.filtro = this.displayedColumnsFilter[0];
  }

  ngAfterViewInit() {
    this.buscarDados(this.pageIndex, this.pageSize);
  }

  ngAfterContentChecked(): void {}

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  afterDelay(trigger: any, element: any) {
    this.gerarBotoes(element);
    trigger.openMenu();
  }

  gerarBotoes(element: any) {
    /** Não remover */
  }

  setPageSize() {
    this.pageSize = this.tableService.rowsWithoutScroll;
    if (this.pageSize >= 8) {
      this.pageSizeOptions = [
        Math.floor(this.pageSize / 2),
        this.pageSize,
        Math.floor((this.pageSize * 2) / 5) * 5,
        25,
      ];
    } else {
      this.pageSizeOptions = [this.pageSize, 15, 25];
    }
  }

  protected executaAcoesMenu(action: any, element: any) {
    switch (action) {
      case "Editar":
        this.router.navigateByUrl(this.formPropertiesService.form.path + "/" + element[this.key] + "/editar");
        break;
      case "Consultar":
        this.router.navigateByUrl(this.formPropertiesService.form.path + "/" + element[this.key] + "/consultar");
        break;
      case "Deletar":
        this.delete(element, [this.key] + "=" + element[this.key]);
        break;
      default:
        break;
    }
  }

  getServerData(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.buscarDados(event.pageIndex, event.pageSize);
  }

  applyFilter() {
    this.buscarDados(this.pageIndex, this.pageSize);
  }

  /**
   * função usada para escutar as alterações do componente de filtragem para manipulação da busca de dados.
   * @param filterData - contém dados do tipo filtro, query e valor de pesquisa
   */
  watchFilterSearch(filterData: FilterDataModel) {
    this.pesquisa.setValue(filterData.pesquisa!);
    this.filtro = filterData.filtro!;
    this.query = filterData.query!;
    this.paginatorTable.firstPage();
    this.buscarDados(this.pageIndex, this.pageSize);
  }

  consultarItem(element: any) {
    this.resources.forEach((item: any) => {
      this.listNavigation.push(item[this.key]);
    });
    localStorage.setItem("nav_ctrl", JSON.stringify(this.listNavigation));
    this.tableService.consult(element, this.key);
  }

  buscarDados(pagina: any, total: any) {
    this.subscription.add(
      this.resourceService.getByPaginate(pagina + 1, total, this.query).subscribe(
        (resources: any) => {
          this.resources = resources.dados;

          this.dataSource = new MatTableDataSource<any>(this.resources);
          this.afterNewSearch();
          this.length = resources.totalItens;
          this.setLoader = false;
          this.getOrderByDescription();
          this.selection.clear();
        },
        (error) => {
          this.setLoader = false;
          customSwal.fire("Erro", error.error.erros[0].message, "error");
        }
      )
    );
  }

  protected afterNewSearch() {}

  async delete(resource: T, query: string) {
    return customSwal
      .fire({
        title: "Tem certeza?",
        text: "O registro será excluído permanentemente!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, apague!",
        cancelButtonText: "Não, engano",
      })
      .then((result: any) => {
        if (result.isConfirmed) {
          customSwal.getConfirmButton()!.disabled = true;
          this.subscription.add(
            this.resourceService.delete(query).subscribe(
              (result) => {
                this.buscarDados(this.pageIndex, this.pageSize);
                this.resources = this.resources.filter((element) => element != resource);
                this.dataSource = new MatTableDataSource<any>(this.resources);
                customSwal.fire("Deletado!", "Registro deletado com sucesso!", "success");
              },
              (error) => {
                this.actionsForError(error);
              }
            )
          );
        } else if (result.dismiss === customSwal.DismissReason.cancel) {
          customSwal.fire("Cancelado", "Operação foi cancelada!", "error");
        }
      });
  }

  public getOrderByDescription() {
    if (this.filtro?.length > 0) {
      let description = this.pesquisa.value != "" ? ` ${this.filtro[0]} - ordem crescente` : "Registros mais recentes";
      this.paginatorTable._intl.itemsPerPageLabel = `${description} - Itens por página:`;
      this.paginatorTable._intl.changes.next();
    }
  }

  protected actionsForSuccess(resource: any) {
    customSwal.fire({
      position: "center",
      icon: "success",
      title: "Solicitação processada com sucesso!",
      showConfirmButton: false,
      timer: 1200,
    });

    const [, module, resources, , method] = this.router.url.split("/");

    if (resources !== "organizacoes" && (!method || method == "editar" || method == "consultar")) {
      this.router.navigate([module, resources, "lista"]);
    } else {
      this.router.navigate(["sistema/seguranca-acesso"]);
    }
  }

  protected actionsForError(error: any) {
    // array de erros do form
    let erros: Array<string> = [];
    let title = "Seguintes erros foram encontrados";
    let icon: SweetAlertIcon = "error";

    if (error.status === 422) {
      title = "Atenção";
      icon = "warning";
      error.error.fields.forEach((element: any) => {
        erros.push(element.message);
      });
    } else if (error.status === 400) {
      title = "Atenção";
      icon = "warning";
      error.error.erros.forEach((element: any) => {
        erros.push(element.message);
      });
    } else {
      erros.push(`Falha na comunicação com o servidor. Por favor, tente mais tarde.`);
    }

    customSwal.fire({
      title,
      html: `<ul style="list-style-type: disc; margin: 0 30px 0 30px;">
                ${erros.map((erro) => `<li style="text-align: justify; margin-bottom: 20px;">${erro}</li>`).join("")}
             </ul>
            `,
      icon,
    });
  }

}