import { AfterViewChecked, Directive, ElementRef, Input } from "@angular/core";
import { AbstractControl } from "@angular/forms";

@Directive({
  selector: "[errorValidators]",
})
export class ErrorValidatorsDirective implements AfterViewChecked {
  @Input()
  errorValidators!: AbstractControl;

  constructor(private element: ElementRef) {}

  ngAfterViewChecked() {
    // captura a tag mat-error
    const tag: HTMLElement = this.element.nativeElement;
    tag.innerHTML = `${this.getErrorMessage(this.errorValidators)}`;
  }

  getErrorMessage(control: AbstractControl) {
    if (control.invalid) {
      if (control.hasError("invalidDate")) return "Data inválida";
      else if (control.hasError("required")) return "Dado obrigatório";
      else if (control.hasError("invalid")) return control!.errors!['message'];
      else if (control.hasError("email")) return "Formato de e-mail inválido";
      else if (control.hasError("CPFinvalid")) return "CPF inválido";
      else if (control.hasError("CNPJinvalid")) return "CNPJ inválido";
      else if (control.hasError("normaNBR6066invalid")) return "NBR6066 carateres ('Q', 'I', 'O') não são válidos.";
      else if (control.hasError("AutocompleteInvalid")) return "Selecione um valor válido";
      else if (control.hasError("minlength")) {
        let length = control!.errors!['minlength'].requiredLength;
        return `Deve ter no mínimo ${length} caracteres`;
      } else if (control.hasError("maxlength")) {
        let length = control!.errors!['maxlength'].requiredLength;
        return `Deve ter no máximo ${length} caracteres`;
      } else if (control.hasError("max")) {
        let length = control!.errors!['max'].max;
        return `O valor máximo deve ser ${length}`;
      } else if (control.hasError("UFinvalid")) return "UF inválido";
      else if (control.hasError("confirmedValidator")) return "Senhas não correspondem";
      else if (control.hasError("valorMinimoMaximo")) return control!.errors!['message'];
      else if (control.hasError("registroExistente")) return control!.errors!['message'];
      else if (control.hasError("registroInexistente")) return control!.errors!['message'];
      else if (control.hasError("registroInvalido")) return control!.errors!['message'];
      else if (control.hasError("confirmedValorDocumentoPercentual")) return "Percentuais ultrapassando 100%";
      else if (control.hasError("dataVencimentoFormatoValidator")) return "Formato inválido ";
      else if (control.hasError("confirmedValorDocumento")) return "Valor do Documento não pode ser negativo";
      else if (control.hasError("confirmedValorDocumentoValor")) return "Valores ultrapassando o valor do documento";
      else if (control.hasError("confirmedPercentualNatureza")) return control!.errors!['message'];
      else if (control.hasError("dataValidator")) return control!.errors!['message'];
      else if (control.hasError("horasValidator")) return control!.errors!['message'];
      else if (control.hasError("dataValidatorMinMax")) return control!.errors!['message'];
      else if (control.hasError("dataFuturaValidator")) return control!.errors!['message'];
      else if (control.hasError("dataAtualValidator")) return control!.errors!['message'];
      else if (control.hasError("datasValidator")) return control!.errors!['message'];
      else if (control.hasError("periodoValidator")) return control!.errors!['message'];
      else if (control.hasError("valorRecebidoValidator")) return control!.errors!['message'];
      else if (control.hasError("valorPagoValidator")) return control!.errors!['message'];
      else if (control.hasError("hodometroValidator")) return control!.errors!['message'];
      else if (control.hasError("dataVencimentoValidator")) return control!.errors!['message'];
      else if (control.hasError("hodometroVeiculoInferior")) return "Hodômetro não pode ser inferior ao atual do veículo";
      else if (control.hasError("dataHoraMenorUltimaMovimentacao")) return "Data/Hora menor que a da última movimentação";
      else if (control.hasError("dataHoraMenorUltimoContrato")) return "Data Hora menor que o último contrato";
      else if (control.hasError("clienteBloqueado")) return control!.errors!['message'];
      else if (control.hasError("veiculoStatusInvalido")) return control!.errors!['message'];
      else if (control.hasError("cartaoInvalid")) return "O número do cartão é inválido";
      else if (control.hasError("naturezaGastoInvalido")) return "Natureza já selecionada em outro campo";
      else if (control.hasError("elementoPrincipalValidator")) return control!.errors!['message'];
      else if (control.hasError("dataVencimentoValidator")) return control!.errors!['message'];
      else if (control.hasError("quantidadeValidator")) return control!.errors!['message'];
      else if (control.hasError("MaiorQueAtual")) return "A data deve ser maior que a data atual";
      else if (control.hasError("DataHoraMaiorQueAtual")) return "Data e hora devem ser maiores que a atual";
      else if (control.hasError("EstoqueMin")) return "O estoque mínimo deve ser menor que o estoque máximo";
      else if (control.hasError("totalFormaPagamentoDiferenteTotalFatura"))
        return "A somatória das formas de pagamento é diferente do total dos valores fatura";
      else if (control.hasError("sinalVerdeMaior")) return "Sinal verde maior que o sinal amarelo ou vermelho";
      else if (control.hasError("sinalAmareloMaior")) return "Sinal amarelo maior que o sinal vermelho";
      else if (control.hasError("grupoDespesaNaoVinculadoNaturezaGasto"))
        return "Grupo de despesa sem natureza de gasto vinculada.";
      else if (control.hasError("totalFormaPagamentoDiferenteTotalItem"))
        return control!.errors!['message']
          ? control!.errors!['message']
          : "A somatória das formas de pagamento é diferente do total dos itens";
      else if (control.hasError("terceiroTestemunhaExistente")) return control!.errors!['message'];
      else if (control.hasError("holiday")) return "A data não pode ser um feriado";
      else if (control.hasError("valorZeradoValidator")) return "O valor deve ser maior que zero";
      else if (control.hasError("valorMenorQueZeroValidator")) return "O valor deve ser maior ou igual a zero";
      else if (control.hasError("atLeastOne")) return control!.errors!['message'];
      else if (control.hasError("latitudeLongitudeValidator")) return control!.errors!['message'];
      else if (control.hasError("sameVeiculoRequisicaoFrete")) return control!.errors!['message'];
      else if (control.hasError("veiculoExistenteRequisicao")) return control!.errors!['message'];
      else if (control.hasError("valorMenorQue")) return control!.errors!['message'];
      else if (control.hasError("sameValueInTable")) return "";
      else return `Valor inválido`;
    } else return "";
  }
}