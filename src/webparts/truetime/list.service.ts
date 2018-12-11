import { Injectable } from '@angular/core';
import { SPHttpClient, ISPHttpClientOptions } from '@microsoft/sp-http';
import { Day } from './trueTimeData';

@Injectable()
export class ListService {

  private context: any = window['context'];
  private getByTitlePath: string = `/english/_api/web/lists/GetByTitle('`;
  listName = "calendartest";

  constructor() { }

  ngOnInit() {
    Date.prototype['yyyymmdd'] = function () {
      var mm = this.getMonth() + 1; // getMonth() is zero-based
      var dd = this.getDate();

      return [this.getFullYear(),
      (mm > 9 ? '-' : '-0') + mm,
      (dd > 9 ? '-' : '-0') + dd
      ].join('');
    };

  }

  public async getListPermission(userId: any): Promise<any> {
    return this.context.spHttpClient.get(
      `${this.context.pageContext.web.absoluteUrl}/english/_api/web/lists/GetByTitle('${this.listName}')/roleassignments/GetByPrincipalId('${userId}')/RoleDefinitionBindings/`, SPHttpClient.configurations.v1)
      .then((response: Response) => {
        return response.json();
      });
  }

  public async getList(): Promise<any> {
    return this.context.spHttpClient.get(
      `${this.context.pageContext.web.absoluteUrl}/english/_api/web/lists/GetByTitle('${this.listName}')/fields`, SPHttpClient.configurations.v1)
      .then((response: Response) => {
        return response.json();
      });
  }

  public async getListItems(): Promise<any> {
    return this.context.spHttpClient.get(
      `${this.context.pageContext.web.absoluteUrl}/english/_api/web/lists/GetByTitle('${this.listName}')/items/`, SPHttpClient.configurations.v1)
      .then((response: Response) => {
        return response.json();
      });
  }

  public createListItem(day: Day, projectColumnValue, userId): Promise<any> {
    var url = `${this.context.pageContext.web.absoluteUrl}/english/_api/web/lists/GetByTitle('${this.listName}')/items?`;
    var body: any = {}

    //Problem: Sharepoint converts our dateObj to time with hours offset(timezones). event then has wrong date
    //Solution: serve date as string, not as dateObj.
    //format "2017-03-27T12:00:00Z";
    var year = day.dateObj.getFullYear().toString();
    var month = (day.dateObj.getMonth() + 1).toString();
    var dayDate = day.dateObj.getDate().toString();

    //make sure that month and day is two digits, e.g. "1" => "01"
    if (month.length === 1) { month = "0" + month }
    if (dayDate.length === 1) { dayDate = "0" + dayDate }

    var dateAsString = `${year}-${month}-${dayDate}T12:00:00Z`;
    //example, "2017-03-27T12:00:00Z"

    body = {
      Title: "some text",
      Project: projectColumnValue,
      Projectname: projectColumnValue.Label,
      Hours: day.hours,
      Date: dateAsString,
      EndDate: dateAsString,
      EventDate: dateAsString,
      isLocked: day.isLocked,
      ConsultantId: userId, //hours belongs to this consultant
    };

    const spOpts: ISPHttpClientOptions = {
      body: JSON.stringify(body)//`{ Title: 'Developer Workbench', BaseTemplate: 100 }`
    };

    return this.context.spHttpClient.post(url, SPHttpClient.configurations.v1, spOpts)
  }

  public deleteThis(item: any): Promise<any> {
    var listName = "calendartest";
    var url = `${this.context.pageContext.web.absoluteUrl}/english/_api/web/lists/GetByTitle('${listName}')/items(${item.Id})`;

    const spOpts: ISPHttpClientOptions = {
      headers: {
        'IF-MATCH': '*',
        'X-HTTP-Method': 'DELETE'
      }
    };

    return this.context.spHttpClient.post(url, SPHttpClient.configurations.v1, spOpts);
  }

  public getMyWeeklyHours(weekStart, weekEnd, userId): Promise<any> {
    var dateHolder = { weekStartInParam: weekStart }
    var listName = "calendartest";

    //right way to specify date in filterQuery:          
    //'2016-03-26T09:59:32Z'

    //var start :any = new Date(weekStart);
    var startFormatted = weekStart.format("yyyy-MM-dd") + "T00:00:00Z";//Thh:mm:ssZ");

    //var end :any = new Date(weekEnd);
    var endFormatted = weekEnd.format("yyyy-MM-dd") + "T23:59:59Z";

    var filterQuery = `
        (EventDate ge datetime'${startFormatted}') and (EventDate le datetime'${endFormatted}')
         and (Consultant eq '${userId}')`

    var url = this.context.pageContext.web.absoluteUrl + `/english/_api/web/lists/GetByTitle('${listName}')/items?$filter=` + filterQuery;

    return this.context.spHttpClient.get(url, SPHttpClient.configurations.v1)
      .then((response: Response) => {
        return response.json();
      });
  }

  public async getNotificationList(): Promise<any> {
    var listName = "truetime-notification";

    return this.context.spHttpClient.get(
      this.context.pageContext.web.absoluteUrl + `/english/_api/web/lists/GetByTitle('${listName}')`, SPHttpClient.configurations.v1)
      .then((response: Response) => {
        return response.json();
      });
  }

  public async getNotificationListItems(): Promise<any> {
    var listName = "truetime-notification";
    return this.context.spHttpClient.get(
      this.context.pageContext.web.absoluteUrl + `/english/_api/web/lists/GetByTitle('${listName}')/items/`, SPHttpClient.configurations.v1)
      .then((response: Response) => {
        return response.json();
      });
  }

  public async getAllItemsFromUser(userId): Promise<any> {
    let listName = "calendartest";
    let filterQuery = `(Consultant eq '${userId}')`;
    let url = this.context.pageContext.web.absoluteUrl + `/english/_api/web/lists/GetByTitle('${listName}')/items?$filter=${filterQuery}`;
    return this.context.spHttpClient.get(
      url, SPHttpClient.configurations.v1).then((response: Response) => {
        let data = response.json();
        return data;
      });
  }
}