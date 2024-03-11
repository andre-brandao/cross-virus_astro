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
    import Draw from "@arcgis/core/views/draw/Draw.js";
  
    // export let mapID: string;
  
  
    import type {  SimpleMapParams } from "../types";
  
    export let options: SimpleMapParams;

    const drag_search_map: Action<
      HTMLDivElement,
      SimpleMapParams
    > = (node, param: SimpleMapParams) => {
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
      // create an instance of draw polyline action
      // the polyline vertices will be only added when
      // the pointer is clicked on the view
  
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
  
    };
  
    export let mapClass = "w-full md:h-[90vh]";
  </script>
  
  <div class={mapClass} use:drag_search_map={options}></div>
  