import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListagemVeiculosRestricoesComponent } from './listagem-veiculos-restricoes.component';

describe('ListagemVeiculosRestricoesComponent', () => {
  let component: ListagemVeiculosRestricoesComponent;
  let fixture: ComponentFixture<ListagemVeiculosRestricoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListagemVeiculosRestricoesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListagemVeiculosRestricoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});