import "maplibre-gl/dist/maplibre-gl.css";
import "./PlanesMap.css";
import { useState } from "react";
import type { PlaneBasic, PlaneDetailed } from "../../types";
import { MapPopup } from "./MapPopup/MapPopup";
import PlanePng from "../../assets/plane-1.png";
import { usePlanesLayer } from "./hooks/usePlanesLayer";
import { useMap } from "./hooks/useMap";
import { useSelectedPlaneFocus } from "./hooks/useSelectedPlaneFocus";
import { usePlane3dLayer } from "./hooks/usePlane3DLayer";

interface PlanesMapProps {
  planes: PlaneBasic[];
  selectedPlane: PlaneDetailed | null;
  onPlaneSelect: (planeId: string) => void;
  onPopupClose: () => void;
  selectedPlaneContent: React.ReactNode | null;
}

export const PlanesMap = ({
  planes,
  selectedPlane,
  onPlaneSelect,
  selectedPlaneContent,
  onPopupClose,
}: PlanesMapProps) => {
  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);
  const map = useMap({ container: mapContainer });

  usePlanesLayer({
    map,
    planeIconUrl: PlanePng,
    onPlaneClick: onPlaneSelect,
    planes,
    // Hide plane icon, in favor of 3d plane
    hiddenPlaneId: selectedPlane?.id ?? null,
  });

  usePlane3dLayer({ map, plane: selectedPlane });

  useSelectedPlaneFocus({ map, selectedPlane });

  return (
    <>
      <div ref={setMapContainer} className="h-full" />
      <MapPopup
        map={map}
        className="planes-map__popup"
        popupContent={selectedPlaneContent}
        position={selectedPlane ? [selectedPlane.longitude, selectedPlane.latitude] : null}
        onClosed={onPopupClose}
      />
    </>
  );
};
