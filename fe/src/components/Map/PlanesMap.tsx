import "maplibre-gl/dist/maplibre-gl.css";
import "./PlanesMap.css";
import { GeoJSONSource, Map, setWorkerUrl } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import type { PlaneBasic } from "../../types";
// import PlanePng from "../assets/plane.png";
import { getBearing } from "./utils";
import { type PlaneFeature } from "./types";
import { MapPopup } from "./MapPopup/MapPopup";
import PlanePng from "../../assets/plane-1.png";
import { usePlanesLayer } from "./usePlanesLayer";

setWorkerUrl(workerUrl);

interface PlanesMapProps {
  planes: PlaneBasic[];
  selectedPlaneId: string | null;
  onPlaneSelect: (planeId: string) => void;
  onPopupClose: () => void;
  selectedPlaneContent: React.ReactNode | null;
}

export const PlanesMap = ({
  planes,
  selectedPlaneId,
  onPlaneSelect,
  selectedPlaneContent,
  onPopupClose,
}: PlanesMapProps) => {
  const [map, setMap] = useState<Map | null>(null);
  const planesFeaturesRef = useRef<PlaneFeature[]>([]);

  usePlanesLayer({
    map,
    planeIconUrl: PlanePng,
    onPlaneClick: onPlaneSelect,
  });

  useEffect(() => {
    const mapInstance = new Map({
      container: "planes-map", // container id
      style: "https://demotiles.maplibre.org/style.json", // style URL
      center: [0, 0], // starting position [lng, lat]
      zoom: 1, // starting zoom
      maplibreLogo: true,
    });

    mapInstance.once("load", () => {
      setMap(mapInstance);
    });

    return () => {
      mapInstance.remove();
    };
  }, []);

  useEffect(() => {
    if (!map) {
      return;
    }

    const updatePlanes = async () => {
      const planesSource = map.getSource<GeoJSONSource>("planes-source");
      if (!planesSource) {
        return;
      }

      const prevPlanes = planesFeaturesRef.current;

      const prevCoordinatesMap = prevPlanes.reduce<Record<string, number[]>>((acc, next) => {
        if (next.geometry.type === "Point") {
          acc[next.properties.planeId] = next.geometry.coordinates;
        }

        return acc;
      }, {});

      const planesFeatures: PlaneFeature[] = planes.map((plane) => {
        return {
          type: "Feature",
          properties: {
            planeId: plane.id,
            color: plane.color,
            altitude: plane.altitude,
            heading: prevCoordinatesMap[plane.id]
              ? getBearing(prevCoordinatesMap[plane.id], [plane.longitude, plane.latitude])
              : 0,
          },
          geometry: {
            type: "Point",
            coordinates: [plane.longitude, plane.latitude],
          },
        };
      });
      planesFeaturesRef.current = planesFeatures;

      planesSource.setData({
        type: "FeatureCollection",
        features: planesFeatures,
      });
    };

    updatePlanes();
  }, [planes, map]);

  const selectedPlane = planes.find((plane) => plane.id === selectedPlaneId);

  return (
    <>
      <div id="planes-map" className="h-full" />
      <MapPopup
        map={map}
        className="planes-map__popup"
        isOpen={selectedPlaneId !== null}
        popupContent={selectedPlaneContent}
        position={selectedPlane ? [selectedPlane.longitude, selectedPlane.latitude] : null}
        onClosed={onPopupClose}
      />
    </>
  );
};
