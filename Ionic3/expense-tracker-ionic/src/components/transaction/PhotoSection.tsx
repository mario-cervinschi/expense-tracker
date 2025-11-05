import {
    IonButton,
    IonIcon,
    IonImg,
    IonActionSheet,
    IonLoading,
    IonLabel,
    useIonToast,
  } from "@ionic/react";
  import { camera, close, download, image } from "ionicons/icons";
  import { useState } from "react";
  import { MyPhoto, usePhotos } from "../../hooks/usePhotos";
  
  interface PhotoSectionProps {
    photo: MyPhoto | null;
    onPhotoChange: (photo: MyPhoto | null) => void;
    onPhotoRemove: (photo: MyPhoto) => void;
    onCompressionChange: (isCompressing: boolean) => void;
    isSaving: boolean;
  }
  
  const PhotoSection: React.FC<PhotoSectionProps> = ({
    photo,
    onPhotoChange,
    onCompressionChange,
    onPhotoRemove,
    isSaving,
  }) => {
    const [isCompressing, setIsCompressing] = useState(false);
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);
    const [showPhotoOverlay, setShowPhotoOverlay] = useState(false);

    const { compressImage, downloadPhoto, takePhotoTemp, pickPhotoTemp } = usePhotos();
  
    const handleDownloadPhoto = async (e: React.MouseEvent) => {
      e.stopPropagation();
  
      if (!photo || !photo.webviewPath) {
        console.error("Failed. No photo to download.");
        return;
      }
  
      await downloadPhoto(photo);
    };

    const handleTakePhoto = async () => {
      setIsCompressing(true);
      onCompressionChange(true);
      try {
        const newPhoto = await takePhotoTemp();
        onPhotoChange(newPhoto);
      } finally {
        setIsCompressing(false);
        onCompressionChange(false);
      }
    };
  
    const handlePickPhoto = async () => {
      setIsCompressing(true);
      onCompressionChange(true);
      try {
        const newPhoto = await pickPhotoTemp();
        onPhotoChange(newPhoto);
      } finally {
        setIsCompressing(false);
        onCompressionChange(false);
      }
    };
  
    const handlePhotoOptionSelect = async (option: string) => {
      setShowPhotoOptions(false);
      if (option === "camera") {
        await handleTakePhoto();
      } else if (option === "gallery") {
        await handlePickPhoto();
      }
    };
  
    const handleRemovePhoto = async () => {
      if (photo) {
        // await deletePhoto(photo);
        onPhotoRemove(photo);
        onPhotoChange(null);
      }
      setShowPhotoOverlay(false);
    };
  
    return (
      <>
        {!photo && (
          <IonButton
            onClick={() => setShowPhotoOptions(true)}
            color="light"
            expand="block"
            className="ion-margin-top"
            disabled={isCompressing || isSaving}
          >
            <IonIcon icon={camera} slot="start" />
            Add Receipt Photo
          </IonButton>
        )}
  
        {photo && (
          <div className="ion-margin-top" style={{ position: "relative" }}>
            <IonLabel className="ion-text-center">
              <p>Receipt Photo</p>
            </IonLabel>
  
            <div
              style={{
                position: "relative",
                display: "inline-block",
                width: "100%",
              }}
              onMouseEnter={() => setShowPhotoOverlay(true)}
              onMouseLeave={() => setShowPhotoOverlay(false)}
              onClick={() => setShowPhotoOverlay(!showPhotoOverlay)}
            >
              <IonImg
                src={photo.webviewPath}
                alt="Receipt"
                style={{
                  border: "1px solid var(--ion-color-medium)",
                  display: "block",
                  width: "100%",
                }}
              />
  
              {showPhotoOverlay && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "16px",
                    cursor: "pointer",
                  }}
                >
                  <IonButton
                    fill="solid"
                    color="light"
                    onClick={handleDownloadPhoto}
                  >
                    <IonIcon icon={download} slot="icon-only" />
                  </IonButton>
  
                  <IonButton
                    fill="solid"
                    color="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePhoto();
                    }}
                  >
                    <IonIcon icon={close} slot="icon-only" />
                  </IonButton>
                </div>
              )}
            </div>
  
            <IonButton
              onClick={() => setShowPhotoOptions(true)}
              color="light"
              expand="block"
              className="ion-margin-top"
              disabled={isCompressing || isSaving}
            >
              <IonIcon icon={camera} slot="start" />
              Change Photo
            </IonButton>
          </div>
        )}
  
        <IonLoading
          isOpen={isCompressing}
          message={"Compressing image..."}
          spinner="circles"
        ></IonLoading>
  
        <IonActionSheet
          isOpen={showPhotoOptions}
          onDidDismiss={() => setShowPhotoOptions(false)}
          header="Add Receipt Photo"
          buttons={[
            {
              text: "Take Photo",
              icon: camera,
              handler: () => handlePhotoOptionSelect("camera"),
            },
            {
              text: "Choose from Gallery",
              icon: image,
              handler: () => handlePhotoOptionSelect("gallery"),
            },
            {
              text: "Cancel",
              role: "cancel",
            },
          ]}
        />
      </>
    );
  };
  
  export default PhotoSection;
  
  export const compressModalPhoto = async (
    photo: MyPhoto | null,
    compressImage: (
      base64Data: string,
      quality?: number | undefined
    ) => Promise<string>
  ): Promise<MyPhoto | null> => {
    if (photo && photo.webviewPath) {
      const base64Data = photo.webviewPath?.split(",")[1];
      if (base64Data) {
        const compressedBase64 = await compressImage(base64Data, 800);
        return {
          filepath: photo.filepath,
          webviewPath: `data:image/jpeg;base64,${compressedBase64}`,
        };
      }
    }
    return null;
  };
  
  