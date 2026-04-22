import { Component, OnDestroy } from "@angular/core";
import { DataService } from "src/app/Service/data.service";
import { ClipboardService } from 'ngx-clipboard';
// const ALERT_INTERVAL_MS =  10 * 1000; // 30 seconds
const ALERT_INTERVAL_MS =  2 * 60 * 1000; // 2 minutes

@Component({
  selector: "app-trading",
  templateUrl: "./trading.component.html",
  styleUrls: ["./trading.component.scss"],
})
export class TradingComponent implements OnDestroy {
  selectedRadio: any = "All";
  renderData: any;
  getCallAlertsData: any;
  allCallsData: any;
  newCalls: any;
  changesCalls: any;
  weeklyData: any;
  monthlyData: any;
  updatedTime: any;
  indexData:any;
  marketStatus:string='';

  myTrades: any[] = [];
  showEntryModal: boolean = false;
  pendingFollowCall: any = null;
  entryPrice: number | null = null;
  quantity: number | null = null;

  private alertTimer: any = null;
  private firedAlerts: Set<string> = new Set();

  tabsData = [
    {
      value: "All",
    },
    {
      value: "Weekly",
    },
    {
      value: "Monthly",
    },
    {
      value: "New",
    },
    {
      value: "Changes",
    },
    {
      value: "My Trades",
    },
  ];


  constructor(private dataService: DataService,private clipboardService: ClipboardService) {
    console.log(navigator.clipboard);

  }

  async ngOnInit(): Promise<void> {
    this.loadMyTrades();
    this.getHeaderData();
    let status = await this.changeTabActiveInactive('All');
    console.log("status", status);
    this.requestNotificationPermission();
    this.startAlertPolling();
  }

  ngOnDestroy() {
    if (this.alertTimer) clearInterval(this.alertTimer);
  }

  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  startAlertPolling() {
    this.alertTimer = setInterval(() => {
      this.checkFollowedTradeAlerts();
    }, ALERT_INTERVAL_MS);
  }

  private checkFollowedTradeAlerts() {
    if (!this.myTrades.length) return;
    const url = "https://frapi.marketsmojo.com/callsapi/getCallAlerts";
    this.dataService.callGetApi(url).subscribe((response: any) => {
      if (response.code !== "200") return;
      const liveAll = (response.data.new || []).concat(response.data.ticker || []);
      this.allCallsData = liveAll;
      this.myTrades.forEach((trade: any) => {
        const live = liveAll.find((c: any) => c.stockid === trade.stockid);
        if (!live) return;
        const cmp = this.parseCmp(live.cmp);
        const target = this.parseCmp(trade.tprice);
        const sl = this.parseCmp(trade.SL);
        const isBuy = trade.reason !== 'SELL';
        const targetKey = `${trade.stockid}_target`;
        const slKey = `${trade.stockid}_sl`;
        if (isBuy && cmp >= target && !this.firedAlerts.has(targetKey)) {
          this.firedAlerts.add(targetKey);
          this.sendNotification('🎯 Target Hit!', `${trade.sname} reached target ₹${live.cmp} (entry ₹${trade.entryPrice})`);
        }
        if (isBuy && cmp <= sl && !this.firedAlerts.has(slKey)) {
          this.firedAlerts.add(slKey);
          this.sendNotification('🚨 Stop Loss Hit!', `${trade.sname} hit SL ₹${live.cmp} (entry ₹${trade.entryPrice})`);
        }
        if (!isBuy && cmp <= target && !this.firedAlerts.has(targetKey)) {
          this.firedAlerts.add(targetKey);
          this.sendNotification('🎯 Target Hit!', `${trade.sname} reached target ₹${live.cmp} (entry ₹${trade.entryPrice})`);
        }
        if (!isBuy && cmp >= sl && !this.firedAlerts.has(slKey)) {
          this.firedAlerts.add(slKey);
          this.sendNotification('🚨 Stop Loss Hit!', `${trade.sname} hit SL ₹${live.cmp} (entry ₹${trade.entryPrice})`);
        }
      });
    });
  }

  private sendNotification(title: string, body: string) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    for(let i = 0; i < 4; i++) {
      new Notification(title, { body, icon: 'favicon.ico' });
    }
    new Notification(title, { body, icon: 'favicon.ico' });
  }

  loadMyTrades() {
    const saved = localStorage.getItem('trading80_my_trades');
    this.myTrades = saved ? JSON.parse(saved) : [];
  }

  saveMyTrades() {
    localStorage.setItem('trading80_my_trades', JSON.stringify(this.myTrades));
  }

  isFollowed(call: any): boolean {
    return this.myTrades.some((t: any) => t.stockid === call.stockid);
  }

  followScrip(call: any) {
    if (this.isFollowed(call)) {
      this.unfollow(call);
      return;
    }
    this.pendingFollowCall = call;
    this.entryPrice = null;
    this.quantity = null;
    this.showEntryModal = true;
  }

  confirmFollow() {
    if (!this.entryPrice || this.entryPrice <= 0) return;
    const trade = {
      ...this.pendingFollowCall,
      entryPrice: this.entryPrice,
      quantity: this.quantity || 1,
      followedAt: new Date().toISOString()
    };
    this.myTrades.push(trade);
    this.saveMyTrades();
    this.showEntryModal = false;
    this.pendingFollowCall = null;
    this.entryPrice = null;
    this.quantity = null;
    if (this.selectedRadio === 'My Trades') {
      this.renderData = [...this.myTrades];
    }
  }

  cancelFollow() {
    this.showEntryModal = false;
    this.pendingFollowCall = null;
    this.entryPrice = null;
    this.quantity = null;
  }

  unfollow(call: any) {
    this.myTrades = this.myTrades.filter((t: any) => t.stockid !== call.stockid);
    this.saveMyTrades();
    if (this.selectedRadio === 'My Trades') {
      this.renderData = [...this.myTrades];
    }
  }

  parseCmp(cmp: any): number {
    return parseFloat(String(cmp).replace(/,/g, '')) || 0;
  }

  getLiveCmp(trade: any): string {
    if (this.allCallsData) {
      const live = this.allCallsData.find((c: any) => c.stockid === trade.stockid);
      if (live) return live.cmp;
    }
    return trade.cmp;
  }

  getMyTradePerf(trade: any): number {
    const cmp = this.parseCmp(this.getLiveCmp(trade));
    const entry = trade.entryPrice;
    if (!cmp || !entry) return 0;
    if (trade.reason === 'SELL') {
      return ((entry - cmp) / entry) * 100;
    }
    return ((cmp - entry) / entry) * 100;
  }

  getMyTradePnLAmount(trade: any): number {
    const cmp = this.parseCmp(this.getLiveCmp(trade));
    const entry = trade.entryPrice;
    const qty = trade.quantity || 1;
    if (!cmp || !entry) return 0;
    if (trade.reason === 'SELL') {
      return (entry - cmp) * qty;
    }
    return (cmp - entry) * qty;
  }

  getMyTradePerfColor(trade: any): string {
    return this.getMyTradePerf(trade) >= 0 ? 'text-success' : 'text-danger';
  }

  getExpectedProfit(trade: any): number {
    const target = this.parseCmp(trade.tprice);
    const entry = trade.entryPrice;
    const qty = trade.quantity || 1;
    if (!target || !entry) return 0;
    if (trade.reason === 'SELL') {
      return (entry - target) * qty;
    }
    return (target - entry) * qty;
  }

  getHeaderData() {
    return new Promise((resolve, reject) => {
      // let url = "https://www.marketsmojo.com/portfolio-plus/stickeyheader";
      // let url = "http://3.92.239.97:8080/aiprocess/v1/stickeyheader";
      let url = "https://mojo-backend-peach.vercel.app/api/sticky-header";
      this.dataService.callGetApi(url).subscribe(
        (response: any) => {
          console.log(response);
          if (response.code == "200") {
            this.marketStatus = response.data.market_status;
            this.indexData = response.data.index_details;
            resolve("Success");
          } else {
            reject("Something went wrong");
          }
        },
        (error: any) => {
          if (error.type == true) {
            reject("Some error occured");
          }
        }
      );
    });
  }

  getScripData() {
    return new Promise((resolve, reject) => {
      // let url = "https://frapi.marketsmojo.com/callsapi/getCallAlerts";
      // let url = "http://3.92.239.97:8080/aiprocess/v1/getAllAlert";
      let url = "https://mojo-backend-peach.vercel.app/api/call-alerts";

      this.dataService.callGetApi(url).subscribe(
        (response: any) => {
          console.log(response);
          if (response.code == "200") {
            this.updatedTime = new Date()
            this.getCallAlertsData = response.data;
            this.newCalls = response.data.new;
            this.changesCalls = response.data.ticker;
            

            this.allCallsData = this.newCalls.concat(this.changesCalls);
            // this.weeklyData = this.allCallsData.filter((call:any)=>call.calltype=="Weekly");
            // this.monthlyData = this.allCallsData.filter((call:any)=>call.calltype=="Monthly");
            
            resolve("Success");
          } else {
            reject("Something went wrong");
          }
        },
        (error: any) => {
          if (error.type == true) {
            reject("Some error occured");
          }
        }
      );
    });
  }

  async changeTabActiveInactive(val: string) {
    if (val === 'My Trades') {
      this.renderData = [...this.myTrades];
      return;
    }
    let status = await this.getScripData()
    if (status == "Success") {
      console.log(val , this.newCalls);
      switch (val) {
        case "All":
          // this.renderData = this.allCallsData;
          this.renderData = this.newCalls.concat(this.changesCalls);
          break;
        case "Weekly":
          // this.renderData = this.weeklyData;
          this.renderData = this.allCallsData.filter((call: any) => call.calltype == "Weekly");
          break;
        case "Monthly":
          // this.renderData = this.monthlyData;
          this.renderData = this.allCallsData.filter(
            (call: any) => call.calltype == "Monthly"
          );
          break;
        case "New":
          this.renderData = this.newCalls;
          break;
        case "Changes":
          this.renderData = this.changesCalls;
          break;

        default:
          break;
      }
      console.log(this.renderData);
      
      // this.allCallsData.filter()
    }
  }

  reasonClass(reason:string) {
    if(reason == 'BUY'){
      return 'bg-success text-white';
    }else if(reason == 'SELL'){
      return 'bg-danger text-white';
    }else if(reason == 'TARGET HIT'){
      return 'bg-white text-info';
    }
    return
  }

  googleSearch(scripName: string, screener=false) {
    let queryText = scripName + ` ${screener == true?'screener':'share price'}`;
    let query = queryText.split(' ').join('+');
    window.open("https://www.google.com/search?q=" + query, "_blank");
  }

  copyToClipboard(text: string) {
    this.clipboardService.copyFromContent(text);
  }

}
