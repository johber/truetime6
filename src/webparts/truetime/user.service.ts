import { Injectable, Inject } from '@angular/core';
import { ListService } from './list.service';
import { WeekService } from './week.service';
import { ProjectsService } from './projects.service';
//import { TermService } from './term.service';
import { SPHttpClient, ISPHttpClientOptions, SPHttpClientResponse } from '@microsoft/sp-http';

@Injectable()
export class UserService {
    public permission;
    public context: any;
    public isAdmin: boolean = false;
    public userId: number;
    public isKonsult: boolean = true;
    public adminGroupId;
    public adminUsers;
    public users;
    public email;
    public user;
    public impersonate: boolean;
    
    //var big = (x > 10) ? true : false;

    constructor(
        @Inject(ListService) public listService: ListService,
        @Inject(ProjectsService) public projectsService: ProjectsService,
        @Inject(WeekService) public weekService: WeekService) {

        /*
        this.getCurrentUser().then(
            (currentUserResponse) => {
                if (this.impersonate && this.user !== undefined) {
                    currentUserResponse = this.user.name;
                }
                this.userId = currentUserResponse.Id;
            }
        );
        */

        this.getConsultants();
        this.getAdmins();

    }

    public lockWeek(bool, saveChanges) {
        for (let project of this.projectsService.projects) {
            for (let day of project.week) {
                if (day.month === this.weekService.month) {
                    day.isLocked = bool;
                    
                }
               
            }
           
        }
        if (saveChanges) {
            //Notify admin
            
            this.notifyAdmin(
                
                this.userId,
                this.weekService.weekStart,
                this.weekService.weekEnd,
                
            )
            .then(response => {
                this.checkExistingItem(response);
            })
            ;
            
            
            //this.save()//...to here
        }
        //this.save(); //goto moved this...
    }
    public save() {
        this.listService.getMyWeeklyHours(
            this.weekService.weekStart,
            this.weekService.weekEnd,
            this.userId)
            .then(response => {
                this.checkExistingItem(response);
            })
    }

    public checkExistingItem(items): any {
        for (let item of items.value) {
            this.listService.deleteThis(item);
        }
        for (let project of this.projectsService.projects) {
            for (let day of project.week) {
                //only report if there is hours to report
                if (day.hours > 0) {

                    this.listService.createListItem(day, project.projectColumnValue, this.userId)
                        .then((response: SPHttpClientResponse) => {
                            // Access properties of the response object. 
                            //console.log(`Status code: ${response.status}`);
                            //console.log(`Status text: ${response.statusText}`);
                            
                            //return.response.json() //returns a promise so you get access to the json in the resolve callback.
                            
                           return response.json().then((responseJSON: JSON) => {
                                console.log("responseJSON", responseJSON);
                            });
                          
                        });
                }
            }
        }
    }

    public _getPermission(userId): Promise<any> {
        var listName = "calendartest";
        return window['context'].spHttpClient.get(
            window['context'].pageContext.web.absoluteUrl + `/english/_api/web/lists/GetByTitle('` + listName + `')/roleassignments/GetByPrincipalId('` + userId + `')/RoleDefinitionBindings/`,
            SPHttpClient.configurations.v1)
            .then((response: Response) => {
                return response.json();
            });

    }

    public getCurrentUser(): Promise<any> {
        return window['context'].spHttpClient.get(window['context'].pageContext.web.absoluteUrl + '/_api/web/currentUser', SPHttpClient.configurations.v1)
            .then((response: Response) => {

                return response.json();
            });
    }

    public notifyAdmin(userId, weekStart: Date, weekEnd: Date): Promise<any> {

        var listName = "truetime-notification";
        //"Hello Admin, I just locked my week Feb 21 to 28

        //"Feb"
        var monthLabel = weekStart.toDateString().substring(4, 7);

        //"Feb 21 to 28"
        var dateText = monthLabel + " " + weekStart.getDate() + " to " + weekEnd.getDate();

        var absUrl = window['context'].pageContext.web.absoluteUrl;

        var url = `${absUrl}/english/_api/web/lists/GetByTitle('${listName}')/items?`;

        var body: any = {
            Title: "Hello Admin, I just locked my week " + dateText,
            mailstring: "admin@stebra.se"
            //sendtoId: this.adminGroupId,
        };

        const spOpts: ISPHttpClientOptions = {
            body: JSON.stringify(body)
        };

        return window['context'].spHttpClient.post(url, SPHttpClient.configurations.v1, spOpts)
    }


    public getAdmins(): void {


        this.getCurrentUser().then((response => {
            this.user = response;
            this.userId = response.Id

            //
            var groupName = "TrueTimeAdmin ";
            let url = window['context'].pageContext.web.absoluteUrl + "/_api/web/sitegroups/getbyname('" + groupName + "')/users";
            console.log("url", url);
            window['context'].spHttpClient.get(
                url,
                SPHttpClient.configurations.v1)
                .then((response: Response) => {
                    response.json().then(
                        (users) => {
                            this.adminUsers = users.value;
                            for (let user of this.adminUsers) {
                                if (user.Id === this.userId && user.Id !== undefined) {
                                    this.isAdmin = true;
                                }
                            }
                        });
                });
            //

        }))//getCurrentUser()



        
    }

    public getConsultants(): Promise<any> {
        var groupName = "TrueTimeKonsult ";
        return window['context'].spHttpClient.get(window['context'].pageContext.web.absoluteUrl + `/_api/web/sitegroups/getbyname('` + groupName + `')/users`, SPHttpClient.configurations.v1)
            .then((response: Response) => {
                return response.json().then(
                    (users) => {
                        //console.log("getConsultants(), users", users);
                        this.users = users.value;
                        for (let item of users) {
                            //console.log("UsersS", item);
                        }
                    });
            });
    }
}