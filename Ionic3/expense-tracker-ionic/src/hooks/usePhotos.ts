import { useEffect, useState } from "react";
import { useCamera } from "./useCamera";
import { useFilesystem } from "./useFilesystem";
import { usePreferences } from "./usePreferences";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

export interface MyPhoto {
    filepath: string;
    webviewPath?: string;
}

const PHOTOS_KEY = 'photos';

export const usePhotos = () => {
    const [ photos, setPhotos ] = useState<MyPhoto[]>([]);
    const { getPhoto } = useCamera();
    const { readFile, writeFile, deleteFile } = useFilesystem();
    const { get, set } = usePreferences();
    
    const loadPhotos = () => {
        const loadSavedPhotos = async () => {
            const savedPhotoString = await get(PHOTOS_KEY);
            const savedPhotos = (savedPhotoString ? JSON.parse(savedPhotoString) : []) as MyPhoto[];
            console.log('load', savedPhotos);

            for(let photo of savedPhotos){
                const data = await readFile(photo.filepath);
                photo.webviewPath = `data:image/jpeg;base64,${data}`;
            }
            setPhotos(savedPhotos);
        }

        loadSavedPhotos();
    }

    useEffect(loadPhotos, [get, readFile, setPhotos]);

    const takePhoto = async (): Promise<MyPhoto> => {
        const data = await getPhoto();
        const filePath = new Date().getTime() + '.jpeg';
        await writeFile(filePath, data.base64String!);
        const webviewPath = `data:image/jpeg;base64,${data.base64String}`;
        const newPhoto = { filepath: filePath, webviewPath };
        const newPhotos = [ newPhoto, ...photos ];
        await set(PHOTOS_KEY, JSON.stringify(newPhotos.map(p => ({filepath: p.filepath}))));
        setPhotos(newPhotos);

        return newPhoto;
    }

    const deletePhoto = async (photo: MyPhoto) => {
        const newPhotos = photos.filter(p => p.filepath !== photo.filepath);
        await set(PHOTOS_KEY, JSON.stringify(newPhotos));
        await deleteFile(photo.filepath);
        setPhotos(newPhotos);
    }

    const pickPhoto = async (): Promise<MyPhoto> => {
        const photo = await Camera.getPhoto({
            resultType: CameraResultType.Base64,
            source: CameraSource.Photos, 
            quality: 90,
        });

        const filePath = new Date().getTime() + '.jpeg';
        await writeFile(filePath, photo.base64String!);
        const webviewPath = `data:image/jpeg;base64,${photo.base64String}`;
        const newPhoto = { filepath: filePath, webviewPath };
        const newPhotos = [ newPhoto, ...photos ];
        await set(PHOTOS_KEY, JSON.stringify(newPhotos.map(p => ({filepath: p.filepath}))));
        setPhotos(newPhotos);

        return newPhoto;
    }

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

    return {
        photos,
        takePhoto,
        deletePhoto,
        pickPhoto,
        compressImage,
    }

}