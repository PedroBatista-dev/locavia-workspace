import { SelectionModel } from "@angular/cdk/collections";
import { AfterContentChecked, Directive, Injector, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { SweetAlertIcon } from "sweetalert2";
import { BaseResourceModel } from "../../models/base-resource.model";
import { BaseResourceService } from "../../service/base-resource.service";
import { FilterDataModel } from "../../models/filter-data.model";
import { customSwal } from "../../styles/sweetalert";

@Directive()
export abstract class BaseListAbstract<T extends BaseResourceModel> implements OnInit, OnDestroy, AfterContentChecked {
  setLoader: boolean = true;

  displayedColumns: string[] = [];
  displayedColumnsFilter: any[] = [];

  dataSource = new MatTableDataSource();
  length: number | undefined = 0;
  pageSize = 5;
  pageSizeOptions: number[] = [5, 10, 15, 20];
  pageIndex: number = 0;
  pageEvent!: PageEvent;
  key!: string;
  selection = new SelectionModel<any>(true, []);

  filtro!: Array<string>;

  resources!: any[];

  private subscription = new Subscription();

  protected router: Router;

  pesquisa = new FormControl("");
  @ViewChild(MatPaginator, { static: false }) paginatorTable!: MatPaginator;

  query: string = "";



  constructor(
    protected injector: Injector,
    public resource: T,
    protected resourceService: BaseResourceService<T>,
    protected jsonDataToResourceFn: (jsonData: any) => T
  ) {
    this.router = this.injector.get(Router);
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

  protected executaAcoesMenu(action: any, element: any, rota?: string) {
    switch (action) {
      case "Editar":
        this.router.navigateByUrl(`${rota}/${element[this.key]}/editar`);
        break;
      case "Consultar":
        this.router.navigateByUrl(`${rota}/${element[this.key]}/consultar`);
        break;
      case "Deletar":
        this.delete(element, element[this.key]);
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
    let url = this.router.url;
    if (url.includes("lista")) {
      url = url.replace("/lista", "/" + element[this.key] + "/consultar");
      this.router.navigateByUrl(url);
    } 
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

  public novoRegistro() {
    let url = this.router.url;
    url = url.replace("/lista", "/novo");
    this.router.navigateByUrl(url);
  }

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