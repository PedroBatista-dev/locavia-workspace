import { Component, Input } from "@angular/core";

@Component({
  selector: "app-body",
  templateUrl: "./body.component.html",
  styleUrls: ["./body.component.scss"],
})
export class BodyComponent {
  @Input() loader?: boolean = true;
  @Input() formLoader?: boolean;
  @Input() crumbs?: string[] = [];
  @Input() tittle: string = "";
  @Input() subtittle?: string = "";
  currentWidth = window.innerWidth;
}