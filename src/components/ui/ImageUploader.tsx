import { useCallback, useEffect, useRef, useState } from "react";
import { UploadIcon, LinkIcon, XIcon, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { fetchUserImages, uploadImage } from "@/lib/imageService";
import { PLAN_LIMITS } from "@/lib/planLimits";
import { usePlanStore } from "@/store/plan";
import { UpgradeModal } from "./UpgradeModal";
import { Input } from "./input";
import { Button } from "./button";
import { ImageLibraryModal } from "./ImageLibraryModal";

type Props = {
  value: string;
  onChange: (url: string) => void;
};

function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Something went wrong";
}

export function ImageUploader({ value, onChange }: Props) {
  const plan = usePlanStore((s) => s.plan);
  const limits = PLAN_LIMITS[plan];
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [urlValue, setUrlValue] = useState(value);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [imageCount, setImageCount] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* eslint-disable react-hooks/set-state-in-effect -- sync local URL/preview when bound `value` changes */
  useEffect(() => {
    setUrlValue(value);
    setPreview(value || null);
  }, [value]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (plan !== "free") return;
    fetchUserImages()
      .then((imgs) => setImageCount(imgs.length))
      .catch(() => setImageCount(null));
  }, [plan]);

  const atImageLimit =
    plan === "free" &&
    imageCount !== null &&
    imageCount >= limits.maxImageUploads;

  const handleFile = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const uploaded = await uploadImage(file, plan);
        onChange(uploaded.url);
        setPreview(uploaded.url);
        if (plan === "free") {
          const imgs = await fetchUserImages();
          setImageCount(imgs.length);
        }
        toast.success("Image uploaded");
      } catch (err) {
        const msg = errorMessage(err);
        toast.error(msg);
        if (msg.toLowerCase().includes("upgrade")) setUpgradeOpen(true);
      } finally {
        setUploading(false);
      }
    },
    [plan, onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) void handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = "";
  };

  const handleUrlApply = () => {
    onChange(urlValue);
    setPreview(urlValue);
  };

  const handleClear = () => {
    onChange("");
    setPreview(null);
    setUrlValue("");
  };

  const openFilePicker = () => {
    if (atImageLimit) {
      setUpgradeOpen(true);
      return;
    }
    inputRef.current?.click();
  };

  return (
    <>
      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature="Image upload"
      />

      <div className="flex flex-col gap-2">
        {preview ? (
          <div className="relative group rounded-lg overflow-hidden border border-border">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-32 object-cover"
              onError={() => setPreview(null)}
            />
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <XIcon className="w-3 h-3 text-white" />
            </button>
          </div>
        ) : null}

        <div className="flex items-center gap-1 p-0.5 bg-muted rounded-lg">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs transition-colors ${
              mode === "upload"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UploadIcon className="w-3 h-3" />
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs transition-colors ${
              mode === "url"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            URL
          </button>
        </div>

        {mode === "upload" ? (
          <>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={openFilePicker}
              className={`relative flex flex-col items-center justify-center gap-2 min-h-24 py-2 rounded-lg border-2 border-dashed cursor-pointer transition-all ${
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-border hover:border-primary/50 hover:bg-accent/50"
              }`}
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin" />
                  <p className="text-xs text-muted-foreground">
                    Uploading...
                  </p>
                </>
              ) : (
                <>
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground text-center px-4">
                    {isDragging
                      ? "Drop to upload"
                      : "Drop image here or click to browse"}
                  </p>
                  <p className="text-[10px] text-muted-foreground/50">
                    JPG, PNG, WebP, GIF · Max {limits.maxImageSizeMb}MB
                  </p>
                </>
              )}

              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
            {plan === "free" && imageCount !== null ? (
              <div className="text-[10px] text-muted-foreground text-center">
                {imageCount}/{limits.maxImageUploads} images used
                {imageCount >= limits.maxImageUploads ? (
                  <button
                    type="button"
                    onClick={() => setUpgradeOpen(true)}
                    className="text-amber-400 underline ml-1 cursor-pointer"
                  >
                    Upgrade for unlimited
                  </button>
                ) : null}
              </div>
            ) : null}
            {plan === "pro" ? (
              <div className="flex justify-center">
                <ImageLibraryModal
                  onSelect={(url) => {
                    onChange(url);
                    setPreview(url);
                  }}
                />
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <Input
              placeholder="https://example.com/image.jpg"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUrlApply()}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleUrlApply}
              disabled={!urlValue.trim()}
            >
              Apply URL
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
