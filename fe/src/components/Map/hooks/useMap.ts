import { useState, useEffect } from "react";
import { Map } from "maplibre-gl";
import { setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

type UseMapOptions = {
  container: HTMLElement | null;
};

setWorkerUrl(workerUrl);

export const useMap = ({ container }: UseMapOptions): Map | null => {
  const [map, setMap] = useState<Map | null>(null);

  useEffect(() => {
    if (!container) {
      return;
    }

    const mapInstance = new Map({
      container,
      // Styles available here: https://openfreemap.org/quick_start/
      style: "https://tiles.openfreemap.org/styles/positron",
      center: [0, 0],
      zoom: 1,
      minZoom: 1,
      maxZoom: 12,
      maxPitch: 80,
      renderWorldCopies: false,
    });

    mapInstance.once("load", () => {
      addTerain(mapInstance);

      setMap(mapInstance);
    });

    return () => {
      mapInstance.remove();
    };
  }, [container]);

  return map;
};

function addTerain(map: Map) {
  map.addSource("terrainSource", {
    type: "raster-dem",
    tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
    encoding: "terrarium",
    tileSize: 256,
    maxzoom: 15,
    attribution:
      '<a href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md">Mapzen terrain attribution</a>',
  });

  map.setTerrain({
    source: "terrainSource",
    exaggeration: 1,
  });
}
