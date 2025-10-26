import React, { useState, useEffect } from "react";
import { IonButton, IonIcon, IonItem, IonLabel } from "@ionic/react";
import { close, locationOutline } from "ionicons/icons";
import MyMap from "./MyMap";

interface LocationSectionProps {
  location: { lat: number; lng: number } | null;
  onLocationChange: (location: { lat: number; lng: number } | null) => void;
  myLocation: any;
}

const LocationSection: React.FC<LocationSectionProps> = ({
  location,
  onLocationChange,
  myLocation,
}) => {
  const [showMap, setShowMap] = useState(false);
  const [pendingLocation, setPendingLocation] = useState(location);

  useEffect(() => {
    if (showMap) {
      setPendingLocation(location);
    }
  }, [showMap, location]);

  const handleMapClick = (e: { latitude: number; longitude: number }) => {
    setPendingLocation({
      lat: e.latitude,
      lng: e.longitude,
    });
  };

  const handleConfirmLocation = () => {
    onLocationChange(pendingLocation);
    setShowMap(false);
  };

  const handleRemoveLocation = () => {
    onLocationChange(null);
  };

  const getMapMarkers = () => {
    const markers = [];
    if (pendingLocation) {
      markers.push({
        lat: pendingLocation.lat,
        lng: pendingLocation.lng,
        title: "Selected Location",
      });
    }
    return markers;
  };

  const getMapCenter = () => {
    const { latitude: lat, longitude: lng } = myLocation.position?.coords || {};
    if (pendingLocation) {
      return pendingLocation;
    }
    if (location) {
      return location;
    }
    if (lat && lng) {
      return { lat, lng };
    }
    return { lat: 46.7712, lng: 23.6236 };
  };

  const mapCenter = getMapCenter();

  return (
    <div className="ion-margin-top">
      <IonLabel>
        <h2>Transaction Location</h2>
      </IonLabel>

      {!location && (
        <IonButton
          onClick={() => setShowMap(true)}
          color="light"
          expand="block"
          className="ion-margin-top"
        >
          <IonIcon icon={locationOutline} slot="start" />
          Select Location on Map
        </IonButton>
      )}

      {location && (
        <div className="ion-margin-top">
          <IonItem>
            <IonLabel>
              <p>
                <strong>Location:</strong>
              </p>
              <p>
                Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
              </p>
            </IonLabel>
          </IonItem>

          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "8px",
            }}
          >
            <IonButton
              onClick={() => setShowMap(true)}
              color="light"
              expand="block"
              style={{ flex: 1 }}
            >
              <IonIcon icon={locationOutline} slot="start" />
              Change Location
            </IonButton>
            <IonButton
              onClick={handleRemoveLocation}
              color="danger"
              fill="outline"
            >
              <IonIcon icon={close} slot="icon-only" />
            </IonButton>
          </div>
        </div>
      )}

      {showMap && (
        <div className="ion-margin-top">
          <IonLabel>
            <p className="ion-margin-bottom">
              Click on the map to select a location
            </p>
          </IonLabel>

          <MyMap
            lat={mapCenter.lat}
            lng={mapCenter.lng}
            markers={getMapMarkers()}
            editable={true}
            onMapClick={handleMapClick}
          />

          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "8px",
            }}
          >
            <IonButton
              onClick={handleConfirmLocation}
              color="success"
              expand="block"
              style={{ flex: 1 }}
              disabled={!pendingLocation}
            >
              Confirm Location
            </IonButton>
            <IonButton
              onClick={() => setShowMap(false)}
              color="medium"
              fill="outline"
            >
              Cancel
            </IonButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSection;

