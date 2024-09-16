import { Component,Input} from "@angular/core";
import { DataService } from "src/app/Service/data.service";

import { ClipboardService } from 'ngx-clipboard';

@Component({
  selector: "app-trading",
  templateUrl: "./trading.component.html",
  styleUrls: ["./trading.component.scss"],
})
export class TradingComponent {
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
  ];

  constructor(private dataService: DataService,private clipboardService: ClipboardService) {
    console.log(navigator.clipboard);
    
  }

  async ngOnInit(): Promise<void> {
    this.getHeaderData();
    let status = await this.changeTabActiveInactive('All');
    console.log("status", status);
  }

  getHeaderData() {
    return new Promise((resolve, reject) => {
      // let url = "https://www.marketsmojo.com/portfolio-plus/stickeyheader";
      // url = "https://benepik.in/kit-management-quote/call-sticky-header";
      let url = "http://3.92.239.97:8080/aiprocess/v1/stickeyheader";
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
      let url = "http://3.92.239.97:8080/aiprocess/v1/getAllAlert";

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
