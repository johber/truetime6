import { Injectable,ChangeDetectorRef } from '@angular/core';

import { Project, Day } from './trueTimeData';

@Injectable()
export class ProjectsService {

    public projects: Project[];

    constructor() {
        this.projects = [];
    }
   
}