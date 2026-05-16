import { create } from "zustand";
import type { Plan } from "../lib/planLimits";

type PlanStore = {
  plan: Plan;
  loading: boolean;
  testEmailsSent: number;
  campaignsSent: number;
  setPlan: (plan: Plan) => void;
  setLoading: (loading: boolean) => void;
  setUsage: (testEmailsSent: number, campaignsSent: number) => void;
  reset: () => void;
};

export const usePlanStore = create<PlanStore>((set) => ({
  plan: "free",
  loading: true,
  testEmailsSent: 0,
  campaignsSent: 0,
  setPlan: (plan) => set({ plan }),
  setLoading: (loading) => set({ loading }),
  setUsage: (testEmailsSent, campaignsSent) =>
    set({ testEmailsSent, campaignsSent }),
  reset: () =>
    set({
      plan: "free",
      loading: false,
      testEmailsSent: 0,
      campaignsSent: 0,
    }),
}));
