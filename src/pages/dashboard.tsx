import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { PlusIcon, LogOutIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fetchTemplates, deleteTemplate } from "@/lib/template-service";
import type { SavedTemplate } from "@/lib/template-service";
import { useAuthStore } from "@/store/auth";
import { useEditorStore } from "@/store/editor";
import { signOut } from "@/lib/auth";
import { toast } from "sonner";
import Logo from "@/assets/logo.svg";
import type { Template } from "@/types";
import { ProjectCard } from "@/components/ProjectCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setTemplate, setCurrentProjectId } = useEditorStore();
  const [projects, setProjects] = useState<SavedTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"updated" | "created" | "name">("updated");

  const loadProjects = useCallback(
    async (searchTerm: string) => {
      setLoading(true);
      try {
        const templates = await fetchTemplates(searchTerm);
        setProjects(
          templates.filter((t) => !t.is_default && t.user_id === user?.id),
        );
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    },
    [user?.id],
  );

  useEffect(() => {
    loadProjects("");
  }, [loadProjects]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProjects(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, loadProjects]);

  const handleNew = () => {
    const canvasId = crypto.randomUUID();
    setTemplate({
      id: crypto.randomUUID(),
      name: "Untitled",
      canvases: [
        {
          id: canvasId,
          name: "Canvas 1",
          sections: [],
          globalStyles: {
            fontFamily: "Inter, sans-serif",
            bgColor: "#f4f4f4",
            contentWidth: 600,
          },
        },
      ],
      activeCanvasId: canvasId,
    });
    setCurrentProjectId(null);
    navigate("/editor");
  };
  const handleOpen = (project: SavedTemplate) => {
    setTemplate(project.data as Template);
    setCurrentProjectId(project.id);
    navigate(`/editor/${project.id}`);
  };
  const handleDelete = async (id: string) => {
    try {
      await deleteTemplate(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Project deleted");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/sign-in");
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="h-14 border-b border-white/20 flex items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <img src={Logo} alt="Dispatch" className="w-7 h-7" />
          <span className="text-base font-semibold text-foreground">
            Dispatch
          </span>
          <Separator
            className="text-white bg-white/20"
            orientation="vertical"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/profile")}
            className="text-muted-foreground hover:text-foreground"
          >
            <UserIcon className="w-4 h-4 mr-2" />
            Profile
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground"
          >
            Sign out
            <LogOutIcon className="ml-1" />
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl mb-8 text-white font-semibold">
          👋 Hello {user?.user_metadata?.first_name}{" "}
          {user?.user_metadata?.last_name} !
        </h1>
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              My projects
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {projects.length} project{projects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3 mb-6">
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-full text-white"
            />
            <Select
              value={sort}
              onValueChange={(v) => setSort(v as typeof sort)}
            >
              <SelectTrigger className="w-56 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">Last updated</SelectItem>
                <SelectItem value="created">Date created</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-row items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/templates")}
              className="text-muted-foreground hover:text-foreground"
            >
              Templates
            </Button>
            <Button onClick={handleNew}>
              <PlusIcon className="w-4 h-4 mr-2" />
              New project
            </Button>
          </div>
        </div>

        {/* Projects grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-xl border border-border bg-card animate-pulse"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <img src={Logo} alt="Dispatch" className="w-7 h-7 opacity-40" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                No projects yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Create your first newsletter to get started
              </p>
            </div>
            <Button onClick={handleNew}>
              <PlusIcon className="w-4 h-4 mr-2" />
              New project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleOpen(project)}
                onDelete={() => handleDelete(project.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
