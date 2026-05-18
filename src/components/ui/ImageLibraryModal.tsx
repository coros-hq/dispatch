import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2Icon, ImagesIcon } from "lucide-react";
import {
  fetchUserImages,
  deleteImage,
  type UploadedImage,
} from "@/lib/imageService";

type Props = {
  onSelect: (url: string) => void;
};

function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Something went wrong";
}

export function ImageLibraryModal({ onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchUserImages()
      .then(setImages)
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [open]);

  const handleDelete = async (image: UploadedImage, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteImage(image.path);
      setImages((imgs) => imgs.filter((i) => i.path !== image.path));
      toast.success("Image deleted");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-[10px] text-muted-foreground hover:text-foreground underline cursor-pointer"
        >
          Browse library
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Image library</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin" />
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12">
            <ImagesIcon className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              No images uploaded yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
            {images.map((image) => (
              <div
                key={image.path}
                role="button"
                tabIndex={0}
                onClick={() => {
                  onSelect(image.url);
                  setOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(image.url);
                    setOpen(false);
                  }
                }}
                className="group relative rounded-lg overflow-hidden border border-border cursor-pointer hover:border-primary transition-colors aspect-video outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <img
                  src={image.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button size="sm" variant="secondary" className="text-xs">
                    Use image
                  </Button>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDelete(image, e)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2Icon className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
