import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TradingComponent } from './Components/trading/trading.component';
import { ClipboardModule } from 'ngx-clipboard';
import { TradingviewWidgetModule } from 'angular-tradingview-widget';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [
    AppComponent,
    TradingComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    ClipboardModule,
    TradingviewWidgetModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
