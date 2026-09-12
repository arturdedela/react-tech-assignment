import { useState } from "react";
import { PlanesMap } from "./components/Map/PlanesMap";
import { StatusPanel } from "./components/StatusPanel/StatusPanel";
import { DetailsPopup } from "./components/DetailsPopup/DetailsPopup";
import { usePlanes } from "./hooks/usePlanes";
import { usePlaneDetails } from "./hooks/usePlaneDetails";
import { PlanesListPanel } from "./components/PlanesListPanel/PlanesListPanel";
import { Sidebar } from "./components/Sidebar/Sidebar";

function App() {
  const [selectedPlaneId, setSelectedPlaneId] = useState<string | null>(null);

  const planesSource = usePlanes();
  const planeDetailsSource = usePlaneDetails({ planeId: selectedPlaneId });

  const handlePlaneSelect = (planeId: string) => {
    setSelectedPlaneId(planeId);
  };

  const selectedPlane =
    selectedPlaneId === planeDetailsSource.planeDetails?.id
      ? planeDetailsSource.planeDetails
      : null;

  return (
    <>
      <PlanesMap
        planes={planesSource.planes}
        selectedPlane={selectedPlane}
        onPlaneSelect={handlePlaneSelect}
        selectedPlaneContent={
          planeDetailsSource.planeDetails ? (
            <DetailsPopup planeDetails={planeDetailsSource.planeDetails} />
          ) : null
        }
        onPopupClose={() => setSelectedPlaneId(null)}
      />
      <Sidebar>
        <StatusPanel
          connections={[
            { label: "Aircraft Locations", status: planesSource.status },

            {
              label: `Aircraft Details ${selectedPlaneId ? ` "${selectedPlaneId}"` : ""}`,
              status: planeDetailsSource.status,
            },
          ]}
        />
        <PlanesListPanel
          planes={planesSource.planes}
          selectedPlaneId={selectedPlaneId}
          onPlaneSelect={handlePlaneSelect}
        />
      </Sidebar>
    </>
  );
}

export default App;
