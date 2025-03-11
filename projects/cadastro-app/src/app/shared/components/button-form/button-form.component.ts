import { AfterViewInit, Component, EventEmitter, HostListener, Input, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { debounceTime } from "rxjs/operators";
import { ElementRef } from '@angular/core';
import { generateMessageValidator } from "../../helpers/generate-message-validator";
interface CustomButton {
  name: string;
  id: string;
  disabled: boolean;
  class?: string;
  type?: string;
  notShow?: boolean;
  info: { key: string; value: string }[];
}
interface Option {
  name: string;
  id: string;
  icon: string;
  color: string;
  disabled?: boolean;
  iconType?: string;
  hide?: boolean;
}
@Component({
  selector: 'app-button-form',
  templateUrl: './button-form.component.html',
  styleUrls: ['./button-form.component.scss'],
})
export class ButtonFormComponent implements AfterViewInit {
  @Input() disabledSalvar!: boolean;
  @Input() condicoesSalvar: any;
  @Input() condicoesEditar: any;
  @Input() enableLoader = true;
  @Input() startLoader = false;
  showTabNav!: boolean;
  showLoader: boolean = false;
  @Input() forms!: { title: string; form: FormGroup }[];
  @Input() form!: FormGroup;
  @Input() controlLabels: any;
  @Input() showErrors: boolean = false;
  // adiciona botao personalizado alem de salvar/editar e fechar
  @Input() customButton!: CustomButton;

  @Input() otherOptions!: Option[];

  @Input() tooltip: string = "";
  @Output() voltarClick = new EventEmitter();
  @Output() editarClick = new EventEmitter();
  @Output() customButtonClick = new EventEmitter();
  @Output() onOtherOptionClick = new EventEmitter();
  @Output() nextTabClick = new EventEmitter();
  @Output() previousTabClick = new EventEmitter();

  public isTooltipVisible = false;
  public showInfoCustom = false;

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit() {
    this.validateCustomButton();
    this.checkTabHeight();
  }

  validateCustomButton() {
    const button = this.customButton
    if(button){
        if (!button.name || button.disabled === undefined) {
          throw new Error('Os campos name e disabled são obrigatórios para o botão customizado.');
        }
    }
  }

  getCondicionToShowCustomButton(): boolean {
    if (this.customButton) {
      if (this.customButton.hasOwnProperty('notShow')) {
        return this.customButton.notShow == false;
      } else {
        return true; 
      }
    } else {
      return false; 
    }
  }

  checkTabHeight() {
    let el = document.getElementsByClassName("mat-tab-body-active");
    if (el) {
      if (el.length > 0)
        if (el[0].clientHeight > 450) {
          this.showTabNav = true;
        }
    }
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent) {
    // Verifica se o clique ocorreu fora do componente
    if (!this.isClickInsideComponent(event)) {
      // Fecha o tooltip
      this.isTooltipVisible = false;
    }
  }

  private isClickInsideComponent(event: MouseEvent): boolean {
    // Verifica se o clique ocorreu dentro do componente ou do tooltip
    const clickedElement = event.target as HTMLElement;
    return this.isTooltipVisible && this.elementRef.nativeElement.contains(clickedElement);
  }

  getTooltip(){
    if(this.forms){
      return generateMessageValidator(this.forms, this.controlLabels, undefined);
    } else if(this.form){
      return generateMessageValidator([], this.controlLabels, this.form);
    }
  }

  onEditarClick(event: any) {
    this.editarClick.emit(event);
  }

  onChangeCustom(event: any) {
    this.customButtonClick.emit(event);
  }

  otherOptionClick(event: any) {
    this.onOtherOptionClick.emit(event);
  }

  showInfo() {
    this.showInfoCustom = true;
  }

  hiddenInfo() {
    this.showInfoCustom = false;
  }

  toggleTooltipVisibility() {
    this.isTooltipVisible = !this.isTooltipVisible;
  }

  onVoltarClick(event: any) {
    this.voltarClick.emit(event);
  }
  onNextTabClick(event: any) {
    this.nextTabClick.emit(event);
  }
  onPreviousTabClick(event: any) {
    this.previousTabClick.emit(event);
  }
  onSaveClick() {
    debounceTime(100);
    this.showLoader = this.enableLoader;
  }
  ngOnChanges(change: any) {
    if (change.disabledSalvar) {
      if (change.disabledSalvar == false) {
        this.showLoader = false;
      }
    }

    if (change.startLoader) {
        this.showLoader = change.startLoader.currentValue;
    }
  }
}