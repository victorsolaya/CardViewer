/* eslint-disable @typescript-eslint/no-explicit-any */
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import CardView from "./Card";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { MetadataObject } from "./Utilities/CardViewer.types";

interface DatasetApiEntityRecord extends ComponentFramework.PropertyHelper.DataSetApi.EntityRecord {
  _columnAliasNameMap: OptionSetColumnMap;
}

interface OptionSetColumnMap {
  optionSetField: string;
}

interface ResponseRetrieveRecords {
  count: number;
  options: string;
  hasNextLink: boolean;
}

export class CardViewer implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private _container: HTMLDivElement;
  private _optionValues: number[];
  notifyOutputChanged: () => void;

  /**
   * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
   * Data-set values are not initialized here, use updateView.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
   * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
   * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
   * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement,
  ) {
    this._container = container;
  }

  private async runMain(
    context: ComponentFramework.Context<IInputs>,
    entityName: string,
    field: string,
  ): Promise<void> {
    this._container.innerHTML = "";
    const objectCountAndName: [MetadataObject] = await this.getJsonObjectUtils(context, entityName, field);
    ReactDOM.render(React.createElement(CardView, objectCountAndName), this._container);
  }

  private initializeComponent(context: ComponentFramework.Context<IInputs>) {
    let fieldName = "statuscode";
    if (Object.values(context.parameters.dataset.records).length > 0) {
      const entityRecord = Object.values(context.parameters.dataset.records)[0] as DatasetApiEntityRecord;
      fieldName = entityRecord._columnAliasNameMap.optionSetField;
    }

    this.runMain(context, context.parameters.dataset.getTargetEntityType(), fieldName);
  }

  private async retrieveRecords(context: ComponentFramework.Context<IInputs>, entityName: string, options: string) {
    let hasNextLink = false;
    const results = await context.webAPI.retrieveMultipleRecords(entityName, options, 5000);
    let substringUrl = "";
    if (results.nextLink) {
      const questionMarkIndex = results.nextLink.indexOf("?");
      substringUrl = results.nextLink.substring(questionMarkIndex);
      hasNextLink = true;
    }
    const response: ResponseRetrieveRecords = {
      count: results.entities.length,
      hasNextLink: hasNextLink,
      options: substringUrl,
    };
    return response;
  }
  private splice(stringOriginal: string, index: number, stringToAdd: string) {
    return stringOriginal.slice(0, index) + stringToAdd + stringOriginal.slice(index);
  }
  private mapFetchXml(fetchXml: string, field: string, value: number) {
    const condition = `<condition attribute="${field}" operator="eq" value="${value}" />`;
    const filter = `<filter type="and">${condition}</filter>`;
    let indexOfFilter = 0;

    if (fetchXml.includes("</filter>")) {
      indexOfFilter = fetchXml.indexOf("</filter>");
      fetchXml = this.splice(fetchXml, indexOfFilter, condition);
    } else {
      indexOfFilter = fetchXml.indexOf("</entity>");
      fetchXml = this.splice(fetchXml, indexOfFilter, filter);
    }
    return fetchXml;
  }

  getJsonObjectUtils = async (
    context: ComponentFramework.Context<IInputs>,
    entityName: string,
    field: string,
  ): Promise<[MetadataObject]> => {
    const objectCountAndName: [MetadataObject] = [{}] as [MetadataObject];

    const metadata = await context.utils.getEntityMetadata(entityName, [field]);
    const values: any = Object.values(metadata.Attributes.get(field).OptionSet);
    let fetchXmlFromView = await context.webAPI.retrieveRecord("savedquery", context.parameters.dataset.getViewId());
    if (fetchXmlFromView == null) {
      fetchXmlFromView = await context.webAPI.retrieveRecord("userquery", context.parameters.dataset.getViewId());
    }

    for (const objectValue of values) {
      let fetchXml = fetchXmlFromView.fetchxml;
      fetchXml = this.mapFetchXml(fetchXml, field, objectValue.value);

      let response: ResponseRetrieveRecords = await this.retrieveRecords(
        context,
        entityName,
        `?fetchXml=${encodeURI(fetchXml)}`,
      );
      let count = response.count;
      while (response.hasNextLink) {
        response = await this.retrieveRecords(context, entityName, response.options);
        count = count + response.count;
      }

      const countandname = { count: count, name: objectValue.text };
      objectCountAndName.push(countandname);
    }
    return objectCountAndName;
  };

  /**
   * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
   */
  public updateView(context: ComponentFramework.Context<IInputs>): void {
    this.initializeComponent(context);
  }

  /**
   * It is called by the framework prior to a control receiving new data.
   * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
   */
  public getOutputs(): IOutputs {
    return {};
  }

  /**
   * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
   * i.e. cancelling any pending remote calls, removing listeners, etc.
   */
  public destroy(): void {
    // Add code to cleanup control if necessary
  }
}
