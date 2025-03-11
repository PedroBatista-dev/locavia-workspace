import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class TableService {
  public activeRow = "none";
  public isFilterButtonActive: boolean = false;
  public rowsWithoutScroll: number = 5;
  private currentWidth: number = window.innerWidth;

  constructor(
    private _router: Router,
  ) {
  }

  public setActiveRow(event: any, type?: "cdk-drag") {
    if (this.currentWidth <= 768) return;
    let path = event.composedPath();
    let targetRow = path[1];
    let allRows = path[2].children;

    const configClass = this.getClass(type);

    for (const cRow of allRows) {
      if (cRow.classList == configClass.activeClass)
        cRow.classList = configClass.defaultClass;
    }
    if (targetRow.classList == configClass.defaultClass) {
        targetRow.classList = configClass.activeClass;
    }
  }
  public closeAllRows(event: any, type?: "cdk-drag") {
    let allRows = event.srcElement.children[1].children;
    const configClass = this.getClass(type);

    for (const cRow of allRows) {
      if (cRow.classList == configClass.activeClass)
        cRow.classList = configClass.defaultClass;
    }
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

  public consult(element: any, key: any, rotaAnt?: string, rotaDep?: string) {
    let url = this._router.url;
    if (url.includes("lista")) {
      url = url.replace("/lista", "/" + element[key] + "/consultar");
      this._router.navigateByUrl(url);
    } else {
      url = url.replace(rotaAnt + "/filtrar", rotaDep + "/" + element[key] + "/consultar");
      window.open(url, "_blank");
    }
  }

  public novoRegistro() {
    let url = this._router.url;
    url = url.replace("/lista", "/novo");
    this._router.navigateByUrl(url);
  }

  public openRegistroCustom(element: any, key: any, rota: string, action: string, keyParam?: boolean) {
    let url = `${rota}/${element[key]}/${action}`;
    if (keyParam) {
      url = `${rota}/${action}/${element[key]}`;
    }
    window.open(url, "_blank");
  }

  getClass(type?: "cdk-drag") {
    let classDefault = "mat-row cdk-row ng-star-inserted";
    if (type && type == "cdk-drag") {
      classDefault = "mat-row cdk-row cdk-drag ng-star-inserted";
    }

    return {
      defaultClass: classDefault,
      activeClass: `${classDefault} activeRow`
    }
  }
}