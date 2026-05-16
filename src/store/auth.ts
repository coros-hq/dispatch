import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { fetchUserPlan, fetchUsage } from "@/lib/planService";
import { usePlanStore } from "./plan";
import type { User } from "@supabase/supabase-js";

/** Set while the user is completing /reset-password; cleared on SIGNED_OUT. */
export const PASSWORD_RECOVERY_PENDING_KEY = "dispatch-password-recovery";

const isRecoveryPending = () =>
  sessionStorage.getItem(PASSWORD_RECOVERY_PENDING_KEY) === "1";

function loadUserPlan() {
  usePlanStore.getState().setLoading(true);
  fetchUserPlan().then((plan) => {
    usePlanStore.getState().setPlan(plan);
    usePlanStore.getState().setLoading(false);
  });
  fetchUsage().then(({ testEmailsSent, campaignsSent }) => {
    usePlanStore.getState().setUsage(testEmailsSent, campaignsSent);
  });
}

type AuthStore = {
  user: User | null;
  loading: boolean;
  verified: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setVerified: (verified: boolean) => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      verified: false,
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setVerified: (verified) => set({ verified }),
    }),
    {
      name: "dispatch-auth",
      partialize: (state) => ({ user: state.user }),
    },
  ),
);

// Recovery tokens live in the hash; Supabase strips them async. Capture intent
// in sessionStorage so we still treat the visit as recovery after the hash is gone.
if (window.location.hash.includes("type=recovery")) {
  sessionStorage.setItem(PASSWORD_RECOVERY_PENDING_KEY, "1");
}

// Persist rehydrates user from localStorage synchronously. If there's a stored
// user and we're in a recovery flow, AuthLayout would redirect to "/" before any
// async code runs. Clear it immediately so the reset-password page renders.
if (isRecoveryPending()) {
  useAuthStore.getState().setUser(null);
  localStorage.removeItem("dispatch-auth");
}

supabase.auth.getSession().then(({ data }) => {
  if (isRecoveryPending()) {
    useAuthStore.getState().setLoading(false);
    useAuthStore.getState().setVerified(true);
    return;
  }
  const user = data.session?.user ?? null;
  useAuthStore.getState().setUser(user);
  useAuthStore.getState().setLoading(false);
  useAuthStore.getState().setVerified(true);
  if (user) loadUserPlan();
  else usePlanStore.getState().reset();
});

supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_OUT") {
    useAuthStore.getState().setUser(null);
    useAuthStore.getState().setLoading(false);
    useAuthStore.getState().setVerified(true);
    usePlanStore.getState().reset();
    localStorage.removeItem("dispatch-auth");
    sessionStorage.removeItem(PASSWORD_RECOVERY_PENDING_KEY);
    return;
  }
  // INITIAL_SESSION and other events still carry the recovery user; never write
  // that into the app store or AuthLayout will send them to the dashboard.
  if (isRecoveryPending()) {
    useAuthStore.getState().setLoading(false);
    useAuthStore.getState().setVerified(true);
    return;
  }
  const user = session?.user ?? null;
  useAuthStore.getState().setUser(user);
  useAuthStore.getState().setLoading(false);
  useAuthStore.getState().setVerified(true);
  if (user) loadUserPlan();
  else usePlanStore.getState().reset();
});
