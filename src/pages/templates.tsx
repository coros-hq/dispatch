import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { fetchPublicTemplates } from "@/lib/template-service";
import type { SavedTemplate } from "@/lib/template-service";
import { migrateTemplate } from "@/lib/template-service";
import { useEditorStore } from "@/store/editor";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Logo from "@/assets/logo.svg";
import { TemplateCard } from "@/components/TemplateCard";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "newsletter", label: "Newsletter" },
  { value: "marketing", label: "Marketing" },
  { value: "outreach", label: "Outreach" },
  { value: "transactional", label: "Transactional" },
  { value: "general", label: "General" },
];

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setTemplate, setCurrentProjectId } = useEditorStore();
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<SavedTemplate | null>(null);

  useEffect(() => {
    fetchPublicTemplates(category)
      .then(setTemplates)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [category]);

  const filtered = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  const defaultTemplates = filtered.filter((t) => t.is_default);
  const communityTemplates = filtered.filter((t) => !t.is_default);

  const handleUse = (template: SavedTemplate) => {
    if (!user) {
      navigate("/sign-in");
      return;
    }
    const data = migrateTemplate(template.data);
    setTemplate(data);
    setCurrentProjectId(null);
    navigate("/editor");
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => navigate(user ? "/" : "/sign-in")}
        >
          <img src={Logo} alt="Dispatch" className="w-7 h-7" />
          <span className="text-base font-semibold text-foreground">
            Dispatch
          </span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Button size="sm" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/sign-in")}
              >
                Sign in
              </Button>
              <Button size="sm" onClick={() => navigate("/sign-up")}>
                Get started
              </Button>
            </>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Template Library
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Browse ready-to-use email templates. Pick one, customize it in the
            editor, and send.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <Button
                key={c.value}
                variant={category === c.value ? "default" : "outline"}
                size="sm"
                className={category === c.value ? "text-black" : "text-white"}
                onClick={() => setCategory(c.value)}
              >
                {c.label}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-xl border border-border bg-card animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            {/* Default templates */}
            {defaultTemplates.length > 0 && (
              <div className="mb-10">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">
                  Starter templates
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {defaultTemplates.map((t) => (
                    <TemplateCard
                      key={t.id}
                      template={t}
                      isPreview={preview?.id === t.id}
                      onPreview={() =>
                        setPreview(preview?.id === t.id ? null : t)
                      }
                      onUse={() => handleUse(t)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Community templates */}
            {communityTemplates.length > 0 && (
              <div>
                <Separator className="mb-8" />
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">
                  Community templates
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {communityTemplates.map((t) => (
                    <TemplateCard
                      key={t.id}
                      template={t}
                      isPreview={preview?.id === t.id}
                      onPreview={() =>
                        setPreview(preview?.id === t.id ? null : t)
                      }
                      onUse={() => handleUse(t)}
                    />
                  ))}
                </div>
              </div>
            )}

            {filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No templates found</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
