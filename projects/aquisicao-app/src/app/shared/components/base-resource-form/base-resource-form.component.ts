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
    AsyncValidatorFn,
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    ValidatorFn,
    Validators,
} from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { MatPaginator, MatPaginatorIntl, PageEvent } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { MatTabGroup } from "@angular/material/tabs";
import { ActivatedRoute, Router } from "@angular/router";
import * as moment from "moment";
import { BehaviorSubject, Subject, Subscription } from "rxjs";
import { debounceTime, first, map, startWith, switchMap } from "rxjs/operators";
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
  private camposObrigatoriosAnteriores = [];

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
    this.setEmpresaDefaultForm();
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

  removeEmpty(obj: any) {
    Object.entries(obj).forEach(([key]) => {
      if (obj[key] && typeof obj[key] === 'object') {
        this.removeEmpty(obj[key]);
        if(Object.keys(obj[key]).length === 0) {
          delete obj[key]
        }
      } else if (obj[key] == null || obj[key] === '' || (typeof obj[key] === 'object' && obj[key].length === 0)) {
        delete obj[key];
      }
    })
    return obj;
  }

  submitForm() {
    this.submittingForm = true;
    if (this.currentAction == "novo") {
      this.createResource();
    } else {
      this.updateResource();
    }
  }

  simpleToggle(element?: any) {}

  public validatorRegistroExistente(entidade: string, campo: string, key: string): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) {
        return null; // Não faça validação se o valor estiver vazio
      }

      return control.valueChanges.pipe(
        startWith(control.value),
        debounceTime(200),
        switchMap(() =>
          this.resourceService.getAll(
            `?filters=${entidade}.${campo}=${control.value};${entidade}.${key}=NOT(${
              this.resourceForm.get(key)!.value ?? "0"
            })`
          )
        ),
        map((retorno: any) => {
          if (retorno.length > 0) {
            this.submittingForm = true;
            return {
              registroExistente: true,
              message: "Registro já existente.",
            };
          } else {
            if (control?.errors && !control?.errors['registroExistente']) {
              this.submittingForm = true;
              return;
            } else {
              this.submittingForm = false;
              return null;
            }
          }
        }),
        first()
      );
    };
  }

  protected setCurrentAction() {
    // possiveis acoes dos formularios
    let actions = {
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

  /**
   * Caso uma valor que for preencher um formGroup seja null, o valor é substituido por um objeto vazio
   */
  protected setFormGroup(form: FormGroup, resource: any) {
    Object.keys(form.controls).forEach((key) => {
      if (form.controls[key] instanceof FormGroup) {
        if (resource[key] == null) resource[key] = {};
        this.setFormGroup(form.controls[key] as FormGroup, resource[key]);
      }
    });
  }

  protected setFormArray(form: FormGroup, resource: any) {
    Object.keys(form.controls).forEach((key) => {
      if (form.controls[key] instanceof FormArray) {
        const formArray = form.controls[key] as FormArray;
        if (formArray.length > 0) {
          for (let index = 0; index < resource[key]?.length; index++) {
            formArray.push(this.cloneAbstractControl(formArray.controls[0], resource[key][index] as FormGroup));
          }
          formArray.controls.shift();
        }
      } else if (form.controls[key] instanceof FormGroup && resource[key]) {
        this.setFormArray(form.controls[key] as FormGroup, resource[key]);
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

        this.setFormArray(this.resourceForm, resource);
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

  // protected setDateValid(resource: Object) {
  //   Object.keys(resource).forEach((key) => {
  //     if (Array.isArray(resource[key])) {
  //       resource[key].forEach((element) => {
  //         this.setDateValid(element);
  //       });
  //     }
  //     if (typeof resource[key] == "object" && resource[key]) {
  //       this.setDateValid(resource[key]);
  //     }
  //     const formatoData =
  //       /^((\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d{3})Z)$/;
  //     if (formatoData.test(resource[key])) {
  //       // if (moment(resource[key], "YYYY-MM-DDTHH:mm:ss.SSSZ", true).isValid()) {
  //       if (
  //         key.includes("Hora") ||
  //         key == "InseridoEm" ||
  //         key == "ModificadoEm"
  //       )
  //         resource[key] = moment.utc(resource[key]).format("YYYY-MM-DDTHH:mm");
  //       else resource[key] = moment.utc(resource[key]).format("YYYY-MM-DD");
  //     }
  //   });
  //   return resource;
  // }

  cloneAbstractControl<T extends AbstractControl>(control: T, value = null): T {
    let newControl: T;

    if (control instanceof FormGroup) {
      const formGroup = new FormGroup({}, control.validator, control.asyncValidator);
      const controls = control.controls;

      Object.keys(controls).forEach((key) => {
        formGroup.addControl(key, this.cloneAbstractControl(controls[key], value[key]));
      });

      newControl = formGroup as any;
    } else if (control instanceof FormArray) {
      const formArray = new FormArray([], control.validator, control.asyncValidator);

      control.controls.forEach((formControl) => {
        Object.keys(value).forEach((key) => formArray.push(this.cloneAbstractControl(formControl, value[key])));
      });

      newControl = formArray as any;
    } else if (control instanceof FormControl) {
      newControl = new FormControl(value, control.validator, control.asyncValidator) as any;
    } else {
      // throw new Error("Error: unexpected control value");
    }

    if (control) if (control.disabled) newControl.disable({ emitEvent: false });

    return newControl;
  }

  protected setPageTitle() {
    let actions = {
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
    Object.keys(resource).forEach((key) => {
      if (Array.isArray(resource[key])) {
        resource[key].forEach((element) => {
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

    Object.keys(resource).forEach((key) => {
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
    let dadosUpdate = resource;

    this.subscription.add(
      this.resourceService.update(resource, this.key, this.custom_url).subscribe(
        (response) => {
          this.resultSubmitForm.next(response);
          this.actionsForSuccess(response);
          if (this.Entidade == "usuario") this.checkUpdateUserLogged(dadosUpdate);

          // Da next no endRequisition para informar que a requisição foi finalizada e apatir disso
          // possibilitar a adição de algum side effect a partir da subscrição nesse subject
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

  mascaraTelefone(control: AbstractControl): string {
    const CELULAR = "(00) 00000-0000";
    const AMBAS = "(00) 00000-0000||(00) 0000-0000";

    if (control.value) {
      if (control.value.length == 11 && control.pristine == true) return CELULAR;
      else return AMBAS;
    } else return "";
  }

  // Máscara cartão oculto para usuário sem permissão e cartão limpo para usuário com permissão

  mascaraInputCartao(input: AbstractControl) {
    if ((input.valid || input.disabled || this.isConsultar()) && input.value?.length == 16) {
      return "XXXXXXXXXXXX0000";
    } else if ((input.valid || input.disabled || this.isConsultar()) && input.value?.length == 15) {
      return "XXXXXXXXXXX0000";
    } else if ((input.valid || input.disabled || this.isConsultar()) && input.value?.length == 14) {
      return "XXXXXXXXXX0000";
    } else if ((input.valid || input.disabled || this.isConsultar()) && input.value?.length == 13) {
      return "XXXXXXXXX0000";
    } else {
      return "0*";
    }
  }

  mascaraInputDataCartao(input: AbstractControl) {
    if ((input.valid || input.disabled || this.isConsultar()) && input.value?.length == 6) {
      return "XX/XXXX";
    } else {
      return "M0/0000";
    }
  }

  limparCampoCartao(input: AbstractControl) {
    if (input.valid) {
      input.setValue("");
    }
  }

  getArray(observable: any, resource: string) {
    this.subscription.add(
      observable.subscribe(
        (httpResource: any) => {
          this[resource] = httpResource;
        },
        () => this.actionsForError(null)
      )
    );
  }

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

  navigateToTab(label: string) {
    setTimeout(() => {
      const tabs = this.tabGroup._tabs.toArray();
      const tabIndex = tabs.findIndex(tab => tab.textLabel === label);
  
      if (tabIndex !== -1) {
        this.tabIndex = tabIndex;
      } 
    }, 0)
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

  // funcao que seta o campo empresa caso ele exista no formulario com a empresa que o usuario possui como default
  protected setEmpresaDefaultForm() {
    if (this.userLogged?.Empresas.length > 0) {
      // captura a empresa que esta como EmpresaDefault = S
      const empresaDefault = this.userLogged.Empresas.find((empresa: any) => empresa.EmpresaDefault == "S");
      // veriica se o form possui o atributo CodigoEmpresa e se o formulario esta em modo de inserção
      if (
        this.resourceForm.contains("CodigoEmpresa") &&
        this.currentAction == "novo" &&
        empresaDefault &&
        !this.router.url.includes("/sistema/empresas")
      )
        this.resourceForm.get("CodigoEmpresa")!.setValue(empresaDefault.CodigoEmpresa);
    }
  }

  get grupoUsuario(): string {
    if (this.userLogged) {
      if (this.userLogged.AcessoSimultaneoEmpresas == "S") {
        return this.userLogged.CodigoGrupoUsuarioAcessoSimultaneoEmpresa;
      } else {
        const empresaDefault = this.userLogged.Empresas.find((empresa: any) => empresa.EmpresaDefault === "S");
        return empresaDefault.CodigoGrupoUsuario;
      }
    }
    return '';
  }

  // habilita os controls fo formulario
  enableControls() {
    const [, module, resources] = this.router.url.split("/");
    this.router.navigate([module, resources, this.resourceForm.get(this.key)!.value, "editar"]);
  }

  // pega o tipo do cartão e retorna o caminho da imagem da bandeira
  public getCreditCardType(control: AbstractControl) {
    let result = "../../../../assets/images/credit-cards/generico.svg";

    if (/^3[47]/.test(control.value)) {
      result = "../../../../assets/images/credit-cards/american.svg";
    } else if (/^((?!504175))^((?!5067))(^50[0-9])/.test(control.value)) {
      result = "../../../../assets/images/credit-cards/generico.svg";
    } else if (/3(?:0[0-5]|[68][0-9])[0-9]{11}/.test(control.value)) {
      result = "../../../../assets/images/credit-cards/dinersclub.svg";
    } else if (/6(?:011|5[0-9]{2})[0-9]{12}/.test(control.value)) {
      result = "../../../../assets/images/credit-cards/discover.svg";
    } else if (
      /^4011(78|79)|^43(1274|8935)|^45(1416|7393|763(1|2))|^50(4175|6699|67[0-6][0-9]|677[0-8]|9[0-8][0-9]{2}|99[0-8][0-9]|999[0-9])|^627780|^63(6297|6368|6369)|^65(0(0(3([1-3]|[5-9])|4([0-9])|5[0-1])|4(0[5-9]|[1-3][0-9]|8[5-9]|9[0-9])|5([0-2][0-9]|3[0-8]|4[1-9]|[5-8][0-9]|9[0-8])|7(0[0-9]|1[0-8]|2[0-7])|9(0[1-9]|[1-6][0-9]|7[0-8]))|16(5[2-9]|[6-7][0-9])|50(0[0-9]|1[0-9]|2[1-9]|[3-4][0-9]|5[0-8]))/.test(
        control.value
      )
    ) {
      result = "../../../../assets/images/credit-cards/generico.svg";
    } else if (/^606282|^3841(?:[0|4|6]{1})0/.test(control.value)) {
      result = "../../../../assets/images/credit-cards/generico.svg";
    } else if (/^(?:2131|1800|35\d{3})\d{11}/.test(control.value)) {
      result = "../../../../assets/images/credit-cards/generico.svg";
    } else if (/^5[1-5]/.test(control.value)) {
      result = "../../../../assets/images/credit-cards/master.svg";
    } else if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(control.value)) {
      result = "../../../../assets/images/credit-cards/visa.svg";
    }

    return result;
  }

  //mascara a validade e código pré-autorização na consulta para usuário não autorizado
  public setTipoInputDadosCartao(control: AbstractControl) {
    if (control.value == "S") {
      return "text";
    } else if (control.value != "S" && this.currentAction != "novo") {
      return "password";
    }
  }

  //Evento que obriga o usuário a digitar apenas números no input caso não seja possível utilizar o atributo mask
  keyPressNumbers(event: any) {
    let charCode = event.which ? event.which : event.keyCode;
    // Apenas Números 0-9
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }
  // Evento que impede o usuário de digitar qualquer caractere especial, exemplo: ! ? ; $ % *
  public impedirCaractereEspecial(event: any) {
    let key = event.charCode;
    return (key > 64 && key < 91) || (key > 96 && key < 123) || key == 8 || key == 32 || (key >= 48 && key <= 57);
  }

  // funcao chamada pelos botoes voltar dos formularios
  public confirmationCancel(event: Event, url: string, modalForm?: any) {
    // caso tenha uma url realiza a navegacao para a mesma
    if (url !== "") this.router.navigateByUrl(url);
    // caso possua um form modal realiza o fechamento do mesmo
    if (modalForm) modalForm.close();
  }

  async canDeactivate() {
    // Verifique se o formulário foi modificado e exiba um alerta usando o Sweet Alert se for o caso
    if (
      ["editar", "novo"].includes(this.currentAction) &&
      this.verifyChangesForm(this.resourceForm.value, this.resource) &&
      !this.submittingForm &&
      this.exibirAlertaTrocaDeRota
    ) {
      const result = await customSwal.fire({
        title: "Atenção!",
        text: "Dados não salvos serão perdidos, deseja continuar?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, continue!",
        cancelButtonText: "Não, engano",
      });
      return result.value;
    }
    return true;
  }

  // funcao para verificar se os valores do form sofreram alteracao. se sofreu alteracao retorna true se nao false
  public verifyChangesForm(form: any, formDefault: any) {
    let json1 = JSON.stringify(this.setNullEmptyValue(form));
    let json2 = JSON.stringify(this.setNullEmptyValue(formDefault));
    return json1 !== json2;
  }

  // funcao chamada para habilitar ou nao o botao editar dos formularios
  public validateEdition() {
    return this.isConsultar() && this.formPropertiesService.activeAction("Editar");
  }


  isConsultar(): boolean {
   return this.currentAction == "consultar";
  }


  public validateAction(action: string) {
    return this.formPropertiesService.activeAction(action);
  }

  //função que monta os dados do log de inserção e alteracao de registros
  public buildLog() {
    const dataLog = {
      currentAction: this.currentAction,
      codigoUsuarioInsercao: null,
      dataInsercao: "",
      codigoUsuarioAlteracao: null,
      dataAlteracao: "",
    };

    if (this.currentAction != "novo") {
      if (this.logData.hasOwnProperty("InseridoPor") && this.logData["InseridoPor"])
        dataLog.codigoUsuarioInsercao = this.logData["InseridoPor"];

      if (this.logData.hasOwnProperty("InseridoEm") && this.logData["InseridoEm"])
        dataLog.dataInsercao = moment.utc(this.logData["InseridoEm"]).format("DD/MM/YYYY HH:mm");

      if (this.logData.hasOwnProperty("ModificadoPor") && this.logData["ModificadoPor"])
        dataLog.codigoUsuarioAlteracao = this.logData["ModificadoPor"];

      if (this.logData.hasOwnProperty("ModificadoEm") && this.logData["ModificadoEm"])
        dataLog.dataAlteracao = moment.utc(this.logData["ModificadoEm"]).format("DD/MM/YYYY HH:mm");
    }

    return dataLog;
  }

  // captura o valor selecionado do mat select e atribui ao control indicado.
  public getSelected(event: any, control: string): void {
    this.resourceForm.get(control)!.setValue(event.source.triggerValue);
  }

  public setCheckbox(event: any, campo: string): void {
    event.checked ? this.resourceForm.get(campo)!.setValue("S") : this.resourceForm.get(campo)!.setValue("N");
  }

  public setCheckboxFormGroup(event: any, formGroup: FormGroup, campo: string): void {
    event.checked ? formGroup.get(campo)!.setValue("S") : formGroup.get(campo)!.setValue("N");
  }

  public habilitarControlComValidator(controlName: string, validators: ValidatorFn[] = []): void {
    const control = this.resourceForm.get(controlName);
    control!.enable();
    control!.setValidators(validators);
    control!.updateValueAndValidity();
  }

  public habilitarControlComValidatorEAsyncValidator(
    controlName: string,
    validators: ValidatorFn[] = [],
    asyncValidator: AsyncValidatorFn[] = []
  ): void {
    const control = this.resourceForm.get(controlName);
    control!.enable();
    control!.setValidators(validators);
    control!.setAsyncValidators(asyncValidator);
    control!.updateValueAndValidity();
  }

  public desabilitarControlComValidator(controlName: string): void {
    const control = this.resourceForm.get(controlName);
    control!.setValue(null);
    control!.disable();
    control!.clearValidators();
    control!.updateValueAndValidity();
  }

  public desabilitarControlCheckbox(controlName: string): void {
    const control = this.resourceForm.get(controlName);
    control!.setValue("N");
    control!.disable();
  }

  public limparValidators(controlName: string, clearAsync?: boolean): void {
    const control = this.resourceForm.get(controlName);
    control!.clearValidators();
    if (clearAsync) control!.clearAsyncValidators();
    control!.updateValueAndValidity();
  }

  public limparValidatorsAndValor(controlName: string): void {
    const control = this.resourceForm.get(controlName);
    control!.clearValidators();
    control!.updateValueAndValidity();
    control!.setValue(null);
  }

  public inserirValidators(controlName: string, validators: ValidatorFn[]): void {
    const control = this.resourceForm.get(controlName);
    control!.setValidators(validators);
    control!.updateValueAndValidity();
  }

  public isRequired(campo: string) {
    const control = this.resourceForm.get(campo);

    if (control && control.validator) {
      try {
        const validator = control.validator({} as AbstractControl);

        if (validator && validator['required']) {
          return true;
        }
      } catch {
        return false;
      }
    }

    return false;
  }

  public controlIsRequired(campo: string): boolean {
    const control = this.resourceForm.get(campo);
    if (control && control.errors) {
      return control.errors['required'];
    }
    return false;
  }

  public convertExcelDateToJSDate(excelDate: number): Date {
    // O Excel considera 1 de janeiro de 1900 como o dia 1
    const excelBaseDate = new Date(1900, 0, 1);

    // Realize a conversão
    const dataReal = new Date(excelBaseDate.getTime() + excelDate * 24 * 60 * 60 * 1000);
    const dataDisponivel = moment(
      `${dataReal.getDate() - 2}/${dataReal.getMonth() + 1}/${dataReal.getFullYear()}`,
      "DD/MM/YYYY"
    );

    //Convert a data para YYYY-MM-DD HH:mm:ss.SSS
    const dataFormatada = dataDisponivel.format("YYYY-MM-DD HH:mm:ss.SSS");

    return new Date(dataFormatada);
  }

  public possuiValidator(controlName: string, validatorName: string) {
    if (this.resourceForm.get(controlName))
      return this.resourceForm.get(controlName)?.validator
        ? this.resourceForm
            .get(controlName)!
            .validator!(this.resourceForm.get(controlName)!)!
            .hasOwnProperty(validatorName) ?? false
        : false;
    return false;
  }

  public setDatePipe(valor: any) {
    if (
      moment.utc(valor, "YYYY-MM-DDTHH:mm:ss").isValid() &&
      valor.toString().charAt(10) === "T" &&
      valor.toString().charAt(valor.toString().length - 1) === "Z"
    ) {
      return moment.utc(valor, "YYYY-MM-DDTHH:mm:ss").format("DD/MM/YYYY HH:mm");
    } else {
      return valor;
    }
  }

  /**
   * Reseta os campos do formulário que foram definidos como obrigatórios
   * anteriormente através do método definirCamposObrigatorios()
   */
  private resetarCamposObrigatoriosAnteriores() {
    for (const campo of this.camposObrigatoriosAnteriores) {
      const control = this.resourceForm.get(campo);

      if (control) {
        control.clearValidators();
        control.updateValueAndValidity();
      }
    }

    this.camposObrigatoriosAnteriores = [];
  }

  /**
   * Define os campos do formulário como obrigatórios
   * com base no array de campos passado como parâmetro
   */
  public definirCamposObrigatorios(campos: string[], tabela: string = "") {
    this.resetarCamposObrigatoriosAnteriores();

    for (const campo of campos) {
      const control = this.resourceForm.get(tabela ? campo.replace(`${tabela}.`, "") : campo);
      if (control) {
        this.camposObrigatoriosAnteriores.push(tabela ? campo.replace(`${tabela}.`, "") : campo);
        control.setValidators([Validators.required]);
        control.updateValueAndValidity();
      }
    }
  }

  formatDisplayedColumns(displayedColumns: string[], currentWidth: number): string[] {
    if (currentWidth > 768 && displayedColumns[0] == "radio") {
      displayedColumns.shift();
      displayedColumns.push("Acoes");
    } else if (currentWidth <= 768 && displayedColumns[0] != "radio") {
      displayedColumns.unshift("radio");
      displayedColumns.pop();
    }

    return displayedColumns;
  }
}