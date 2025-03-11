import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListagemComprasAtivosMotivosPedidoComponent } from './listagem-compras-ativos-motivos-pedido.component';

describe('ListagemComprasVeiculosMotivosPedidoComponent', () => {
  let component: ListagemComprasAtivosMotivosPedidoComponent;
  let fixture: ComponentFixture<ListagemComprasAtivosMotivosPedidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListagemComprasAtivosMotivosPedidoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListagemComprasAtivosMotivosPedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});