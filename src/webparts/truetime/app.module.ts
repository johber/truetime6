import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

//root component
import { AppComponent } from './app.component';

//children components
import { TestComponent } from './test.component'
import { BillingComponent } from './billing.component';

import { ListService } from './list.service';
import { WeekService } from './week.service';
import { ProjectsService } from './projects.service';
import { UserService } from './user.service';
import { NewTermsService } from './newterms.service';

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [AppComponent, TestComponent, BillingComponent],
  bootstrap: [AppComponent],
  providers: [ListService, WeekService, ProjectsService, UserService, NewTermsService]
})

export class AppModule { }