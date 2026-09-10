import "maplibre-gl/dist/maplibre-gl.css";
import "./PlanesMap.css";
import { GeoJSONSource, Map, setWorkerUrl } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import type { PlaneBasic } from "../types";

setWorkerUrl(workerUrl);

interface PlanesMapProps {
  planes: PlaneBasic[];
}

export const PlanesMap = ({ planes }: PlanesMapProps) => {
  const mapRef = useRef<Map>(null);

  useEffect(() => {
    mapRef.current = new Map({
      container: "planes-map", // container id
      style: "https://demotiles.maplibre.org/style.json", // style URL
      center: [0, 0], // starting position [lng, lat]
      zoom: 1, // starting zoom
      maplibreLogo: true,
    });

    const map = mapRef.current;

    map.once("load", () => {
      map.addSource("planes-data", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.addLayer({
        id: "planes",
        source: "planes-data",
        type: "circle",
        paint: {
          "circle-color": "red",
        },
      });

      map.on("click", "my-data-point", (ev) => {
        console.log("click: ", ev);
        console.log(ev.features);
      });
    });

    return () => map.remove();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.loaded()) {
      return;
    }

    const planesGeoJson = planes.map((plane) => {
      return {
        type: "Feature",
        properties: {
          planeId: plane.id,
          planeColor: plane.color,
        },
        geometry: {
          type: "Point",
          coordinates: [plane.longitude, plane.latitude],
        },
      };
    });

    const planesSource = map.getSource<GeoJSONSource>("planes-data");

    planesSource.setData({
      type: "FeatureCollection",
      features: planesGeoJson,
    });
  }, [planes]);

  return <div id="planes-map" />;
};
