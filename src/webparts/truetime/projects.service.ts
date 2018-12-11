import { Injectable } from '@angular/core';
import { Project } from './trueTimeData';

@Injectable()
export class ProjectsService {
    public projects: Project[];

    constructor() { this.projects = []; }
}