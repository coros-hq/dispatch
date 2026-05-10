import { useEditorStore } from "../../store/editor";
import { saveTemplate, updateTemplate } from "@/lib/template-service";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function SaveTemplateModal() {
  const { template, currentProjectId, setCurrentProjectId } = useEditorStore();
  const renameTemplate = useEditorStore((s) => s.renameTemplate);
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const isExisting = !!currentProjectId;

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isExisting) {
        await updateTemplate(currentProjectId, template, isPublic);
        toast.success("Project updated");
      } else {
        const saved = await saveTemplate(template, isPublic);
        setCurrentProjectId(saved.id);
        toast.success("Project saved");
      }
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {isExisting ? "Save" : "Save template"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isExisting ? "Save project" : "Save template"}
          </DialogTitle>
          <DialogDescription>
            {isExisting
              ? "Update your existing project with the current changes"
              : "Save your current design as a reusable template"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label>Template name</Label>
            <Input
              value={template.name}
              onChange={(e) => renameTemplate(e.target.value)}
              placeholder="My newsletter template"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium text-foreground">Make public</p>
              <p className="text-xs text-muted-foreground">
                Public templates are visible to all users in the community
                gallery
              </p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !template.name}>
            {saving ? "Saving..." : isExisting ? "Update" : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
