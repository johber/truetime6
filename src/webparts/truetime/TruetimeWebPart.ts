import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';

import styles from './Truetime.module.scss';
import * as strings from 'truetimeStrings';
import { ITruetimeWebPartProps } from './ITruetimeWebPartProps';

require('sp-init');
require('microsoft-ajax');
require('sp-runtime');
require('sharepoint');
require('taxonomy');

// init Angular 2
import 'reflect-metadata';
require('zone.js');
//
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app.module';
//

export default class TruetimeWebPart extends BaseClientSideWebPart<ITruetimeWebPartProps> {

  public render(): void {
    this.domElement.innerHTML = `
    
      <my-app></my-app>
      
      `;
      window["context"] = this.context;

      platformBrowserDynamic().bootstrapModule(AppModule);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
