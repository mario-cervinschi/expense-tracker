import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonDatetime,
  IonToggle,
  IonLoading,
  IonAlert,
  createAnimation,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { Transaction } from "../../models/transaction";
import { MyPhoto, usePhotos } from "../../hooks/usePhotos";
import { useMyLocation } from "../../hooks/useMyLocation";
import PhotoSection, { compressModalPhoto } from "./PhotoSection";
import LocationSection from "./LocationSection";

interface EditTransactionModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onDidDismiss: () => void;
  onSave: (transaction: Transaction) => void;
  isSaving: boolean;
  isSaveError: string | null;
  onDidDismissError: () => void;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  isOpen,
  transaction,
  onDidDismiss,
  onSave,
  isSaving,
  isSaveError,
  onDidDismissError,
}) => {
  const [editableTransaction, setEditableTransaction] =
    useState<Transaction | null>(null);

  const [isCompressing, setIsCompressing] = useState(false);
  const [modalPhoto, setModalPhoto] = useState<MyPhoto | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const { compressImage } = usePhotos();
  const myLocation = useMyLocation();

  const enterAnimation = (baseEl: any) => {
    const root = baseEl.shadowRoot;
    const backdropAnimation = createAnimation()
      .addElement(root.querySelector("ion-backdrop")!)
      .fromTo("opacity", "0.01", "var(--backdrop-opacity)");

    const wrapperAnimation = createAnimation()
      .addElement(root.querySelector(".modal-wrapper")!)
      .keyframes([
        { offset: 0, opacity: "0", transform: "scale(0)" },
        { offset: 1, opacity: "0.99", transform: "scale(1)" },
      ]);

    return createAnimation()
      .addElement(baseEl)
      .easing("ease-out")
      .duration(500)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };

  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        setEditableTransaction(transaction);

        if (transaction.photoFilepath && transaction.photoWebviewPath) {
          setModalPhoto({
            filepath: transaction.photoFilepath,
            webviewPath: transaction.photoWebviewPath,
          });
        } else {
          setModalPhoto(null);
        }

        if (transaction.latitude && transaction.longitude) {
          setSelectedLocation({
            lat: transaction.latitude,
            lng: transaction.longitude,
          });
        } else {
          setSelectedLocation(null);
        }
      } else {
        setEditableTransaction({
          _id: null,
          title: "",
          date: new Date(),
          sum: 0,
          income: false,
        });
        setModalPhoto(null);
        setSelectedLocation(null);
      }
    }
  }, [isOpen, transaction]);

  const handleInputChange = (e: any) => {
    if (!editableTransaction) return;

    const { name, value, checked, type } = e.target;
    let finalValue: any;

    if (name === "date") {
      finalValue = new Date(e.detail.value);
    } else if (name === "sum") {
      finalValue = parseFloat(value) || 0;
    } else if (name === "income" || type === "checkbox") {
      finalValue = checked;
    } else {
      finalValue = value;
    }

    setEditableTransaction({
      ...editableTransaction,
      [name]: finalValue,
    });
  };

  const handleLocationChange = (
    newLocation: { lat: number; lng: number } | null
  ) => {
    setSelectedLocation(newLocation);
    if (editableTransaction) {
      setEditableTransaction({
        ...editableTransaction,
        latitude: newLocation?.lat,
        longitude: newLocation?.lng,
      });
    }
  };

  const handleSaveClick = async () => {
    if (editableTransaction) {
      const transactionToSave: Transaction = {
        ...editableTransaction,
      };

      if (modalPhoto && modalPhoto.webviewPath) {
        setIsCompressing(true);
        const compressedPhoto = await compressModalPhoto(
          modalPhoto,
          compressImage
        );
        setIsCompressing(false);

        if (compressedPhoto) {
          transactionToSave.photoFilepath = compressedPhoto.filepath;
          transactionToSave.photoWebviewPath = compressedPhoto.webviewPath;
        }
      } else {
        transactionToSave.photoFilepath = undefined;
        transactionToSave.photoWebviewPath = undefined;
      }

      onSave(transactionToSave);
    }
  };

  return (
    <IonModal
      isOpen={isOpen}
      enterAnimation={enterAnimation}
      onDidDismiss={onDidDismiss}
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle>Modify Transaction</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onDidDismiss}>Cancel</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {editableTransaction && (
          <>
            <IonItem>
              <IonLabel position="stacked">Title</IonLabel>
              <IonInput
                name="title"
                value={editableTransaction.title}
                onIonChange={handleInputChange}
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Date</IonLabel>
              <IonDatetime
                name="date"
                value={editableTransaction.date.toISOString()}
                presentation="date"
                onIonChange={handleInputChange}
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Sum</IonLabel>
              <IonInput
                name="sum"
                type="number"
                value={editableTransaction.sum}
                onIonChange={handleInputChange}
              />
            </IonItem>
            <IonItem>
              <IonLabel>Income</IonLabel>
              <IonToggle
                name="income"
                checked={editableTransaction.income}
                onIonChange={handleInputChange}
              />
            </IonItem>

            <PhotoSection
              photo={modalPhoto}
              onPhotoChange={setModalPhoto}
              onCompressionChange={setIsCompressing}
              isSaving={isSaving}
            />

            <LocationSection
              location={selectedLocation}
              onLocationChange={handleLocationChange}
              myLocation={myLocation}
            />

            <IonButton
              expand="block"
              onClick={handleSaveClick}
              className="ion-margin-top"
              disabled={isCompressing || isSaving}
            >
              Save Changes
            </IonButton>
          </>
        )}

        <IonLoading
          isOpen={isSaving || isCompressing}
          message={isCompressing ? "Compressing image..." : "Saving..."}
          spinner="circles"
        ></IonLoading>

        <IonAlert
          isOpen={!!isSaveError}
          header={"Error"}
          message={isSaveError || ""}
          buttons={["OK"]}
          onDidDismiss={onDidDismissError}
        ></IonAlert>
      </IonContent>
    </IonModal>
  );
};

export default EditTransactionModal;