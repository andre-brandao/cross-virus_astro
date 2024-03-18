import type { ChartFiltered, LayerFilter } from "../types";
import type { SceneWidgetCreator, MapWidgetCreator } from "../BaseMaps/types";

export interface SceneWrapperParams {
  mapID: string;

  charts: ChartFiltered[];

  options?: {
    filter?: {
      layerName: string;
    //   radius?: number;
      fieldNames: string[];
      where?: string;
    };
    widgets?: {
      topRight?: SceneWidgetCreator;
      topLeft?: SceneWidgetCreator;
      bottomLeft?: SceneWidgetCreator;
      bottomRight?: SceneWidgetCreator;
    };
  };
}

export interface MapWrapperParams {
  mapID: string;

  charts: ChartFiltered[];

  options?: {
    drag_filter?: {
      radius?: number;
      fieldNames: string[];
      where?: string;
    };
    feature_table?: {
      title: string;
      fields: {
        type: "field";
        fieldName: string;
        label: string;
        direction?: "asc" | "desc";
      }[];
    };
    layer_filter?: LayerFilter[];
    widgets?: {
      topRight?: MapWidgetCreator;
      topLeft?: MapWidgetCreator;
      bottomLeft?: MapWidgetCreator;
      bottomRight?: MapWidgetCreator;
    };
  };
}
