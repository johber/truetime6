declare interface ITruetimeStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
}

declare module 'truetimeStrings' {
  const strings: ITruetimeStrings;
  export = strings;
}
