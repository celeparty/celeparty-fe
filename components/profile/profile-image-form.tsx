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
  const handleResult = (e: string | File) => {
    setSelectedFile(e);
  };

  const handleFileDelete = () => {
    setSelectedFile("");
  };

  const submitFile = async () => {
    try {
      const response = await axiosUser(
        "POST",
        `/api/upload`,
        `${session && session?.jwt}`,
        selectedFile
      );

      if (response) {
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
