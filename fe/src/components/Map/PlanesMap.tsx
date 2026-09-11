import "maplibre-gl/dist/maplibre-gl.css";
import "./PlanesMap.css";
import { useEffect, useState } from "react";
import type { PlaneBasic } from "../../types";
import { MapPopup } from "./MapPopup/MapPopup";
import PlanePng from "../../assets/plane-1.png";
import { usePlanesLayer } from "./hooks/usePlanesLayer";
import { useMap } from "./hooks/useMap";
import { toPlaneFeatureCollection } from "./utils/toPlaneFeatureCollection";

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
  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);
  const map = useMap({ container: mapContainer });

  const { setPlanesData } = usePlanesLayer({
    map,
    planeIconUrl: PlanePng,
    onPlaneClick: onPlaneSelect,
  });

  useEffect(() => {
    setPlanesData(toPlaneFeatureCollection(planes));
  }, [planes, setPlanesData]);

  const selectedPlane = planes.find((plane) => plane.id === selectedPlaneId);

  return (
    <>
      <div ref={setMapContainer} className="h-full" />
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
