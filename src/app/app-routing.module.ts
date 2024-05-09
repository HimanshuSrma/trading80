import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TradingComponent } from "./Components/trading/trading.component";
import { TradingviewComponent } from "./Components/tradingview/tradingview.component";

const routes: Routes = [
  { path: "", component: TradingComponent },
  { path: "view", component: TradingviewComponent },
  { path: "**", component: TradingComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
