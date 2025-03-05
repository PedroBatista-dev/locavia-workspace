import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormularioComprasAtivosMotivosPedidoComponent } from './formulario-compras-ativos-motivos-pedido.component';

describe('FormularioComprasVeiculosMotivosPedidoComponent', () => {
  let component: FormularioComprasAtivosMotivosPedidoComponent;
  let fixture: ComponentFixture<FormularioComprasAtivosMotivosPedidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormularioComprasAtivosMotivosPedidoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormularioComprasAtivosMotivosPedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});