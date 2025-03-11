import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve } from "@angular/router";
import { Observable } from "rxjs";
import { CompraVeiculoMotivoPedido } from "./compraVeiculoMotivoPedido.model";
import { CompraVeiculoMotivoPedidoService } from "./compraVeiculoMotivoPedido.service";

@Injectable()
export class CompraVeiculoMotivoPedidoResolve implements Resolve<CompraVeiculoMotivoPedido> {

    constructor(private compraVeiculoMotivoPedidoService: CompraVeiculoMotivoPedidoService) {}

    resolve(route: ActivatedRouteSnapshot): Observable<CompraVeiculoMotivoPedido> {
        return this.compraVeiculoMotivoPedidoService.getById(
            "ComprasVeiculosMotivosPedido.CodigoMotivoPedido",
            route.params["CodigoMotivoPedido"]
        );
    }
}