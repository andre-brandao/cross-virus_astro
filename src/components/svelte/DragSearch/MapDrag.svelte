<script lang="ts">
    import "@arcgis/core/assets/esri/themes/light/main.css";
    import MapView from "@arcgis/core/views/MapView";
    import WebMap from "@arcgis/core/WebMap";
    // import Map from "@arcgis/core/Map";
    import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
    import * as promiseUtils from "@arcgis/core/core/promiseUtils.js";
    import LayerView from "@arcgis/core/views/layers/LayerView";
    import { createEventDispatcher } from "svelte";
    import type { Action } from "svelte/action";
    import Widget from "@arcgis/core/widgets/Widget";
    // import View from "@arcgis/core/views/View.js";
    // import Draw from "@arcgis/core/views/draw/Draw.js";
  
    // export let mapID: string;
  
    const dispatch = createEventDispatcher();
  
    import type { ArcgisFilter, DragSearchMapParams } from "../types";
  
    export let options: DragSearchMapParams;
  
    interface ArcgisEvents {
      "on:query_results": (e: CustomEvent<any>) => void;
    }
  
    const drag_search_map: Action<
      HTMLDivElement,
      DragSearchMapParams,
      ArcgisEvents
    > = (node, param: DragSearchMapParams) => {
      const { mapID, options } = param;
  
      const map = new WebMap({
        portalItem: {
          id: mapID, //"20707169c14c40f680518710e7f58723"
        },
      });
  
      const view = new MapView({
        container: node,
        map: map,
        highlightOptions: {
          // @ts-expect-error green is a valid color
          color: "green",
          haloOpacity: 0.65,
          fillOpacity: 0.45,
        },
      });
  
      if (options?.widgets) {
        const { topRight, topLeft, bottomLeft, bottomRight } = options.widgets;
  
        if (topRight) {
          view.ui.add(topRight(view), "top-right");
        }
        if (topLeft) {
          view.ui.add(topLeft(view), "top-left");
        }
        if (bottomLeft) {
          view.ui.add(bottomLeft(view), "bottom-left");
        }
        if (bottomRight) {
          view.ui.add(bottomRight(view), "bottom-right");
        }
      }
  
      // BUSCA ESTATISTICAS AO DESLIZAR
  
      if (options && options.filter) {
        const { radius, sql_filter, fieldNames, where } = options.filter;
  
        if (where) {
          console.log(
            "Extra where clause, charts with 2 datasets will receive Where:",
            where
          );
        }
  
        const queryResults = (results: any) => {
  
          const query_res_values = results.map((res: any) => res.value);
  
          // console.log('Resultados query:', query_res_values);
  
          dispatch("query_results", query_res_values);
  
          node.dispatchEvent(
            new CustomEvent("query_results", {
              detail: {
                query_res_values,
                // unsolvedStats,
              },
            })
          );
        };
  
        view.when().then(() => {
          // deprecated(node, view, options)
          const layer = map.layers.getItemAt(0);
          // !!!! FIELD NAMES
          // @ts-expect-error
          layer.outFields = fieldNames;
          view.whenLayerView(layer).then((layerView: LayerView) => {
            reactiveUtils
              .whenOnce(() => !layerView.updating)
              .then(() => {
                // Query layer view statistics as the user clicks
                // or drags the pointer across the view.
                // @ts-expect-error
                view.on(["click", "drag"], (event: any) => {
                  // disables navigation by pointer drag
                  event.stopPropagation();
                  queryStatsOnDrag(view, layerView, event, {
                    radius,
                    sql_filter,
                    where,
                  })
                    .then(queryResults)
                    .catch((error: any) => {
                      if (error.name !== "AbortError") {
                        console.error(error);
                      }
                    });
                });
              });
          });
        });
      }
    };
  
    let highlightHandle: any = null;
  
    const queryStatsOnDrag = promiseUtils.debounce(function (
      view: MapView,
      layerView: LayerView,
      event: any,
  
      filter: {
        radius?: number;
        sql_filter: ArcgisFilter[];
        where?: string;
      }
    ) {
      // create a query object for the highlight and the statistics query
  
      const { sql_filter, radius } = filter;
  
      const query = layerView.layer.createQuery();
      query.geometry = view.toMap(event); // converts the screen point to a map point
  
      //  *****************  CONFIGURA RAIO
      //  var raioC = document.getElementById("lname").value;
  
      query.distance = radius ?? 1; // queries all features within raioC KM of the point
      query.units = "kilometers";
  
      const statsQuery = query.clone();
  
      // Create the statistic definitions for querying stats from the layer view
      // the `onStatisticField` property can reference a field name or a SQL expression
      // `outStatisticFieldName` is the name of the statistic you will reference in the result
      // `statisticType` can be sum, avg, min, max, count, stddev
  
      // const statDefinitions = ;
  
      // add the stat definitions to the the statistics query object cloned earlier
      statsQuery.outStatistics = sql_filter;
  
      // execute the query for all features in the layer view
  
      const query_response = layerView.queryFeatures(statsQuery).then(
        function (response: any) {
          const stats = response.features[0].attributes;
          return stats;
        },
        function (e: any) {
          console.error(e);
        }
      );
  
      const { where } = filter;
      if (where) {
        console.log("where clause for second dataset found", where);
  
        const openStatsQuery = query.clone();
        openStatsQuery.outStatistics = sql_filter;
        openStatsQuery.where = where;
  
        // execute the query for only unsolved homicides in the layer view
        const where_query_response = layerView.queryFeatures(openStatsQuery).then(
          function (response: any) {
            const stats = response.features[0].attributes;
            return stats;
          },
          function (e: any) {
            console.error(e);
          }
        );
  
        // highlight all features within the query distance
        layerView.queryObjectIds(query).then(function (ids: any) {
          if (highlightHandle) {
            highlightHandle.remove();
            highlightHandle = null;
          }
          highlightHandle = layerView.highlight(ids);
        });
  
        // Return the promises that will resolve to each set of statistics
        return promiseUtils.eachAlways([query_response, where_query_response]);
      } else {
        // highlight all features within the query distance
        layerView.queryObjectIds(query).then(function (ids: any) {
          if (highlightHandle) {
            highlightHandle.remove();
            highlightHandle = null;
          }
          highlightHandle = layerView.highlight(ids);
        });
  
        // Return the promises that will resolve to each set of statistics
        return promiseUtils.eachAlways([query_response]);
      }
    });
  
    export let mapClass = "w-full h-[50vh] md:w-2/3 md:h-[90vh]";
  </script>
  
  <div class={mapClass} use:drag_search_map={options}></div>