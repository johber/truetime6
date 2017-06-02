export interface Project {
    name: string;
    type: string;
    week: Array<Day>;
    props: any; //custom properties
        //key: value;
        //key: value...;
    hideProject: boolean;
    showCloseButton: boolean;
    projectColumnValue: {
        label: string;
        TermGuid: string;
        Wssid: number;
    }
}
export interface Day {
    dateAndMonth: string;
    isToday: Boolean;
    dateObj: any;
    hours: number;
    isLocked;
    month:number;
    dayName:string;
}