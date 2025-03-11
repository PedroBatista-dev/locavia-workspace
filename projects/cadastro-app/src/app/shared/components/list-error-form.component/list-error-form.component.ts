import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { generateMessageValidator } from '../../helpers/generate-message-validator';

@Component({
  selector: 'app-list-error-form',
  templateUrl: './list-error-form.component.html',
  styleUrls: ['./list-error-form.component.scss']
})
export class ListErrorFormComponent implements OnInit {

  @Input() forms!: { title: string; form: FormGroup }[]; //array de formularios contendo title e controls
  @Input() form!: FormGroup; //formulario unico
  @Input() controlLabels: any; //objeto com key e value para exibição
  typeForm!: string;

  controlsErros: any;
  
  constructor() { }

  ngOnInit(): void {
    if(this.forms){
      this.controlsErros = generateMessageValidator(this.forms, this.controlLabels, undefined)
      this.typeForm = 'array';
    } else if(this.form){
      this.controlsErros = generateMessageValidator(this.forms, this.controlLabels, this.form)
      this.typeForm = 'unique';
    }
  }

  setError(control: FormControl){
    control.markAsTouched();
  }

  resetError(control: FormControl){
    control.markAsUntouched();
  }

}