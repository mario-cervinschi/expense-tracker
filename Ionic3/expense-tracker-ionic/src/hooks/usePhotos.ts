import { useEffect, useState } from "react";
import { useCamera } from "./useCamera";
import { useFilesystem } from "./useFilesystem";
import { usePreferences } from "./usePreferences";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { useIonToast } from "@ionic/react";
import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";

export interface MyPhoto {
  filepath: string;
  webviewPath?: string;
}

const PHOTOS_KEY = "photos";

export const usePhotos = () => {
  const [photos, setPhotos] = useState<MyPhoto[]>([]);
  const { getPhoto } = useCamera();
  const { readFile, writeFile, deleteFile } = useFilesystem();
  const { get, set } = usePreferences();

  const [present] = useIonToast();

  const loadSavedPhotos = async () => {
    const savedPhotoString = await get(PHOTOS_KEY);
    const savedPhotos = (
      savedPhotoString ? JSON.parse(savedPhotoString) : []
    ) as MyPhoto[];

    for (let photo of savedPhotos) {
      try {
        const data = await readFile(photo.filepath);
        photo.webviewPath = `data:image/jpeg;base64,${data}`;
      } catch (e) {
        console.warn(`Could not read file ${photo.filepath}`, e);
      }
    }
    setPhotos(savedPhotos);
  };

  useEffect(() => {
    loadSavedPhotos();
  }, []); 

  const takePhoto = async (): Promise<MyPhoto> => {
    const data = await getPhoto();
    const filePath = new Date().getTime() + ".jpeg";
    await writeFile(filePath, data.base64String!);
    const webviewPath = `data:image/jpeg;base64,${data.base64String}`;
    const newPhoto = { filepath: filePath, webviewPath };

    await savePhotoToStorage(newPhoto);

    return newPhoto;
  };

  const deletePhoto = async (photo: MyPhoto) => {
    const savedPhotoString = await get(PHOTOS_KEY);
    const savedPhotos = (
      savedPhotoString ? JSON.parse(savedPhotoString) : []
    ) as MyPhoto[];

    const newPhotos = savedPhotos.filter((p) => p.filepath !== photo.filepath);

    await set(
      PHOTOS_KEY,
      JSON.stringify(newPhotos) 
    );

    const photosWithWebview = [...newPhotos];
    for (let p of photosWithWebview) {
      if (!p.webviewPath) {
        try {
          const data = await readFile(p.filepath);
          p.webviewPath = `data:image/jpeg;base64,${data}`;
        } catch (e) {}
      }
    }
    setPhotos(photosWithWebview);

    try {
      await deleteFile(photo.filepath);
    } catch (e) {
      console.error("Could not delete file from filesystem", e);
    }
  };
  const pickPhoto = async (): Promise<MyPhoto> => {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
      quality: 90,
    });

    const filePath = new Date().getTime() + ".jpeg";
    await writeFile(filePath, photo.base64String!);
    const webviewPath = `data:image/jpeg;base64,${photo.base64String}`;
    const newPhoto = { filepath: filePath, webviewPath };

    await savePhotoToStorage(newPhoto);

    return newPhoto;
  };

  const compressImage = async (
    base64: string,
    maxWidth: number = 800
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        resolve(compressedBase64.split(",")[1]);
      };
      img.src = `data:image/jpeg;base64,${base64}`;
    });
  };

  const downloadPhoto = async (photo: MyPhoto): Promise<void> => {
    try {
      const platform = Capacitor.getPlatform();

      if (platform === "web") {
        const link = document.createElement("a");
        link.href = photo.webviewPath!;
        link.download = `receipt_${photo.filepath}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        present({
          message: "Photo downloaded successfully",
          duration: 2000,
          color: "success",
        });
      } else {
        const base64Data = photo.webviewPath?.split(",")[1];
        if (!base64Data) {
          throw new Error("No photo data available");
        }

        const fileName = `receipt_${new Date().getTime()}.jpeg`;

        await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Documents,
        });

        present({
          message: "Photo saved to Documents folder",
          duration: 2000,
          color: "success",
        });
      }
    } catch (error) {
      console.error("Error downloading photo:", error);
      present({
        message: "Failed to download photo",
        duration: 2000,
        color: "danger",
      });
    }
  };

  const takePhotoTemp = async (): Promise<MyPhoto> => {
    const data = await getPhoto();
    const filePath = new Date().getTime() + ".jpeg";
    await writeFile(filePath, data.base64String!);
    const webviewPath = `data:image/jpeg;base64,${data.base64String}`;
    const newPhoto = { filepath: filePath, webviewPath };

    return newPhoto;
  };

  const pickPhotoTemp = async (): Promise<MyPhoto> => {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
      quality: 90,
    });

    const filePath = new Date().getTime() + ".jpeg";
    await writeFile(filePath, photo.base64String!);
    const webviewPath = `data:image/jpeg;base64,${photo.base64String}`;
    const newPhoto = { filepath: filePath, webviewPath };

    return newPhoto;
  };

  const savePhotoToStorage = async (photo: MyPhoto) => {
    const savedPhotoString = await get(PHOTOS_KEY);
    const savedPhotos = (
      savedPhotoString ? JSON.parse(savedPhotoString) : []
    ) as MyPhoto[];

    const existingIndex = savedPhotos.findIndex(
      (p) => p.filepath === photo.filepath
    );
    let newPhotos: MyPhoto[];

    if (existingIndex > -1) {
      savedPhotos[existingIndex] = photo;
      newPhotos = [...savedPhotos];
    } else {
      newPhotos = [photo, ...savedPhotos];
    }

    await set(
      PHOTOS_KEY,
      JSON.stringify(newPhotos) 
    );

    setPhotos(newPhotos);
  };

  return {
    photos,
    takePhoto,
    deletePhoto,
    pickPhoto,
    compressImage,
    downloadPhoto,
    takePhotoTemp,
    pickPhotoTemp,
    savePhotoToStorage,
  };
};
