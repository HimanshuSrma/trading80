import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  Renderer2,
} from "@angular/core";

@Component({
  selector: "app-tradingview",
  // selector: `<tradingview-widget [widgetConfig]="widgetConfig"></tradingview-widget>`,
  templateUrl: "./tradingview.component.html",
  styleUrls: ["./tradingview.component.scss"],
})
export class TradingviewComponent implements OnInit, AfterViewInit {
  @ViewChild("tradingview") tradingview?: ElementRef;
  widgetConfig: any;

  constructor(private _renderer2: Renderer2) {}

  ngOnInit() {}

  ngAfterViewInit(): void {
    this.loadChart();
  }

  loadChart() {
    let script = this._renderer2.createElement("script");
    script.type = `text/javascript`;
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js";
    script.text = `
    {
      width: 980,
      height: 610,
      symbol: "BSE:TCS",
      timezone: "IST",
      theme: "dark",
      style: "1",
      locale: "en",
      toolbar_bg: "#f1f3f6",
      enable_publishing: false,
      withdateranges: true,
      range: "ytd",
      hide_side_toolbar: false,
      allow_symbol_change: true,
      show_popup_button: true,
      popup_width: "1000",
      popup_height: "650",
      no_referral_id: true,
      container_id: "tradingview_bac65",
    }`;
    this.tradingview?.nativeElement.appendChild(script);
  }
}

const widgetConfig = {
  symbol: "BSE:TCS",
};

enum BarStyles {
  BARS = "0",
  CANDLES = "1",
  HOLLOW_CANDLES = "9",
  HEIKIN_ASHI = "8",
  LINE = "2",
  AREA = "3",
  RENKO = "4",
  LINE_BREAK = "7",
  KAGI = "5",
  POINT_AND_FIGURE = "6",
}

enum IntervalTypes {
  D = "D",
  W = "W",
}

enum RangeTypes {
  YTD = "ytd",
  ALL = "all",
}

enum Themes {
  LIGHT = "Light",
  DARK = "Dark",
}

interface ITradingViewWidget {
  allow_symbol_change?: boolean;
  autosize?: boolean;
  calendar?: boolean;
  details?: boolean;
  enable_publishing?: boolean;
  height?: number;
  hideideas?: boolean;
  hide_legend?: boolean;
  hide_side_toolbar?: boolean;
  hide_top_toolbar?: boolean;
  hotlist?: boolean;
  interval?:
    | "1"
    | "3"
    | "5"
    | "15"
    | "30"
    | "60"
    | "120"
    | "180"
    | IntervalTypes.D
    | IntervalTypes.W;
  locale?: string;
  news?: string[];
  no_referral_id?: boolean;
  popup_height?: number | string;
  popup_width?: number | string;
  referral_id?: string;
  range?:
    | "1d"
    | "5d"
    | "1m"
    | "3m"
    | "6m"
    | RangeTypes.YTD
    | "12m"
    | "60m"
    | RangeTypes.ALL;
  save_image?: boolean;
  show_popup_button?: boolean;
  studies?: string[];
  style?:
    | BarStyles.BARS
    | BarStyles.CANDLES
    | BarStyles.HOLLOW_CANDLES
    | BarStyles.HEIKIN_ASHI
    | BarStyles.LINE
    | BarStyles.AREA
    | BarStyles.RENKO
    | BarStyles.LINE_BREAK
    | BarStyles.KAGI
    | BarStyles.POINT_AND_FIGURE;
  symbol: string;
  theme?: Themes.LIGHT | Themes.DARK;
  timezone?: string;
  toolbar_bg?: string;
  watchlist?: string[];
  widgetType?: string;
  width?: number;
  withdateranges?: boolean;
}
