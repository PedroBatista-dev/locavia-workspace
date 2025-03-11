import { BaseResourceModel } from "../../../shared/models/base-resource.model";


export class CompraVeiculoMotivoPedido extends BaseResourceModel {
    constructor(
        public CodigoMotivoPedido?: string,
        public Descricao?: string,
        public StatusMotivoPedido?: string,
        public CodigoRestricao?: string,
        public Estoque?: string,
        public RenovacaoFrota?: string,
        public CodigoOrganizacao?: string
    ) {
        super()
    }

    static fromJson(jsonData: any): CompraVeiculoMotivoPedido {
        return Object.assign(new CompraVeiculoMotivoPedido(), jsonData);
    }
}