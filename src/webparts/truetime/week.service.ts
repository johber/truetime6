import { Injectable } from '@angular/core';

import { Project, Day } from './trueTimeData';

@Injectable()
export class WeekService {

    public weekStart: any;
    public weekEnd: any;
    public monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    public monthNamesLarge = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    public year = ["string", "string", "string"];
    public dayNames = ["M", "T", "W", "TH", "F", "S", "SU"];
    public dayNamesSundayFirst = ["SU", "M", "T", "W", "TH", "F", "S"];
    public weekNumber: number;
    public weeks: any[]
    public month: number;
    public thisYear = new Date().getFullYear();

    constructor() {

        this.setupWeeks(new Date().getFullYear()); //...and years
        this.findAndMarkToday();

    }

    public setupWeeks(thisYear) {
        this.year = [(thisYear - 1).toString(),
        thisYear.toString(),
        (thisYear + 1).toString()];
        var dayOneOfThisYear = new Date(thisYear, 0, 1);
        var date = dayOneOfThisYear;
        var weeks = []

        //set date the monday before its day.
        while (date.getDay() !== 1) {
            date.setDate(date.getDate()-1);
        }



        while (date.getFullYear() !== thisYear+1) {
            var week = [];
            do {
                var dateObj = new Date(date.getTime());

                var dayObject = {
                    "dateAndMonth": (date.getDate().toString()),// + " " + this.monthNames[date.getMonth()]),
                    "isToday": false,
                    "dateObj": dateObj,
                    "hours": 0,
                    "month": dateObj.getMonth(),
                    "isLocked": false,
                    "dayName": this.dayNamesSundayFirst[dateObj.getDay()]
                }

                var dayCopy = new Date(date.getTime());
                week.push(dayObject);
                date.setDate(date.getDate() + 1);
            } while (date.getDay() !== 1 && date.getFullYear() !== thisYear+1); //goto

            if (week.length === 7) {//goto
                weeks.push(week);
            }//goto
        }
        this.weeks = weeks;

    }

    public findAndMarkToday() {
        var today = new Date();
        for (let week of this.weeks) {
            for (let day of week) {
                if (today.toDateString() === day.dateObj.toDateString()) {
                    this.weekNumber = this.weeks.indexOf(week);
                    day.isToday = true;
                    this.month = day.dateObj.getMonth();
                    this.setupWeekRange(week); //goto fix
                }
            }
        }
    }

    public nextWeek() {

        var week = this.weeks[this.weekNumber];

        //check if monthChange
        var weekEndsWithMonth = week[week.length - 1].dateObj.getMonth();

        if (this.month === weekEndsWithMonth) { //change week regardless of MONTH
            if (this.weekNumber !== this.weeks.length - 1) { //no year-change
                this.weekNumber++;
                this.setupWeekRange(this.weeks[this.weekNumber]);

                week = this.weeks[this.weekNumber];
                this.month = week[0].dateObj.getMonth();

            }
            else {
                this.changeYear(+1);
            }
        }
        else { //change month BUT STAY ON SAME WEEK
            this.month = weekEndsWithMonth;
        }
    }



    public lastWeek() {

        var week = this.weeks[this.weekNumber];

        //check if monthChange
        var weekStartWithMonth = week[0].dateObj.getMonth();

        if (this.month === weekStartWithMonth) { //change week regardless of MONTH

            if (this.weekNumber - 1 >= 0) { //no year-change
                this.weekNumber--;
                this.setupWeekRange(this.weeks[this.weekNumber]);
                week = this.weeks[this.weekNumber];
                this.month = week[week.length - 1].dateObj.getMonth();

            }
            else {
                this.changeYear(-1);
            }
        }
        else { //change month BUT STAY ON SAME WEEK
            this.month = weekStartWithMonth;
        }
    }

    public changeYear(n) {

        if (n > 0) { //increment YEAR

            this.setupWeeks(Number(this.year[2]));
            if (this.thisYear = Number(this.year[2])) { this.findAndMarkToday() }
            this.weekNumber = 0;
            this.month = this.month = this.week()[0].month;//goto
        }
        else if (n < 0) { //decrement YEAR

            this.setupWeeks(Number(this.year[0]));
            if (this.thisYear = Number(this.year[0])) { this.findAndMarkToday() }
            this.weekNumber = this.weeks.length - 1;
            this.month = this.month = this.week()[this.week().length-1].month;
        }
        this.setupWeekRange(this.week());
    }

    private setupWeekRange(array) {

        var start = array[0].dateObj;
        start.setHours(1, 0, 0, 0);

        var end = array[array.length - 1].dateObj;
        end.setHours(11, 59, 59, 999);

        this.weekStart = start;
        this.weekEnd = end;

    }

    public week() {
        return this.weeks[this.weekNumber];
    }

    public weekBeforeLastDayMonth() {
        let month = 11;//December;
        if (this.weeks[this.weekNumber - 1] !== undefined) {
            let lastWeek = this.weeks[this.weekNumber - 1];
            month = lastWeek.month;
        }
        return month;
    }
    public weekNextFirstDayMonth() {
        let month = 0;//January;
        if (this.weeks[this.weekNumber + 1] !== undefined) {
            let nextWeek = this.weeks[this.weekNumber + 1];
            month = nextWeek[0].month;
        }
        return month;
    }
}