import MapView from "@arcgis/core/views/MapView";
import Widget from "@arcgis/core/widgets/Widget";
import SceneView from "@arcgis/core/views/SceneView.js";

import type { ChartConfiguration } from "chart.js/auto";

export interface ChartFiltered {
  chart: ChartConfiguration;
  // data_keys: string[];
  sql_filter: ArcgisFilter[];

  size: {
    width: number;
    height: number;
  };
}

export interface MapWrapperParams {
  mapID: string;

  charts: ChartFiltered[];

  options?: {
    filter?: {
      radius?: number;
      fieldNames: string[];
      where?: string;
    };
    widgets?: {
      topRight?: (view: MapView) => Widget;
      topLeft?: (view: MapView) => Widget;
      bottomLeft?: (view: MapView) => Widget;
      bottomRight?: (view: MapView) => Widget;
    };
  };
}

export interface DragSearchMapParams {
  // map: WebMap | Map
  mapID: string;

  options?: {
    filter?: {
      radius?: number;
      sql_filter: ArcgisFilter[];
      fieldNames: string[];
      where?: string;
    };
    widgets?: {
      topRight?: (view: MapView) => Widget;
      topLeft?: (view: MapView) => Widget;
      bottomLeft?: (view: MapView) => Widget;
      bottomRight?: (view: MapView) => Widget;
    };
  };
  // 'on:event': (e: CustomEvent<boolean>) => void;
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

export interface SceneWrapperParams {
  mapID: string;

  charts: ChartFiltered[];

  options?: {
    filter?: {
      layerName?: string;
      radius?: number;
      fieldNames: string[];
      where?: string;
    };
    widgets?: {
      topRight?: (view: SceneView) => Widget;
      topLeft?: (view: SceneView) => Widget;
      bottomLeft?: (view: SceneView) => Widget;
      bottomRight?: (view: SceneView) => Widget;
    };
  };

}

export interface PolygonSearchParams{
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
        topRight?: (view: SceneView) => Widget;
        topLeft?: (view: SceneView) => Widget;
        bottomLeft?: (view: SceneView) => Widget;
        bottomRight?: (view: SceneView) => Widget;
      };
    };
}

export interface ArcgisFilter {
  onStatisticField: string;
  outStatisticFieldName: string;
  statisticType: string;
}
