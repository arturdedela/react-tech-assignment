import "maplibre-gl/dist/maplibre-gl.css";
import "./PlanesMap.css";
import { GeoJSONSource, Map, setWorkerUrl, Popup } from "maplibre-gl";
import { useEffect, useRef } from "react";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import type { PlaneBasic } from "../../types";
// import PlanePng from "../assets/plane.png";
import PlanePng from "../../assets/plane-1.png";
import type { Feature, GeoJSON } from "geojson";
import { getBearing } from "./utils";

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

    map.loadImage(PlanePng).then((image) => {
      map.addImage("plane-svg", image.data, { sdf: true });
    });

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
        type: "symbol",
        layout: {
          "icon-image": "plane-svg",
          "icon-size": 0.8,
          "icon-allow-overlap": true,

          // Heading rotation
          "icon-rotate": ["get", "heading"],
          "icon-rotation-alignment": "auto",
        },
        paint: {
          "icon-color": ["get", "color"],
        },
      });

      // When a click event occurs on a feature in the places layer, open a popup at the
      // location of the feature, with description HTML from its properties.
      map.on("click", "planes", (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const description = e.features[0].properties.description;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new Popup().setLngLat(coordinates).setHTML(description).addTo(map);
      });

      // Change the cursor to a pointer when the mouse is over the places layer.
      map.on("mouseenter", "planes", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      // Change it back to a pointer when it leaves.
      map.on("mouseleave", "planes", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    return () => map.remove();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.loaded()) {
      return;
    }

    async function updatePlanes() {
      const planesSource = map.getSource<GeoJSONSource>("planes-data");
      const prevPlanes: GeoJSON = await planesSource.getData();

      if (prevPlanes.type !== "FeatureCollection") {
        console.error("invalid GeoJSON in planes source");
        return;
      }

      const prevCoordinatesMap = prevPlanes.features.reduce<
        Record<string, number[]>
      >((acc, next) => {
        if (next.geometry.type === "Point") {
          acc[next.id] = next.geometry.coordinates;
        }

        return acc;
      }, {});

      const planesGeoJson: Feature[] = planes.map((plane) => {
        return {
          type: "Feature",
          id: plane.id,
          properties: {
            color: plane.color,
            altitude: plane.altitude,
            heading: prevCoordinatesMap[plane.id]
              ? getBearing(prevCoordinatesMap[plane.id], [
                  plane.longitude,
                  plane.latitude,
                ])
              : 0,
          },
          geometry: {
            type: "Point",
            coordinates: [plane.longitude, plane.latitude],
          },
        };
      });

      planesSource.setData({
        type: "FeatureCollection",
        features: planesGeoJson,
      });
    }

    updatePlanes();
  }, [planes]);

  return <div id="planes-map" />;
};
