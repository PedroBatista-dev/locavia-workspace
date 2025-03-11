import { SelectionModel } from "@angular/cdk/collections";
import {
    AfterContentChecked,
    AfterContentInit,
    AfterViewChecked,
    AfterViewInit,
    Directive,
    ElementRef,
    Injector,
    OnDestroy,
    OnInit,
    ViewChild,
} from "@angular/core";
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
} from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { MatPaginator, MatPaginatorIntl, PageEvent } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { MatTabGroup } from "@angular/material/tabs";
import { ActivatedRoute, Router } from "@angular/router";
import * as moment from "moment";
import { BehaviorSubject, Subject, Subscription } from "rxjs";
import { SweetAlertIcon } from "sweetalert2";
import { BaseResourceModel } from "../../models/base-resource.model";
import { BaseResourceService } from "../../service/base-resource.service";
import { TableService } from "../../service/table.service";
import { customSwal } from "../../styles/sweetalert";
import { setDateValid } from "../../routines/setDateValid";
import { FormPropertiesService } from "../../service/form-properties.service";

@Directive()
export abstract class BaseResourceFormComponent<T extends BaseResourceModel>
  implements OnInit, AfterContentInit, AfterContentChecked, AfterViewInit, AfterViewChecked, OnDestroy
{
  currentAction!: string;
  resourceForm!: FormGroup;
  pageTitle!: string;
  submittingForm: boolean = false;
  formControl!: AbstractControl;
  key!: string; //chave primaria do registro
  custom_url!: string;
  setLoader: boolean = true;
  userLogged: any; //Variavel por capturar o usuario logado e seus dados
  formName!: string; //nome do formulario
  tableService: TableService;
  //Menu de Ações - ms
  delay = 10000;
  lastCall: any;
  lastElement: any;

  // resultado dos submits eviados
  resultSubmitForm = new Subject<any>();

  // chave temporaria usada para inserção de anexos
  tempKey: string | null = null;

  //variaveis referentes a navegação entre registros da listagem
  navigationControl!: number[];
  ncNext: number | null = null;
  ncPrevious: number | null = null;
  ncIndex!: number;

  // objeto contendo as propriedades do log
  logData: Object = {};
  //navegação entre abas do formulário

  @ViewChild("tab", { static: false }) tabGroup!: MatTabGroup;
  showSecondaryControl!: boolean;
  tabCount!: number;
  lastField: any;

  dataSource = new MatTableDataSource();

  pageScroll: number = 0;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  length = 0;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  showProgressBar: boolean = false;

  selection = new SelectionModel<any>(true, []);
  exibirAlertaTrocaDeRota = true;

  // Atributo que controla exibição das abas
  // utilizar na tag mat-tab [(selectedIndex)]="tabIndex"
  tabIndex: number = 0;

  private subscription = new Subscription();
  private formPropertiesService: FormPropertiesService;
  protected route: ActivatedRoute;
  protected router: Router;
  protected formBuilder: FormBuilder;
  protected dialogBase: MatDialogRef<any> | null;
  private el: ElementRef;
  protected endRequisition$$ = new BehaviorSubject<boolean>(false);

  constructor(
    protected injector: Injector,
    public resource: T,
    protected resourceService: BaseResourceService<T>,
    protected jsonDataToResourceFn: (jsonData: any) => T,
    public Entidade: string
  ) {
    try {
      this.dialogBase = this.injector.get(MatDialogRef);
    } catch {
      this.dialogBase = null;
    }
    this.route = this.injector.get(ActivatedRoute);
    this.el = this.injector.get(ElementRef);
    this.router = this.injector.get(Router);
    this.formBuilder = this.injector.get(FormBuilder);
    this.tableService = injector.get(TableService);
    this.formPropertiesService = this.injector.get(FormPropertiesService);
    // captura as informacoes do formulario de acordo com as permissoes do usuario
    this.formPropertiesService.setFormID(this.router.url);
  }

  ngOnInit() {
    this.setCurrentAction(); //Informa se insercao ou edicao
    this.buildResourceForm(); //cria o formulario de dados
    this.loadResource(); // le os dados de acordo com o formulario
    this.loadResourcesOptions();

    //se estiver consultando desabilita os controles
    if (this.isConsultar()) {
      this.disableControls();
    } else if (this.currentAction == "novo")
      //seta os valores default do form caso ele esteja como novo
      this.resource = this.resourceForm.value;
  }

  ngAfterContentChecked() {
    this.setPageTitle();

    if (this.paginator) {
      const intl = new MatPaginatorIntl();
      intl.itemsPerPageLabel = "Itens por página:";
      const auxGetRange = intl.getRangeLabel;
      intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
        return auxGetRange(page, pageSize, length).replace(/of/g, "de");
      };
      this.paginator._intl = intl;
      this.paginator._intl.changes.next();
    }
  }

  ngAfterContentInit(): void {}

  ngAfterViewInit() {
    this.loadResourcesAfterViewInit();
    this.setTabCount();
    this.setScrollListener();
  }

  ngAfterViewChecked() {}

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // Metodo criado para setar null em campos string vazio ('')
  setNullEmptyValue(valor: any) {
    if (valor !== null) {
      if (Array.isArray(valor)) {
        valor.forEach((indice) => {
          this.setNullEmptyValue(indice);
        });
      } else if (typeof valor === "object") {
        Object.keys(valor).forEach((key) => {
          valor[key] = this.setNullEmptyValue(valor[key]);
        });
      } else if (typeof valor === "string") {
        if (valor.trim() === "") return null;
      } else return valor;
    }
    return valor;
  }

  submitForm() {
    this.submittingForm = true;
    if (this.currentAction == "novo") {
      this.createResource();
    } else {
      this.updateResource();
    }
  }

  protected setCurrentAction() {
    // possiveis acoes dos formularios
    let actions: any = {
      novo: "novo",
      editar: "editar",
      filtrar: "filtrar",
      consultar: "consultar",
    };

    let action = "";
    let paths = this.route.snapshot.url;
    for (let path of paths) {
      if (actions.hasOwnProperty(path.path)) action = path.path;
    }

    this.currentAction = action != "" ? actions[action] : "editar";

    // captura a key do form
    if (this.route.snapshot.params) {
      let chave = Object.keys(this.route.snapshot.params);
      this.key = chave[0];
    }
  }

  protected setFormGroup(form: FormGroup, resource: any) {
    Object.keys(form.controls).forEach((key) => {
      if (form.controls[key] instanceof FormGroup) {
        if (resource[key] == null) resource[key] = {};
        this.setFormGroup(form.controls[key] as FormGroup, resource[key]);
      }
    });
  }

  getServerData(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  protected refreshResource() {
    let currentUrl = this.router.url;
    this.router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  protected loadResourceModal() {
    if (this.resourceForm) this.resource = this.resourceForm.value;
  }

  protected loadResource() {
    if ((this.currentAction == "editar" || this.isConsultar()) && this.Entidade) {
      if (this.route.snapshot.data[this.Entidade]) {
        let resource = this.route.snapshot.data[this.Entidade];
        resource = setDateValid(resource);
        // captura os dados do log do registro
        let { InseridoPor, InseridoEm, ModificadoPor, ModificadoEm } = resource;
        this.logData = { InseridoPor, InseridoEm, ModificadoPor, ModificadoEm };

        this.setFormGroup(this.resourceForm, resource);

        if (resource) this.resourceForm.patchValue(resource);

        this.resource = this.resourceForm.value;

        this.loadResourcesOptionsAfterForm();
      } else {
        const error = {
          status: 500,
          message: "Ocorreu um erro no servidor, tente mais tarde.",
        };
        this.actionsForError(error);
      }
      this.setLoader = false;
    } else {
      this.setLoader = false;
    }
  }

  protected setPageTitle() {
    let actions: any = {
      novo: "Cadastrando",
      editar: "Editando",
      consultar: "Consultando",
    };
    this.pageTitle = this.currentAction != "filtrar" ? actions[this.currentAction] + " " + this.formName : "";
  }

  protected setKey(resource: any): T {
    Object.keys(resource).forEach((key) => {
      if (resource[key] !== null) {
        if (resource[key]?.key) {
          resource[key] = resource[key]?.value;
        } else if (typeof resource[key] === "object") {
          this.setKey(resource[key]);
        }
      }
    });
    return resource;
  }

  protected dateIsValid(resource: T): T {
    (Object.keys(resource) as (keyof T)[]).forEach((key) => {
      if (Array.isArray(resource[key])) {
        resource[key].forEach((element: any) => {
          this.dateIsValid(element);
        });
      }
      if (typeof resource[key] === "object" && resource[key] !== null) {
        this.dateIsValid(resource[key]);
      }
      if (moment(resource[key], "YYYY-MM-DDTHH:mm", true).isValid()) {
        resource[key] = resource[key].concat(":00.000Z");
      }
      if (moment(resource[key], "YYYY-MM-DD", true).isValid()) {
        resource[key] = resource[key].concat("T00:00:00.000Z");
      }
    });
    return resource;
  }

  protected createResource() {
    let resource: T = this.jsonDataToResourceFn(this.resourceForm.getRawValue());

    (Object.keys(resource) as (keyof T)[]).forEach((key) => {
      resource[key] = this.setNullEmptyValue(resource[key]);
    });

    resource = this.setKey(resource);

    resource = this.dateIsValid(resource);

    this.subscription.add(
      this.resourceService.create(resource).subscribe(
        (response) => {
          this.resultSubmitForm.next(response);
          this.actionsForSuccess(response);
          this.endRequisition$$.next(true);
        },
        (error) => this.actionsForError(error)
      )
    );
  }

  protected updateResource() {
    let resource: any = this.jsonDataToResourceFn(this.resourceForm.getRawValue());

    Object.keys(resource).forEach((key) => {
      resource[key] = this.setNullEmptyValue(resource[key]);
    });

    resource = this.setKey(resource);

    resource = this.dateIsValid(resource);

    this.subscription.add(
      this.resourceService.update(resource, this.key, this.custom_url).subscribe(
        (response) => {
          this.resultSubmitForm.next(response);
          this.actionsForSuccess(response);
          this.endRequisition$$.next(true);
        },
        (error) => this.actionsForError(error)
      )
    );
  }

  navigateConsultar(response: T) {
    const [, module, resources] = this.router.url.split("/");
    const id = response[this.key] ?? this.resourceForm.get(this.key)!.value;
    this.router.navigate([module, resources, id, "consultar"]);
  }

  protected actionsForSuccess(response: T, customAlert?: any, redirectList = false) {
    if(customAlert) {
      customAlert();
    } else {
      customSwal.fire({
        position: "center",
        icon: "success",
        title: "Solicitação processada com sucesso!",
        showConfirmButton: false,
        timer: 1200,
      });
    }

    const [, module, resources, , method] = this.router.url.split("/");

    if (this.dialogBase) this.dialogBase.close(this.resourceForm.value);

    if (
      resources !== "organizacoes" &&
      resources !== "parametros-configuracao-senha" &&
      (!method || method == "editar" || method == "consultar")
    ) {
      if ((method == "editar" || method == "consultar") && !redirectList) {
        return this.navigateConsultar(response);
      }
      this.router.navigate([module, resources, "lista"]);
    } else {
      this.navigateConsultar(response);
    }
  }

  protected actionsForError(error: any) {
    this.submittingForm = false;
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

  protected loadResourcesOptions(): void {}

  protected loadResourcesOptionsAfterForm(): void {}

  protected loadResourcesAfterViewInit() {}

  // funcao que é chamada quando o current action muda seu valor exemplo quando clicamos em editar
  protected changeCurrentAction() {}

  protected abstract buildResourceForm(): void;

  // função que desabilida os control do form
  disableControls() {
    Object.keys(this.resourceForm.controls).forEach((control) => {
      this.resourceForm.get(control)!.disable();
    });
  }

  navigateNext() {
    localStorage.setItem("nav_ctrl", JSON.stringify(this.navigationControl));
    let url = this.router.url;
    this.router.navigateByUrl("cadastro/ativos", { skipLocationChange: true }).then(() => {
      this.router.navigateByUrl(url.replace(String(this.navigationControl[this.ncIndex]), String(this.ncNext)));
    });
  }

  navigatePrevious() {
    localStorage.setItem("nav_ctrl", JSON.stringify(this.navigationControl));
    let url = this.router.url;
    this.router.navigateByUrl("cadastro/ativos", { skipLocationChange: true }).then(() => {
      this.router.navigateByUrl(url.replace(String(this.navigationControl[this.ncIndex]), String(this.ncPrevious)));
    });
  }

  //funções para navegar entre abas

  setTabCount() {
    this.tabCount = this.tabGroup?._tabs.length ?? 0;
  }

  navigateNextTab() {
    this.tabGroup.selectedIndex = (this.tabGroup.selectedIndex! + 1) % this.tabCount;
  }

  navigatePreviousTab() {
    this.tabGroup.selectedIndex == 0
      ? (this.tabGroup.selectedIndex = this.tabCount - 1)
      : this.tabGroup.selectedIndex!--;
  }

  setScrollListener() {
    const card = this.el.nativeElement.querySelector(".card");
    const tabHeader = this.el.nativeElement.querySelector("mat-tab-header");
    const tabWrapper = this.el.nativeElement.querySelector(".mat-tab-body-wrapper");
    if (card) {
      card.addEventListener("scroll", (event: any) => {
        let hasOpenProcess = !this.el.nativeElement.querySelector(".exibir-processo-locavia")?.hasAttribute("hidden");
        if (hasOpenProcess) {
          if (card.scrollTop > 250 && event.target.offsetWidth != 1500) {
            tabHeader ? tabHeader.classList.add("fixed-tab") : null;
          } else {
            tabHeader ? tabHeader.classList.remove("fixed-tab") : null;
            tabWrapper ? tabWrapper.classList.remove("pt-70") : null;
          }
        } else {
          if (card.scrollTop > 160 && event.target.offsetWidth != 1500) {
            tabHeader ? tabHeader.classList.add("fixed-tab") : null;
            tabWrapper ? tabWrapper.classList.add("pt-70") : null;
          } else {
            tabHeader ? tabHeader.classList.remove("fixed-tab") : null;
            tabWrapper ? tabWrapper.classList.remove("pt-70") : null;
          }
        }
      });
    }
  }

  // habilita os controls fo formulario
  enableControls() {
    const [, module, resources] = this.router.url.split("/");
    this.router.navigate([module, resources, this.resourceForm.get(this.key)!.value, "editar"]);
  }

  // funcao chamada pelos botoes voltar dos formularios
  public confirmationCancel(event: Event, url: string, modalForm?: any) {
    // caso tenha uma url realiza a navegacao para a mesma
    if (url !== "") this.router.navigateByUrl(url);
    // caso possua um form modal realiza o fechamento do mesmo
    if (modalForm) modalForm.close();
  }

  // funcao chamada para habilitar ou nao o botao editar dos formularios
  public validateEdition() {
    return this.isConsultar() && this.formPropertiesService.activeAction("Editar");
  }

  isConsultar(): boolean {
   return this.currentAction == "consultar";
  }

  public setCheckbox(event: any, campo: string): void {
    event.checked ? this.resourceForm.get(campo)!.setValue("S") : this.resourceForm.get(campo)!.setValue("N");
  }
}