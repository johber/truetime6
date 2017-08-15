import { Injectable } from '@angular/core';

@Injectable()
export class NewTermsService {

  //config
  public termGroupName = "truetime";
  public termSetName = "Project";

  public terms;


  public context : SP.ClientContext;

    constructor() {

      

      //const context: SP.ClientContext = new SP.ClientContext(window["context"].pageContext.web.absoluteUrl)
      //console.log("context", context);
      //this.context = context;
      this.context = new SP.ClientContext(window["context"].pageContext.web.absoluteUrl);



    }

    public getTermsFlow(): Promise<any>{
      return new Promise((resolve) => {
        this.getTermStore().then(
          (termStore : SP.Taxonomy.TermStore)=>{
            console.log("termStore", termStore);
            this.checkCreateGroup(termStore).then(
              (termSet : SP.Taxonomy.TermSet)=>{
                console.log("finally got termSet", termSet);
                this.extractTerms(termSet).then(
                  (customTerms)=>{
                    console.log("extraction complete, customTerms", customTerms);
                    this.terms = customTerms;
                    resolve(customTerms);
                    return;
                  }
                )
              }
            );
          }
        );
      });
    }

    public extractTerms(termSet : SP.Taxonomy.TermSet): Promise<any>{
      return new Promise((resolve) => {

        let loadedTerms = [];

        let termCollection = termSet.getAllTerms()
        this.context.load(termCollection);
        this.context.executeQueryAsync(
          ()=>{
            let enumerator = termCollection.getEnumerator();
            while(enumerator.moveNext()) {
              let current = enumerator.get_current();
              console.log("current", current);
              let termObject = {}
              termObject["props"] = current.get_customProperties();

              termObject["projectColumnValue"] = {
                Label: current.get_name(),
                TermGuid: current.get_id().toString(),
                WssId: -1
              }
              

              termObject["name"] = current.get_name();
              termObject["hideProject"] = true; //goto

              /*  IsActive CUSTOM PROPERTIES INTENDED USAGE 
                  Hide projects completely from the app if it is not "active"
                  we keep the term for past list-items(obsolete projects)

              if (correctTerm.props.isActive === "true") {
                  organizedTerms.push(correctTerm);
              }
              */

              loadedTerms.push(termObject)
            }

            console.log("loadedTerms", loadedTerms);
            resolve(loadedTerms);
            return;
          },
          (sender, args)=>{console.log("sender, args", sender, args);}
        )
      });
    }

    public checkCreateGroup(termStore : SP.Taxonomy.TermStore): Promise<any> {
      return new Promise((resolve) => {
        let termCollection = termStore.createGroup(this.termGroupName, SP.Guid.newGuid());
        this.context.load(termCollection);
        this.context.executeQueryAsync(()=>{  
          console.log("group created");       
          let projectsGuid = SP.Guid.newGuid();
          termCollection.createTermSet(this.termSetName, projectsGuid, 1033);//1033 is english
          this.context.executeQueryAsync(
            ()=>{ 
                //create sample project
                let projectsTermSet = termStore.getTermSet(projectsGuid);
                
                this.context.load(projectsTermSet);
                this.context.executeQueryAsync(
                  ()=>{ 
                    console.log("success");
                    console.log("loaded projectsTermSet ", projectsTermSet);
                    projectsTermSet.createTerm("my first project", 1033, SP.Guid.newGuid());
                    this.context.executeQueryAsync(
                      ()=>{ 
                        console.log("success");
                        resolve(projectsTermSet);
                        return;
                      },(sender, args)=>{console.log("sender, args", sender, args);}
                    );
                  },(sender, args)=>{console.log("sender, args", sender, args);}
                );
            },(sender, args)=>{console.log("sender, args", sender, args);}
          );
        }, (sender, args)=>{
          console.log("group already exists");
          console.log("sender, args", sender, args);

          //select existing
          let projectsTermsetCollection = termStore.getTermSetsByName(this.termSetName, 1033)

          this.context.load(projectsTermsetCollection);
          this.context.executeQueryAsync(
            ()=>{
              resolve(projectsTermsetCollection.getItemAtIndex(0));
              return;
            },(sender, args)=>{console.log("sender, args", sender, args);})
        });
      });
    }

    public getTermStore(): Promise<SP.Taxonomy.TermStore> {
      return new Promise((resolve) => {

        let taxSession = SP.Taxonomy.TaxonomySession.getTaxonomySession(this.context);
        let termStores = taxSession.get_termStores();
        this.context.load(termStores);
          console.log("MinTest", termStores);
        this.context.executeQueryAsync(
          ()=>{
              console.log("loaded termStores", termStores);
              resolve(termStores.getItemAtIndex(0));
              return;
            },
          (sender, args)=>{console.log("sender, args", sender, args);}
        );
      });
    }
}