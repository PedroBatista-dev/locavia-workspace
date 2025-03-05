import { Component, EventEmitter, Input, Output } from "@angular/core";
import { TableService } from "../../service/table.service";

export interface MatMenuListItem {
  menuLinkText: string;
  menuIcon: string;
  isDisabled: boolean;
  style?: string;
  iconType?: string;
}

@Component({
  selector: "app-menu-acoes",
  templateUrl: "./menu-acoes.component.html",
  styleUrls: ["./menu-acoes.component.scss"],
})
export class MenuAcoesComponent {
  @Input() items: Array<MatMenuListItem> = [];
  @Input() editRouterLink!: string;
  @Input() consultRouterLink!: string;
  @Input() element: any = 'empty';
  @Input() deleteVisible: boolean = true;
  @Input() editVisible: boolean = true;
  @Input() consultVisible: boolean = true;

  @Output() executaAcao = new EventEmitter();
  @Output() deleteEvent = new EventEmitter();
  @Output() editEvent = new EventEmitter();
  @Output() consultEvent = new EventEmitter();


  genericMethod(actionName: any) {
    // You can give any function name
    this.executaAcao.emit(actionName);
  }

  constructor(public tableService: TableService) {}

  delete() {
    this.deleteEvent.emit();
  }

  edit() {
    this.editEvent.emit();
  }

  consult() {
    this.consultEvent.emit();
  }
}