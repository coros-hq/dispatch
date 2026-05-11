import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  fetchProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from "@/lib/profile-service";
import type { Profile } from "@/lib/profile-service";
import { useAuthStore } from "@/store/auth";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import Logo from "@/assets/logo.svg";
import Loader from "@/components/loader";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Password fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchProfile()
      .then(setProfile)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveInfo = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await updateProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
      });
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await updateProfile({
        notify_product_updates: profile.notify_product_updates,
        notify_newsletter_tips: profile.notify_newsletter_tips,
        notify_community_activity: profile.notify_community_activity,
      });
      toast.success("Notification preferences saved");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setChangingPassword(true);
    try {
      await changePassword(newPassword);
      toast.success("Password updated");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      navigate("/sign-in");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </Button>
          <img src={Logo} alt="Dispatch" className="w-7 h-7" />
          <span className="text-base font-semibold text-foreground">
            Profile
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{user?.email}</span>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-6">
        {/* Personal info */}
        <Card>
          <CardHeader>
            <CardTitle>Personal info</CardTitle>
            <CardDescription>
              Update your name and email address
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>First name</Label>
                <Input
                  value={profile?.first_name ?? ""}
                  onChange={(e) =>
                    setProfile((p) =>
                      p ? { ...p, first_name: e.target.value } : p,
                    )
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Last name</Label>
                <Input
                  value={profile?.last_name ?? ""}
                  onChange={(e) =>
                    setProfile((p) =>
                      p ? { ...p, last_name: e.target.value } : p,
                    )
                  }
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Email</Label>
              <Input
                value={user?.email ?? ""}
                disabled
                className="opacity-50"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveInfo} disabled={saving} size="sm">
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Change password */}
        <Card>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
            <CardDescription>
              Choose a new password for your account
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>New password</Label>
              <Input
                type="password"
                placeholder="••••••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Confirm new password</Label>
              <Input
                type="password"
                placeholder="••••••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleChangePassword}
                disabled={changingPassword || !newPassword || !confirmPassword}
                size="sm"
              >
                {changingPassword ? "Updating..." : "Update password"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notification preferences</CardTitle>
            <CardDescription>
              Choose what emails you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Product updates
                </p>
                <p className="text-xs text-muted-foreground">
                  New features and improvements
                </p>
              </div>
              <Switch
                checked={profile?.notify_product_updates ?? true}
                onCheckedChange={(v) =>
                  setProfile((p) =>
                    p ? { ...p, notify_product_updates: v } : p,
                  )
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Newsletter tips
                </p>
                <p className="text-xs text-muted-foreground">
                  Best practices and design inspiration
                </p>
              </div>
              <Switch
                checked={profile?.notify_newsletter_tips ?? true}
                onCheckedChange={(v) =>
                  setProfile((p) =>
                    p ? { ...p, notify_newsletter_tips: v } : p,
                  )
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Community activity
                </p>
                <p className="text-xs text-muted-foreground">
                  When someone uses your public templates
                </p>
              </div>
              <Switch
                checked={profile?.notify_community_activity ?? false}
                onCheckedChange={(v) =>
                  setProfile((p) =>
                    p ? { ...p, notify_community_activity: v } : p,
                  )
                }
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleSaveNotifications}
                disabled={saving}
                size="sm"
              >
                {saving ? "Saving..." : "Save preferences"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger zone</CardTitle>
            <CardDescription>
              Permanent actions that cannot be undone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Delete account
                </p>
                <p className="text-xs text-muted-foreground">
                  Permanently delete your account and all your projects
                </p>
              </div>
              <ConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                title="Delete account"
                description="Are you sure you want to delete your account? All your projects will be permanently deleted. This action cannot be undone."
                trigger={
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    Delete account
                  </Button>
                }
                actionText="Delete account"
                onAction={handleDeleteAccount}
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
