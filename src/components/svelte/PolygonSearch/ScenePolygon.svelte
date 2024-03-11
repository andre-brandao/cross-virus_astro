<script lang="ts">
  import "@arcgis/core/assets/esri/themes/light/main.css";
  import MapView from "@arcgis/core/views/MapView";
  import WebMap from "@arcgis/core/WebMap";
  // import Map from "@arcgis/core/Map";
  import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
  import * as promiseUtils from "@arcgis/core/core/promiseUtils.js";
  import LayerView from "@arcgis/core/views/layers/LayerView";
  import Layer from "@arcgis/core/layers/Layer";
  import { createEventDispatcher } from "svelte";
  import type { Action } from "svelte/action";
  import Widget from "@arcgis/core/widgets/Widget";
  // import View from "@arcgis/core/views/View.js";
  import Draw from "@arcgis/core/views/draw/Draw.js";

  import WebScene from "@arcgis/core/WebScene.js";
  import SceneView from "@arcgis/core/views/SceneView.js";
  import Legend from "@arcgis/core/widgets/Legend.js";
  import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";
  import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel.js";
  import Slider from "@arcgis/core/widgets/Slider.js";
  import * as geometryEngine from "@arcgis/core/geometry/geometryEngine.js";
  import Graphic from "@arcgis/core/Graphic.js";
  import Expand from "@arcgis/core/widgets/Expand.js";
  import BasemapGallery from "@arcgis/core/widgets/BasemapGallery.js";
  // export let mapID: string;

  const dispatch = createEventDispatcher();

  import type { ArcgisFilter, PolygonSearchParams } from "../types";

  export let mapConfig: PolygonSearchParams;

  console.log(mapConfig);

  let geometryButtonsClickHandler = (event) => {
    console.log("geometryButtonsClickHandler", event);
  };

  interface ArcgisEvents {
    "on:query_results": (e: CustomEvent<any>) => void;
  }

  const drag_search_map: Action<
    HTMLDivElement,
    PolygonSearchParams,
    ArcgisEvents
  > = (node, param: PolygonSearchParams) => {
    const { mapID, options } = param;

    const webscene = new WebScene({
      portalItem: {
        id: mapID, //"00ca13f9e04548c1b2d4d0ea918d46de"
      },
    });

    const view = new SceneView({
      container: "viewDiv",
      map: webscene,
    });

    const sketchLayer = new GraphicsLayer();
    const bufferLayer = new GraphicsLayer();
    view.map.addMany([bufferLayer, sketchLayer]);

    // create an instance of draw polyline action
    // the polyline vertices will be only added when
    // the pointer is clicked on the view

    if (options?.widgets) {
      const { topRight, topLeft, bottomLeft, bottomRight } = options.widgets;

      //   if (topRight) {
      //     view.ui.add(topRight(view), "top-right");
      //   }
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

    view.ui.add("queryDiv", "top-right");

    // BUSCA ESTATISTICAS AO DESLIZAR

    if (options && options.filter) {
      const { radius, sql_filter, fieldNames, layerName, where } =
        options.filter;

      if (where) {
        console.log(
          "Extra where clause, charts with 2 datasets will receive Where:",
          where
        );
      }
      let sceneLayer: LayerView;
      let sceneLayerView: Layer;
      let bufferSize = 0;
      webscene.load().then(() => {

        if (!layerName) {
          console.error("No layerName found");
        }

        sceneLayer = webscene.layers.find((layer) => {
          return layer.title === layerName;
        });
        // sceneLayer = webscene.layers.getItemAt(0);
        sceneLayer.outFields = fieldNames;
        console.log(sceneLayer);

        view.whenLayerView(sceneLayer).then((layerView) => {
          // console.log('got layer', layerView);

          sceneLayerView = layerView;
          //   queryDiv.style.display = "block";
        });
      });

      // use SketchViewModel to draw polygons that are used as a query
      let sketchGeometry = null;
      const sketchViewModel = new SketchViewModel({
        layer: sketchLayer,
        defaultUpdateOptions: {
          tool: "reshape",
          toggleToolOnClick: false,
        },
        view: view,
        defaultCreateOptions: { hasZ: false },
      });

      sketchViewModel.on("create", function (event) {
        if (event.state === "complete") {
          sketchGeometry = event.graphic.geometry;
          runQuery();
        }
      });

      sketchViewModel.on("update", function (event) {
        if (event.state === "complete") {
          sketchGeometry = event.graphics[0].geometry;
          runQuery();
        }
      });

      const bufferNumSlider = new Slider({
        container: "bufferNum",
        min: 0,
        max: 500,
        steps: 1,
        visibleElements: {
          labels: true,
        },
        precision: 0,
        labelFormatFunction: function (value, type) {
          return value.toString() + "m";
        },
        values: [0],
      });

      bufferNumSlider.on(
        ["thumb-change", "thumb-drag"],
        bufferVariablesChanged
      );
      function bufferVariablesChanged(event) {
        bufferSize = event.value;
        runQuery();
      }

      geometryButtonsClickHandler = (event) => {
        const geometryType = event.target.value;
        clearGeometry();
        sketchViewModel.create(geometryType);
      };

      function clearHighlighting() {
        if (highlightHandle) {
          highlightHandle.remove();
          highlightHandle = null;
        }
      }
      function clearGeometry() {
        sketchGeometry = null;
        sketchViewModel.cancel();
        sketchLayer.removeAll();
        bufferLayer.removeAll();
        clearHighlighting();
        // clearCharts();
        // resultDiv.style.display = "none";
        // resultDiv2.style.display = "none";
      }
      function highlightBuildings(objectIds) {
        // Remove any previous highlighting
        clearHighlighting();
        const objectIdField = sceneLayer.objectIdField;
        // document.getElementById("count").innerHTML = objectIds.length;

        highlightHandle = sceneLayerView.highlight(objectIds);
      }
      function updateBufferGraphic(buffer) {
        // add a polygon graphic for the buffer
        if (buffer > 0) {
          var bufferGeometry = geometryEngine.geodesicBuffer(
            sketchGeometry,
            buffer,
            "meters"
          );
          if (bufferLayer.graphics.length === 0) {
            bufferLayer.add(
              new Graphic({
                geometry: bufferGeometry,
                symbol: sketchViewModel.polygonSymbol,
              })
            );
          } else {
            bufferLayer.graphics.getItemAt(0).geometry = bufferGeometry;
          }
        } else {
          bufferLayer.removeAll();
        }
      }

      function updateSceneLayer() {
        console.log(sceneLayerView.view);

        const query = sceneLayerView.createQuery();
        query.geometry = sketchGeometry;
        query.distance = bufferSize;
        return sceneLayerView.queryObjectIds(query).then(highlightBuildings);
      }

      // set the geometry query on the visible SceneLayerView
      var debouncedRunQuery = promiseUtils.debounce(function () {
        if (!sketchGeometry) {
          return;
        }

        //   resultDiv.style.display = "flex";
        //   resultDiv2.style.display = "flex";

        updateBufferGraphic(bufferSize);
        return promiseUtils.eachAlways([queryStatistics(), updateSceneLayer()]);
      });

      function runQuery() {
        debouncedRunQuery().catch((error) => {
          if (error.name === "AbortError") {
            return;
          }

          console.error(error);
        });
      }

      function queryStatistics() {
        const statDefinitions = sql_filter;

        if (!statDefinitions) {
          console.error("No sql_query found");
          return;
        }

        const query = sceneLayerView.createQuery();
        query.geometry = sketchGeometry;
        query.distance = bufferSize;
        query.outStatistics = statDefinitions;

        sceneLayer
          .queryFeatures(query)
          .then(dispatchQueryResults)
          .catch((e: any) => {
            console.error("Error querying features", e);
          });
      }
    }
  };

  function dispatchQueryResults(e: CustomEvent<any>) {
    const results = e.features[0].attributes;

    // console.log(results);

    // const query_values = results.map((res: any) => res.value);
    // console.log("query results:", results);
    dispatch("query_results", results);
  }

  let highlightHandle: any = null;
  let queryDiv: HTMLDivElement;
  export let mapClass = "w-full h-[50vh] md:w-2/3 md:h-[90vh]";
</script>

<div id="viewDiv" class={mapClass} use:drag_search_map={mapConfig}></div>

<div
  bind:this={queryDiv}
  id="queryDiv"
  class="border bg-gray-200 border-secondary p-3"
>
  <b>Consulta por:</b><br />
  <div class="flex flex-row w-full justify-around">
    <button
      class="esri-widget--button border border-primary w-1/3 esri-icon-map-pin geometry-button"
      id="point-geometry-button"
      value="point"
      title="Query by point"
      on:click={geometryButtonsClickHandler}
    ></button>
    <button
      class="esri-widget--button border border-primary w-1/3 esri-icon-polyline geometry-button"
      id="line-geometry-button"
      value="polyline"
      title="Query by line"
      on:click={geometryButtonsClickHandler}
    ></button>
    <button
      class="esri-widget--button border border-primary w-1/3 esri-icon-polygon geometry-button"
      id="polygon-geometry-button"
      value="polygon"
      title="Query by polygon"
      on:click={geometryButtonsClickHandler}
    ></button>
  </div>

  <br />
  <div class="tooltip">
    <label for="bufferNum">Raio de alcance:</label>
    <div id="bufferNum" class="w-[90%] mt-10 mx-auto"></div>
  </div>
  <br />
  <button class="esri-button" id="clearGeometry" type="button"> Limpar </button>
</div>

<style>
  #queryDiv {
    min-width: 250px;
    font-size: 14px;
    padding: 10px;
    /* display: none; */
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
