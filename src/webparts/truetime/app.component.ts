
import { Component, Inject, AfterViewInit, ViewChild } from '@angular/core';

import { TestComponent } from './test.component';
import { BillingComponent } from './billing.component';
import { ProjectsService } from './projects.service';
import { UserService } from './user.service';
import { ListService } from './list.service';
import { WeekService } from './week.service';

@Component({
    selector: 'my-app',
    styleUrls: ['./app.component.css'],
    template: ` 
  <div class="container">

    <div [hidden]="!this.userService.isAdmin" class="boxAdmin"> 

        <a href="https://stebra.sharepoint.com/sites/SD1/_layouts/15/termstoremanager.aspx">
            <button class="admin-button">Go To TermStore</button>
        </a>
    
        <button class="admin-button" (click)="toggleBilling()">
            Toggle Billing
        </button> 

       <!-- <button class="admin-button" (click)="log()">
            Log Info
        </button>
          <!--
         <button class="adminButton" (click)="deleteItems()">
            Delete my items 
        </button>
        -->
        <button [hidden]="hideElement" class="admin-button" *ngIf="projectsService.projects?.length > 0" (click)="userService.lockWeek(false, true)">
            Unlock Week
        </button>

        <div class="dropdown" [hidden]="hideElement">
            <button *ngIf="selectedConsultant === undefined" [hidden]="hideElement" class="admin-button">
                Me
            </button>
            <button *ngIf="selectedConsultant !== undefined" class="admin-button" (click)="selectedConsultant = undefined">{{selectedConsultant.Title}}</button>
            <ul class="dropdown-content" id="reportConsultantAdmin" *ngIf="userService.users?.length > 0" [hidden]="hideElement">  
                <li  *ngFor="let user of userService.users"  (click)="impersonate(user)" >
                    {{user.Title}}
                </li>
            </ul>
        </div>
        
    </div>
    <test [hidden]="showBilling"></test>
    <billing [hidden]="!showBilling"></billing>
</div> 

     `
})

//TrueTime App
export class AppComponent implements AfterViewInit {//.. us to call testComponent

    @ViewChild(TestComponent)                  //enables us to call testComponent
    private testComponent: TestComponent;

    @ViewChild(BillingComponent)
    private billingComponent: BillingComponent;
    ngAfterViewInit() { }                      //enables us to call testComponent

    private hideElement: boolean = false;
    selectedConsultant: any;
    showBilling: boolean = false;

    public constructor(
        @Inject(ProjectsService) public projectsService: ProjectsService,
        @Inject(UserService) public userService: UserService,
        @Inject(ListService) public listService: ListService,
        @Inject(WeekService) public weekService: WeekService) {

        window["log"] = {
            "weekService": this.weekService,
            "projectsService": this.projectsService,
            "userService": this.userService,
            "app.component": this,
            "TestComponent": TestComponent
        };
    }

    public log() {
        console.log("\n debuginfo \n");
        console.log('weekService', this.weekService, "\n");
        console.log("ProjectsService", this.projectsService, "\n");
        console.log("UserService", this.userService, "\n");
        console.log("app.component", this);
    }

    public impersonate(userObj) { //Admin can now browse the app as userObj
        this.selectedConsultant = userObj;
        this.userService.impersonate = true;
        this.userService.user = userObj;
        this.userService.userId = userObj.Id;
        this.testComponent.loadWeek(); //calling testCompontent function
    }

    public deleteItems() {
        let myItems = [];

        this.listService.getAllItemsFromUser(this.userService.userId).then(
            response => {
                myItems = response.value;
                for (let item of myItems) {
                    this.listService.deleteThis(item);
                }

                this.testComponent.loadWeek(); //calling testCompontent function
            }
        );
    }

    public toggleBilling() {

        setTimeout(() => {
            this.showBilling = !this.showBilling;
        }, 1);

        this.hideElement = !this.hideElement;
    }
}