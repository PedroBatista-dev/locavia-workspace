import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged, map } from "rxjs/operators";
import { FilterDataModel } from "../../models/filter-data.model";

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
  public isFilterButtonActive: boolean = false;

  constructor() {}

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
      this.query = `${this.filterParam[1]}=${val}`;
    } else {
      this.query = this.filterInit;
    }
  }

  setSearchIcon(path: any) {
    this.inputElement.nativeElement.style.backgroundImage = `url('./assets/icons/pesquisar_${path}.svg')`;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public showFilterLabel() {
    this.isFilterButtonActive = true;
    setTimeout(() => {
      this.hideFilterLabel();
    }, 5000);
  }
  
  public hideFilterLabel() {
    this.isFilterButtonActive = false;
  }
}