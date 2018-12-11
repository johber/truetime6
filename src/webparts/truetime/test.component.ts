import { Component, OnInit, Inject } from '@angular/core';
import { NewTermsService } from './newterms.service';
import { ListService } from './list.service';
import { WeekService } from './week.service';
import { ProjectsService } from './projects.service';
import { UserService } from './user.service';
import { Project } from './trueTimeData';

//some comment

@Component({
    selector: 'test',
    templateUrl: './test.component.html',
    styleUrls: ['./test.component.css'],
})

export class TestComponent implements OnInit {

    public inputValue: any = "";
    public filteredProjects: any;
    public week: Array<any>;

    public constructor(
        @Inject(NewTermsService) public termService: NewTermsService,
        @Inject(ListService) public listService: ListService,
        @Inject(ProjectsService) public projectsService: ProjectsService,
        @Inject(WeekService) public weekService: WeekService,
        @Inject(UserService) public userService: UserService) { }

    public ngOnInit(): void {
        //get TERMS/USER once when component initializes.
        this.week = this.weekService.weeks[this.weekService.weekNumber];

        //TODO: Why is 
        this.termService.getTermsFlow().then(() => {
            this.userService.getCurrentUser()
                .then((currentUserResponse) => {

                    if (this.userService.impersonate && this.userService.user !== undefined) {
                        currentUserResponse = this.userService.user.name;
                    }

                    this.userService.userId = currentUserResponse.Id;
                    this.loadWeek();
                });
        })
    }

    public filterProjects() {
        this.filteredProjects = [];
        let searchString = this.inputValue.toLowerCase();

        for (let item of this.projectsService.projects) {
            if (item.name.toLowerCase().indexOf(searchString) !== -1) {
                this.filteredProjects.push(item);
            }
        }
    }

    public showCloseButton(project: Project) {
        project.showCloseButton = !project.showCloseButton; //toggle
        setTimeout(() => { project.showCloseButton = false }, 2500);
    }

    public isOtherMonth(day) {
        return day.month !== this.weekService.month;
    }

    public loadWeek() {
        this.hideProjects();
        this.week = this.weekService.weeks[this.weekService.weekNumber];

        //reset projects since it has data from another week
        this.projectsService.projects = undefined;
        this.projectsService.projects = [];

        //create projects for this week
        this.loadProjectsFromTerms(this.termService.terms);

        //load hours from list into projects
        this.listService.getMyWeeklyHours(
            this.weekService.weekStart,
            this.weekService.weekEnd,
            this.userService.userId
        ).then((items) => {
            console.log("FETCHED ITEMS:", items);

            if (items.value.length > 0) {
                this.updateView(items.value);
            }
            this.showProjects();
        })
    }

    public updateView(items) {
        let weekIsLocked = false;
        let projectsObj = {};

        for (let project of this.projectsService.projects) {
            let weekObj = {};

            projectsObj[project.projectColumnValue.TermGuid] = project; //make sure keyName is projectname

            for (let day of project.week) {
                weekObj[day.dateObj.format().substring(0, 15)] = day;
            }

            projectsObj[project.projectColumnValue.TermGuid].weekObj = weekObj;
        }

        for (let item of items) {
            if (item.Hours >= 1) {
                let itemDate: any = new Date(item.Date);
                let dateKey = itemDate.format().substring(0, 15);
                let day = projectsObj[item.Project.TermGuid].weekObj[dateKey];

                if (day !== undefined) {
                    day.hours = item.Hours;
                    day.isLocked = item.isLocked;

                    if (day.isLocked) { weekIsLocked = true }
                }
            }
        }

        if (weekIsLocked) {
            var saveChanges = false;
            this.userService.lockWeek(true, saveChanges);
        }
    }

    public hideProjects() { //only hide empty hours
        for (let project of this.projectsService.projects) {
            let sumHours = 0;

            for (let day of project.week) {
                sumHours += day.hours;
            }

            if (sumHours === 0) { project.hideProject = true; }
        }
    }

    public showProjects() {
        for (let project of this.projectsService.projects) {
            let projectSumHours = 0;

            for (let day of project.week) {
                projectSumHours += day.hours;
            }

            console.log("(projectSumHours > 0 && projectSumHours !== undefined)", (projectSumHours > 0 && projectSumHours !== undefined));

            if (projectSumHours > 0 && projectSumHours !== undefined) {
                project.hideProject = false;
            }
        }
    }

    public loadProjectsFromTerms(terms: any) { //insert terms+week = projects.
        for (let term of terms) {

            //We want to copy the .week... 
            //..and so we turn everything to strings...
            term.week = JSON.parse(JSON.stringify(this.week)); //lets copy an array, meaning each term has its own copy of week, not sharing.

            //...but we dont want the .dateObj to be stringified, 
            ///...so lets put it back from the source
            for (let i = 0; i < term.week.length; i++) {
                term.week[i].dateObj = new Date(this.week[i].dateObj);
            }

            var project: Project = term;
            this.projectsService.projects.push(project);
        }
    }

    public gotoWeek() {
        this.weekService.nextWeek();
        this.loadWeek();
    }

    public backtoWeek() {
        this.weekService.lastWeek();
        this.loadWeek();
    }

    public selectItem(project) {
        if (project.hideProject === true) {
            project.hideProject = false;
            var index = this.projectsService.projects.indexOf(project);
            var splicedItem = this.projectsService.projects.splice(index, 1);
            this.projectsService.projects.push(splicedItem[0]);
        }
        this.filteredProjects = [];
    }

    public decimalConfig() {
        return this.userService.isAdmin ? "1.2-2" : "1.0";
        //admin shows more decimals
        //1.0 means minimum 1 digit before decimal , 0 after.
    }

    public deleteProject(project: Project) {
        console.log("deleteProject()");
        project.hideProject = true;
    }

    public getSum(project) {
        //ROW: Add upp all hours from a single project's entire week.
        var sum = 0;
        for (let day of project.week) {
            sum += day.hours;
        }
        return sum;
    }
    public getSumDay(index) {
        //COLUMN : Add upp all hours from a single week's day.
        var sum = 0;
        if (this.projectsService.projects !== undefined) {
            for (let project of this.projectsService.projects) {
                if (!project.hideProject) {
                    sum += project.week[index].hours;
                }
            }
        }

        return sum;
    }

    public getSumTotal() {
        var sum = 0;
        for (let index in this.week) {
            sum += this.getSumDay(index);

            if (sum >= 0 && sum <= 39) {
                document.getElementById("sumWeek").className = "red";
            }
            else if (sum > 40) {
                document.getElementById("sumWeek").className = "yellow";
            }
            else if (sum == 40) {
                document.getElementById("sumWeek").className = "green";
            }
        }
        return sum;
    }

    public removeZeroInInput(event) {
        event.stopPropagation();
        if (event.srcElement.value === "0") {
            event.srcElement.value = "";
        }
    }

    public onBlurHoursInput(event) {
        this.roundHours(event);
        this.userService.save();
    }

    public roundHours(event) {
        //replace "" with "0"
        if (event.srcElement.value === "") {
            event.srcElement.value = "0";
        }
        else {
            //round hours to max .xx decimals (two decimals)
            var num = event.srcElement.valueAsNumber;
            var roundedNum = num.toFixed(2);
            event.srcElement.valueAsNumber = roundedNum;
        }
    }
}