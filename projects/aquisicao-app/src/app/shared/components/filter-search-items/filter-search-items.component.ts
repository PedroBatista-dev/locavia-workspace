import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged, map } from "rxjs/operators";
import { FilterDataModel } from "../../models/filter-data.model";
import { TableService } from "../../service/table.service";

@Component({
  selector: "app-filter-search-items",
  templateUrl: "./filter-search-items.component.html",
  styleUrls: ["./filter-search-items.component.scss"],
})
export class FilterSearchItemsComponent {
  @Input() columnsFilter: any[] = [];
  @Input() filterInit = "";
  @Input() orderByInit = "";
  @Input() currentWidth = window.innerWidth;
  @Input() searchWithEnter = false;
  @Input() filterEnd: string = "";

  @Output() filterChange: EventEmitter<FilterDataModel> = new EventEmitter<FilterDataModel>();

  @ViewChild("input", { static: true }) inputElement!: ElementRef;

  subscriptions = new Subscription();
  filterParam!: Array<string>;
  searchTypeControl = new FormControl("C");
  search = new FormControl("");
  query: string = "";

  constructor(public tableService: TableService) {}

  ngOnInit() {
    this.filterParam = this.columnsFilter[0];
    if (!this.searchWithEnter) this.searchWithValueChanges();
  }

  searchWithValueChanges() {
    this.subscriptions.add(
      this.search.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          map((val) => {
            this.emitFilter(val!);
          })
        )
        .subscribe()
    );
  }

  searchEnter() {
    if (this.searchWithEnter) this.emitFilter(this.search.value!);
  }

  setParamFilter(param: any) {
    this.filterParam = param;
    this.search.setValue("");
    this.emitFilter();
  }

  changeTipoPesquisa(event: any) {
    if (event.value == "I") {
      this.setSearchIcon("inicio");
    } else {
      this.setSearchIcon("contem");
    }
    this.emitFilter();
  }

  emitFilter(searchValue?: string) {
    let pesquisa: string | undefined = searchValue! ?? this.search.value;
    if (["CPF", "CNPJ"].includes(this.filterParam[0])) {
      pesquisa = this.unmask(pesquisa);
    }
    this.updateQuery(pesquisa);
    this.query += this.filterEnd;
    this.filterChange.emit({ pesquisa, filtro: this.filterParam, query: this.query });
  }

  unmask(value: any): string {
    return value.replace(/\D+/g, "");
  }

  updateQuery(val: any) {
    this.query = "";

    if (val != "") {
      const filters = this.filterInit ? `&${this.filterInit}` : "";
      const orderBy = this.orderByInit ? `&${this.orderByInit}` : `&orderBy=${this.filterParam[1]}=ASC`;
      const flag = this.filterParam[2];
      if (flag && ["object"].includes(typeof flag)) {
        let result = null;
        if (this.searchTypeControl.value === "I") {
          result = Object.keys(flag).filter((key: any) => flag[key].toLowerCase().startsWith(val.toLowerCase()));
        } else if (this.searchTypeControl.value == "C") {
          result = Object.keys(flag).filter((key: any) => flag[key].toLowerCase().includes(val.toLowerCase()));
        }
        val = `IN('${result!.join("','")}')`;
      }
      this.query = `search=${this.filterParam[1]}=${val};TipoPesquisa=${this.searchTypeControl.value}${filters}${orderBy}`;
    } else {
      this.query = this.filterInit;
      if (this.orderByInit) {
        this.query = `${this.filterInit};&${this.orderByInit}`;
      }
    }
  }

  setSearchIcon(path: any) {
    this.inputElement.nativeElement.style.backgroundImage = `url('./assets/icons/pesquisar_${path}.svg')`;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}