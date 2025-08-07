import { useToast } from "@/hooks/use-toast";
import { eAlertType } from "@/lib/enums/eAlert";
import { axiosUser } from "@/lib/services";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { ImageUploader } from "../form-components/ImageUploader";

export const ProfileImageForm = () => {
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<string | File>("");
  const handleResult = (e: File) => {
    setSelectedFile(e);
  };

  const handleFileDelete = () => {
    setSelectedFile("");
  };

  const submitFile = async () => {
    try {
      const formData = new FormData();
      formData.append("files", selectedFile);
      const response = await axiosUser(
        "POST",
        `/api/upload`,
        `${session && session?.jwt}`,
        formData
      );

      if (response) {
        if (response[0].id) {
          const imageData = {
            image: response[0].id.toString(),
          };
          return await updateProfileImage(imageData);
        }
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Gagal",
        description: "Update foto profile gagal!",
        className: eAlertType.FAILED,
      });
    }
  };

  const updateProfileImage = async (imageData: { image: string }) => {
    try {
      const uploadImageRes = await axiosUser(
        "PUT",
        `/api/users/${session?.user.id}`,
        `${session && session?.jwt}`,
        imageData
      );
      if (uploadImageRes) {
        toast({
          title: "Sukses",
          description: "Update foto profile berhasil!",
          className: eAlertType.SUCCESS,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Gagal",
        description: "Update foto profile gagal!",
        className: eAlertType.FAILED,
      });
    }
  };
  return (
    <>
      <div className="w-[300px] mx-auto lg:mx-0">
        <ImageUploader
          handleResult={(e) => handleResult(e)}
          imageUrl={imageUrl}
          handleFileDelete={handleFileDelete}
          selectedFile={selectedFile}
          handleSubmitFile={submitFile}
        />
      </div>
    </>
  );
};
