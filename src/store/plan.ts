import { create } from "zustand";
import type { Plan } from "../lib/planLimits";

type PlanStore = {
  plan: Plan;
  loading: boolean;
  testEmailsSent: number;
  campaignsSent: number;
  contactsThisMonth: number;
  setPlan: (plan: Plan) => void;
  setLoading: (loading: boolean) => void;
  setUsage: (
    testEmailsSent: number,
    campaignsSent: number,
    contactsThisMonth?: number,
  ) => void;
  reset: () => void;
};

export const usePlanStore = create<PlanStore>((set) => ({
  plan: "free",
  loading: true,
  testEmailsSent: 0,
  campaignsSent: 0,
  contactsThisMonth: 0,
  setPlan: (plan) => set({ plan }),
  setLoading: (loading) => set({ loading }),
  setUsage: (testEmailsSent, campaignsSent, contactsThisMonth = 0) =>
    set({ testEmailsSent, campaignsSent, contactsThisMonth }),
  reset: () =>
    set({
      plan: "free",
      loading: false,
      testEmailsSent: 0,
      campaignsSent: 0,
      contactsThisMonth: 0,
    }),
}));
