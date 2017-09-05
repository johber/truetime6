import { Component, Input, Output, EventEmitter, OnInit, Inject } from '@angular/core';
import { SPHttpClient, ISPHttpClientOptions, SPHttpClientResponse } from '@microsoft/sp-http';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
//import { TermService } from './term.service';
import { ListService } from './list.service';
import { WeekService } from './week.service';
import { UserService } from './user.service';
import { ProjectsService } from './projects.service';

import { Project, Day } from './trueTimeData';

@Component({
    selector: 'billing',
    styles:[`

.buttonBoxReport{
    left: 25px;
    position: absolute;
    top: 85px;
    z-index: 10;
}
.boxReport{
    width: 100%;
    height:75px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    border: 1px solid #cccccc;
    border-radius: 5px;
    background-color: #f2f2f2;
    color: #003399;
}
ul, li {
    margin: 0px;
    padding: 0px;
    z-index: 10;
}
.dropdown {
    position: relative;
    display: inline-block;
    margin: 1% -88px 0 0%;
    z-index: 10;
}
.dropdown-content {
    display: none;
    position: absolute;
    background-color: #f9f9f9;
    /*min-width: 90px;*/
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  	list-style-type: none;
    z-index:10;
}
.dropdown-content li {
	padding:5px;
    border-bottom:solid 1px #b3cccc;
    position:relative;
    text-align: center;
}
.dropdown:hover .dropdown-content {
    display: block;
}
.projectButtonBillingComponent{
    height:30px;
    border-radius: 5px;
    color: #808080;
    background-color: #f9f9f9;
    font-weight: bold;
    margin-right: 90px;
    margin-top: 15px;
    min-width: 110px;
}
.projectButtonBillingComponentCon{
    height:30px;
    border-radius: 5px;
    color: #808080;
    background-color: #f9f9f9;
    font-weight: bold;
    margin-right: 90px;
    margin-top: 15px;
    min-width: 135px;
}
#reportConsultant{
    min-width: 135px;
    margin-left: 2px;
}
#reportMonth{
    min-width: 105px;
    margin-left: 2px;
}
#reportYear{
    min-width: 105px;
    margin-left: 2px;
}
.boxReportBody{
    width: 100%;
    min-height:75px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    border-bottom: 1px solid #cccccc;
    background-color: #ffffff;
    color: #000000;
    font-size: 20px; 
}
#boxReportBodyText{
    margin-left: 100px;
}


    
    `],
    
    template: ` 
  <div class="boxReport"> 
    <div class="buttonBoxReport">
            <div class="dropdown">
            <button class="projectButtonBillingComponentCon" (click)="restCall()" >View Report</button>
            </div>
            
              <div class="dropdown">
                <button *ngIf="selectedConsultant === undefined" class="projectButtonBillingComponentCon">Choose Consultant</button>
                <button *ngIf="selectedConsultant !== undefined" class="projectButtonBillingComponentCon" (click)="selectedConsultant = undefined">{{selectedConsultant.Title}}</button>
                
                <ul class="dropdown-content" id="reportConsultant" *ngIf="userService.users?.length > 0">  
               
                    <li  *ngFor="let user of userService.users"  (click)="selectConsultant(user)" >
                       {{user.Title}}
                    </li>
                </ul>
              </div>
               <div class="dropdown">
                <button *ngIf="selectedProject === undefined" class="projectButtonBillingComponent">Choose Project</button>
                <button *ngIf="selectedProject !== undefined" class="projectButtonBillingComponent" (click)="selectedProject = undefined">{{selectedProject.name}}</button>
                
                <ul class="dropdown-content" id="reportProject">  
               
                    <li *ngFor="let project of projectsService.projects" (click)="selectProject(project)">
                        {{ project.name }}
                    </li>
                </ul>
              </div>
            
              <div class="dropdown">
                <button *ngIf="selectedMonth === undefined" class="projectButtonBillingComponent">Choose Month</button>
                <button *ngIf="selectedMonth !== undefined" class="projectButtonBillingComponent" (click)="selectedMonth = undefined">{{ weekService.monthNamesLarge[selectedMonth] }}</button>
                <ul class="dropdown-content" id="reportMonth">  
               
                    <li *ngFor="let monthName of weekService.monthNamesLarge" (click)="selectMonth(monthName)" >
                        {{ monthName }}
                    
                    </li>
                </ul>
              </div>
     
             <div class="dropdown">
                <button *ngIf="selectedYear === undefined" class="projectButtonBillingComponent">{{weekService.year[1]}}</button>
                <button *ngIf="selectedYear !== undefined" class="projectButtonBillingComponent" (click)="selectedYear = weekService.year[1]">{{selectedYear}}</button>
                <ul class="dropdown-content" id="reportYear">
               
                    <li *ngFor="let yearName of weekService.year" (click)="yearNameList(yearName)" >
                        {{ yearName }}
                    
                    </li>
                </ul>
            </div>
 
      </div>
     

   
    </div>
  
    <div class="boxReportBody">
        <br/>
        <br/>
        <div id="boxReportBodyText">
            <div *ngIf="selectedConsultant !== undefined">Consultant: {{selectedConsultant.Title}} </div>
            <div *ngIf="selectedProject !== undefined">Project: {{selectedProject.name}} </div>
            <div *ngIf="selectedMonth !== undefined">Month: {{this.weekService.monthNamesLarge[selectedMonth]}} </div>
            <div *ngIf="filteredItems !== undefined">Total Hours: {{getSumTotalMonth()}} </div>
            <div>--------------------------------------------------------------</div>
           


            <ul *ngIf="summarizedItems !== undefined" style="list-style:none">
                <li *ngFor="let item of summarizedItems"> 
                <br/>
                   <span *ngIf="selectedConsultant === undefined" style="font-weight: bold;">{{ item.Title }}</span>

                    <div *ngFor="let proj of item.projArray" style=" left: 20px;position: relative;"> 
                        <span *ngIf="proj.hoursTotal > 0">
                            {{ proj.name }}: {{ proj.hoursTotal }}h
                        </span>
                  
                  </div>
                </li> 
                 
            </ul>
  

        </div>
    

    <br/>
    <br/>
    </div>
     `

})

//TrueTime App
export class BillingComponent {
    public week: Array<any>;
    public selectedProject;
    public selectedConsultant;
    public selectedMonth;
    public selectedOnlyMonth;
    public filteredItems: any[];
    public restedItems: any[];
    public summarizedItems: any[];
    public selectedYear: string = this.weekService.year[1];
    private context: any = window['context'];

    public constructor(
        //@Inject(TermService) public termService: TermService,
        @Inject(ListService) public listService: ListService,
        @Inject(ProjectsService) public projectsService: ProjectsService,
        @Inject(WeekService) public weekService: WeekService,
        @Inject(UserService) public userService: UserService) {
    }


    public restCall() {

        //reset data from previous call
        this.restedItems = undefined;
        this.filteredItems = undefined;
        this.summarizedItems = undefined;

        //FILTERQUERY
        //setup daterange:
        //specific month OR whole year
        let year = Number(this.selectedYear);
        let dateStart: any = new Date( //year, month, date
            year,
            (this.selectedMonth || 0),  //if no month is specified, query the whole year.
            1
        );
        let dateEnd: any = new Date(
            year,
            ((this.selectedMonth + 1) || 12), //if no month is specified, query the whole year.
            0
        );
        //right way to specify date in filterQuery:          
        //'2016-03-26T09:59:32Z'
        let startFormatted = dateStart.format("yyyy-MM-dd") + "T00:00:00Z";//Thh:mm:ssZ");
        let endFormatted = dateEnd.format("yyyy-MM-dd") + "T23:59:59Z";

        let filterQuery = `(EventDate ge datetime'${startFormatted}') and (EventDate le datetime'${endFormatted}')`;

        //FILTERQUERY
        //specific consultants or all consultants
        if (this.selectedConsultant !== undefined) {
            filterQuery += ` and (Consultant eq '${this.selectedConsultant.Id}')`;
        }

        let itemLimit = 1000;
        let listName = "calendartest";

        let url = window['context'].pageContext.web.absoluteUrl + `/english/_api/web/lists/GetByTitle('${listName}')/items?$top=${itemLimit}&$filter=${filterQuery}`;
        window['context'].spHttpClient.get(url, SPHttpClient.configurations.v1)
            .then((response: Response) => {
                response.json().then(innerResponse => {
                    this.restedItems = innerResponse.value;
                    this.summarizeItems();
                    //this.filterItems(); //to do, chain this funtion
                })
            });




    } //restcall() end

    public summarizeItems() {
        if (this.selectedProject === undefined) {
            this.filteredItems = this.restedItems;

            //USERS
            //  user
            //    -project..
            //    -project
            //        -hoursTotal
            //  user..
            //  user...
            //  user..

            //DEBUG
            //let oneItem = this.restedItems[0];
            //console.log("anatomy of an rested item: ", oneItem);
            //DEBUG

            let users = JSON.parse(JSON.stringify(this.userService.users));
            let projects = JSON.parse(JSON.stringify(this.projectsService.projects));

            let projectsObj = {}
            for (let project of projects) {
                project.week = undefined;//remove to avoid confusion
                project.hoursTotal = 0;//add to keep track of total hours
                projectsObj[project.name] = project; //make sure keyName is projectname
            }

            let usersObj = {}
            for (let user of users) {
                user.projects = JSON.parse(JSON.stringify(projectsObj));
                usersObj[user.Id] = user; //make sure keyName is userId
            }

            //add upp all hourstotal for consultants.
            for (let item of this.restedItems) {
                usersObj[item.ConsultantId].projects[item.Projectname].hoursTotal += item.Hours;
                //console.log("usersObj[item.ConsultantId].projects[item.Projectname].hoursTotal", usersObj[item.ConsultantId].projects[item.Projectname].hoursTotal);
            }

            //we need to pack it back up in arrays since we 
            //...want to loop it out with *ngFor
            //
            //..we could also use a cool "pipe" for ang2 to loop over objs
            let usersArray = this.objToArray(usersObj);
            for (let user of usersArray) {
                user.projArray = this.objToArray(user.projects);
            }
            this.summarizedItems = usersArray;
        }
        else {
            this.filterItemsByProject(this.selectedProject, this.restedItems);
        }

    }

    public objToArray(obj): any[] {

        let array: any[] = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                array.push(obj[key]);//console.log(key + " -> " + obj[key]);
            }
        }
        return array;
    }

    public selectProject(project) {
        this.selectedProject = project;
    }

    public selectConsultant(user) {
        this.selectedConsultant = user;
    }

    public selectMonth(monthName) {
        this.selectedMonth = this.weekService.monthNamesLarge.indexOf(monthName);

    }

    public yearNameList(yearName) {
        this.selectedYear = yearName;
    }

    public getSumTotalMonth() {
        let sum = 0;
        for (let item of this.filteredItems) {
            if (item.isLocked === true) 
            { 
                sum += item.Hours 
            }
        }
        return sum;
    }

    public filterItemsByProject(selectedProject: Project, itemsArray) {

        let filteredItems = []

        for (let item of itemsArray) {
            if (item.Project.TermGuid === selectedProject.projectColumnValue.TermGuid) {
                filteredItems.push(item);
            }
        }
        this.filteredItems = filteredItems;
    }

}
