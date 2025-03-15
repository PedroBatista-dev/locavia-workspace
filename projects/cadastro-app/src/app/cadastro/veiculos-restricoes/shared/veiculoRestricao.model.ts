import { BaseResourceModel } from "../../../shared/models/base-resource.model";

export class VeiculoRestricao extends BaseResourceModel {
    constructor(
        public CodigoRestricao?: number,
        public Descricao?: string,
        public VincularCliente?: string,
        public TipoVinculoCliente?: string,
        public VincularContratoMaster?: string,
        public TipoVinculoContratoMaster?: string,
        public CodigoOrganizacao?: string
    ) {
        super();
    }


    static fromJson(jsonData: any): VeiculoRestricao {
        return Object.assign(new VeiculoRestricao(), jsonData);
    }
}