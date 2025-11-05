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
import { usePreferences } from "../../hooks/usePreferences";

interface EditTransactionModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onDidDismiss: () => void;
  onSave: (transaction: Transaction, photoToDelete?: MyPhoto) => void;
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
  const [originalPhoto, setOriginalPhoto] = useState<MyPhoto | null>(null);
  const [tempPhoto, setTempPhoto] = useState<MyPhoto | null>(null);
  const [deleteOriginalPhoto, setDeleteOriginalPhoto] =
    useState<boolean>(false);
  const [modalPhoto, setModalPhoto] = useState<MyPhoto | null>(null);
  const { get } = usePreferences();

  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const { compressImage, savePhotoToStorage, deletePhoto } = usePhotos();
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

        if (transaction) {
          setEditableTransaction(transaction);

          if (transaction.photoFilepath) {
            // TypeScript știe aici că photoFilepath este 'string'
            const currentFilepath = transaction.photoFilepath;

            get("photos").then((savedPhotoss) => {
              if (savedPhotoss) {
                const savedPhotos = (
                  savedPhotoss ? JSON.parse(savedPhotoss) : []
                ) as MyPhoto[];

                let found = false;

                for (let photo of savedPhotos) {
                  if (photo.filepath === currentFilepath) {
                    const initialPhoto = photo;
                    setModalPhoto(initialPhoto);
                    setOriginalPhoto(initialPhoto);
                    console.log("New photo is ", initialPhoto);
                    found = true;
                    break;
                  }
                }

                if (!found) {
                  setModalPhoto(null);
                  setOriginalPhoto(null);
                }
              } else {
                setModalPhoto(null);
                setOriginalPhoto(null);
              }
            });
          } else {
            setModalPhoto(null);
            setOriginalPhoto(null);
          }
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
        setOriginalPhoto(null);
        setSelectedLocation(null);
      }
      setDeleteOriginalPhoto(false);
      setTempPhoto(null);
    }
  }, [isOpen, transaction]);

  const handleCancel = async () => {
    if (tempPhoto) {
      try {
        // ...șterge-o.
        await deletePhoto(tempPhoto);
      } catch (error) {
        console.error("Error deleting temporary photo:", error);
      }
    }
    onDidDismiss();
  };

  const handleInputChange = (e: any) => {
    if (!editableTransaction) return;

    const { name, value, checked, type } = e.target;
    let finalValue: any;

    if (name === "sum") {
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
    console.log("called hsc");
    if (editableTransaction) {
      const transactionToSave: Transaction = {
        ...editableTransaction,
      };

      const photoToActuallyDelete =
        deleteOriginalPhoto && originalPhoto ? originalPhoto : undefined;

      if (modalPhoto && modalPhoto.webviewPath) {
        setIsCompressing(true);
        const compressedPhoto = await compressModalPhoto(
          modalPhoto,
          compressImage
        );

        console.log(compressedPhoto);

        setIsCompressing(false);

        if (compressedPhoto) {
          const isNewPhoto =
            !originalPhoto ||
            compressedPhoto.filepath !== originalPhoto.filepath;

          if (isNewPhoto) {
            console.log("called spts");
            await savePhotoToStorage(compressedPhoto);
          }

          transactionToSave.photoFilepath = compressedPhoto.filepath;
        }
      } else {
        transactionToSave.photoFilepath = undefined;
      }

      onSave(transactionToSave, photoToActuallyDelete);
    }
  };

  // Handler când se apasă "Remove" pe poza curentă
  const handlePhotoRemove = (removedPhoto: MyPhoto) => {
    if (originalPhoto && removedPhoto.filepath === originalPhoto.filepath) {
      // Dacă se șterge poza ORIGINALĂ, marcheaz-o pentru ștergere
      setDeleteOriginalPhoto(true);
    }

    if (tempPhoto && removedPhoto.filepath === tempPhoto.filepath) {
      // Dacă se șterge poza TEMPORARĂ, șterge-o acum
      // și resetează starea temp
      deletePhoto(tempPhoto).catch((err) =>
        console.error("Failed to delete temp photo", err)
      );
      setTempPhoto(null);
    }

    // Golește UI-ul
    setModalPhoto(null);
  };

  const handleDateChange = (e: any) => {
    if (!editableTransaction) return;
  
    // Valoarea de la IonDatetime vine în e.detail.value
    const newDateValue = e.detail.value; 
  
    if (newDateValue) {
      setEditableTransaction({
        ...editableTransaction,
        date: new Date(newDateValue), // Actualizează data cu noua valoare
      });
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
            <IonButton onClick={handleCancel}>Cancel</IonButton>
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
                onIonChange={handleDateChange} // <-- AICI ESTE MODIFICAREA
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
              onPhotoRemove={handlePhotoRemove}
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
