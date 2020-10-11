/* eslint-disable @typescript-eslint/no-explicit-any */
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as mockData from "./fakeJson.json";
import CardViewer from "./Card";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { MetadataObject } from "./Utilities/CardViewer.types";

export class CardViewerMain implements ComponentFramework.StandardControl<IInputs, IOutputs> {
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
    this.notifyOutputChanged = notifyOutputChanged;
    this.runMain(context, context.parameters.dataset.getTargetEntityType(), "customertypecode", false);
  }

  private async runMain(
    context: ComponentFramework.Context<IInputs>,
    entityName: string,
    field: string,
    isFake: boolean,
  ): Promise<void> {
    this._container.innerHTML = "";
    const objectCountAndName: [MetadataObject] = await this.getJsonObjectUtils(context, entityName, field, isFake);
    ReactDOM.render(React.createElement(CardViewer, objectCountAndName), this._container);
  }

  getJsonObjectUtils = async (
    context: ComponentFramework.Context<IInputs>,
    entityName: string,
    field: string,
    isFake: boolean,
  ): Promise<[MetadataObject]> => {
    const objectCountAndName: [MetadataObject] = mockData as [MetadataObject];
    if (isFake) {
      return objectCountAndName;
    }
    const metadata = await context.utils.getEntityMetadata(entityName, [field]);
    const values: any = Object.values(metadata.Attributes.get(field).OptionSet);
    for (const objectValue of values) {
      const records: any = await context.webAPI.retrieveMultipleRecords(
        entityName,
        `?$filter=${field} eq ${objectValue.value}`,
      );
      const count = records.entities.length;
      const countandname = { count: count, name: objectValue.text };
      objectCountAndName.push(countandname);
    }
    return objectCountAndName;
  };

  /**
   * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
   */
  public updateView(): void {
    return;
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
