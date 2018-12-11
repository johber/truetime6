import { Component, Inject } from '@angular/core';
import { SPHttpClient } from '@microsoft/sp-http';
import { ListService } from './list.service';
import { WeekService } from './week.service';
import { UserService } from './user.service';
import { ProjectsService } from './projects.service';
import { Project } from './trueTimeData';

@Component({
    selector: 'billing',
    templateUrl: './billing.component.html',
    styles:['./billing.component.css']
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
        let dateStart: Date = new Date(year, (this.selectedMonth || 0), 1);
        let dateEnd: Date = new Date(year, ((this.selectedMonth + 1) || 12), 0);

        //right way to specify date in filterQuery:          
        //'2016-03-26T09:59:32Z'
        let startFormatted: string = dateStart.format("yyyy-MM-dd") + "T00:00:00Z";
        let endFormatted: string = dateEnd.format("yyyy-MM-dd") + "T23:59:59Z";
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
