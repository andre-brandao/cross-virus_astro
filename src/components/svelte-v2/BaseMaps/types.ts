import MapView from "@arcgis/core/views/MapView";
import WebMap from "@arcgis/core/WebMap";
// import Map from "@arcgis/core/Map";

import Widget from "@arcgis/core/widgets/Widget";

import type { ArcgisFilter, LayerFilter } from "../types";
import type SceneView from "@arcgis/core/views/SceneView";

// export interface LayerFilter {
//   where: string;
//   label: string;
// }
export type MapWidgetCreator = (view: MapView) => Widget;
export type SceneWidgetCreator = (view: SceneView) => Widget;

export interface DragSearchMapParams {
  // map: WebMap | Map
  mapID: string;

  options?: {
    drag_filter?: {
      radius?: number;
      sql_filter: ArcgisFilter[];
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
  // 'on:event': (e: CustomEvent<boolean>) => void;
}

export interface PolygonSearchParams {
  // map: WebMap | Map
  mapID: string;

  options?: {
    filter?: {
      radius?: number;
      sql_filter: ArcgisFilter[];
      layerName?: string;
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

export interface SimpleMapParams {
  mapID: string;
  options?: {
    widgets?: {
      topRight?: (view: MapView) => Widget;
      topLeft?: (view: MapView) => Widget;
      bottomLeft?: (view: MapView) => Widget;
      bottomRight?: (view: MapView) => Widget;
    };
  };
}
