import { Popup, type LngLatLike, type Map } from "maplibre-gl";
import { useEffect, useEffectEvent, useState } from "react";
import { createPortal } from "react-dom";

type MapPopupProps = {
  className?: string;
  map: Map | null;
  position: LngLatLike | null;
  popupContent: React.ReactNode;
  // Called when popup is already closed
  onClosed: () => void;
};

export const MapPopup = ({ popupContent, map, position, className, onClosed }: MapPopupProps) => {
  const [popupContainer] = useState(() => document.createElement("div"));
  const [popup] = useState(() => new Popup({ maxWidth: "300px", className, anchor: "top" }));

  const notifyClosed = useEffectEvent(onClosed);
  const isOpen: boolean = !!position;

  // Controls when popup should be opened/closed
  useEffect(() => {
    if (!map) {
      return;
    }

    if (isOpen) {
      popup.setDOMContent(popupContainer).addTo(map);
      popup.on("close", notifyClosed);

      return () => {
        popup.off("close", notifyClosed);
        popup.remove();
      };
    }
  }, [popupContainer, popup, map, isOpen]);

  // Controls position of the popup
  useEffect(() => {
    if (!position) {
      return;
    }

    popup.setLngLat(position);
  }, [popup, position]);

  return createPortal(popupContent, popupContainer);
};
