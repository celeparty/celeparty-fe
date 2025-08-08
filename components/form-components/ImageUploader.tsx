import { useToast } from "@/hooks/use-toast";
import { eAlertType } from "@/lib/enums/eAlert";

interface FileUploaderProps {
  selectedFile: string | File;
  imageUrl: string | File | null;
  handleResult: (file: File) => void;
  handleFileDelete: () => void;
  handleSubmitFile: () => void;
}

export const MaxImageSize = 10485760;

export const ImageUploader: React.FC<FileUploaderProps> = ({
  selectedFile,
  imageUrl,
  handleResult,
  handleFileDelete,
  handleSubmitFile,
}) => {
  const { toast } = useToast();
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    if (file.size > MaxImageSize) {
      toast({
        description: "Maximum file size is 10Mb",
        className: eAlertType.FAILED,
      });
      return;
    }
    handleResult(file);
  };
  return (
    <>
      {selectedFile ? (
        <div className="w-full h-[300px] flex items-center justify-center mb-4">
          <img
            src={
              selectedFile instanceof File
                ? URL.createObjectURL(selectedFile)
                : selectedFile
            }
            alt="Selected"
            className="w-32 h-32 object-cover rounded-md"
          />
        </div>
      ) : imageUrl ? (
        <div className="w-full h-[300px] mb-4 flex justify-center items-center rounded-lg">
          <img
            src={
              typeof imageUrl === "string"
                ? process.env.BASE_API + imageUrl
                : ""
            }
            alt="Existing"
            className="w-32 h-32 object-cover rounded-md"
          />
        </div>
      ) : (
        <div className="w-full h-[300px] mb-4 bg-black rounded-lg"></div>
      )}
      <div className="m-auto mb-2">
        {(!selectedFile || imageUrl) && (
          <>
            <input
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
              accept=".jpg,.jpeg,.png"
            />
            <label
              htmlFor="file-input"
              className="border-solid border border-black w-full py-2 rounded-lg mb-2 block text-center cursor-pointer"
            >
              Pilih Foto
            </label>
          </>
        )}
        {selectedFile && (
          <>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleFileDelete}
                className="border-solid border border-c-red w-full py-2 rounded-lg block mx-auto text-center cursor-pointer"
              >
                Delete File
              </button>
              <button
                type="button"
                onClick={handleSubmitFile}
                className="border-solid border bg-black border-black text-white w-full py-2 rounded-lg block mx-auto text-center cursor-pointer"
              >
                Simpan Foto
              </button>
            </div>
          </>
        )}
      </div>

      <p className="font-hind font-normal text-[11px] text-center leading-[20px]">
        Besar file: maksimum 10.000.000 bytes (10 Megabytes). <br /> Ekstensi
        file yang diperbolehkan: .JPG .JPEG .PNG
      </p>
    </>
  );
};
