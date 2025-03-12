/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioVeiculosRestricoesComponent } from './formulario-veiculos-restricoes.component';

describe('FormularioVeiculosRestricoesComponent', () => {
  let component: FormularioVeiculosRestricoesComponent;
  let fixture: ComponentFixture<FormularioVeiculosRestricoesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormularioVeiculosRestricoesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormularioVeiculosRestricoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});