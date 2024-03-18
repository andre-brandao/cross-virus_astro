import MapView from "@arcgis/core/views/MapView";
import Widget from "@arcgis/core/widgets/Widget";
import SceneView from "@arcgis/core/views/SceneView.js";

import type { ChartConfiguration } from "chart.js/auto";

export interface ChartFiltered {
  chart: any;
  sql_filter: ArcgisFilter[];

  size?: {
    width: number;
    height: number;
  };
}

export interface ArcgisFilter {
  onStatisticField: string;
  outStatisticFieldName: string;
  statisticType: string;
}
export interface LayerFilter {
  where: string;
  label: string;
}
