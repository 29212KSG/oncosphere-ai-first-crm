import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CRMState, Interaction, InteractionType, SentimentType, SampleDistribution, TraceLogItem } from "./types";

const initialFormState = () => ({
  hcpName: "",
  interactionType: "Meeting" as InteractionType,
  date: new Date().toISOString().split("T")[0],
  time: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }),
  attendees: [] as string[],
  topicsDiscussed: "",
  materialsShared: [] as string[],
  samplesDistributed: [] as SampleDistribution[],
  sentiment: "Neutral" as SentimentType,
  outcomes: "",
  followUpActions: "",
  suggestedFollowUps: [] as string[],
});

const initialState: CRMState = {
  interactions: [
    {
      id: "int-1",
      hcpName: "Dr. Jane Sharma",
      interactionType: "Meeting",
      date: "2026-07-08",
      time: "14:30",
      attendees: ["John Doe (Sales rep)", "Dr. Jane Sharma"],
      topicsDiscussed: "Discussed OncoBoost Phase III efficacy data, focusing on progression-free survival (PFS) rates. Dr. Sharma was highly receptive and requested physical copies of the clinical trial reprint.",
      materialsShared: ["OncoBoost Phase III Trial Reprint (NEJM)"],
      samplesDistributed: [{ name: "OncoBoost 10mg (Starter Packs)", quantity: 2 }],
      sentiment: "Positive",
      outcomes: "Dr. Sharma agreed to review the clinical reprints and consider OncoBoost for her upcoming cohort. Scheduled a follow-up in two weeks.",
      followUpActions: "Prepare and deliver the NEJM reprint package. Schedule follow-up visit.",
      suggestedFollowUps: [
        "+ Send OncoBoost Phase III PDF",
        "+ Schedule follow-up meeting in 2 weeks"
      ],
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  currentForm: initialFormState(),
  editingId: null,
  loading: false,
  error: null,
  traceLog: null,
  activeTab: "interface",
  availableHCPs: [
    { id: "hcp-1", name: "Dr. Jane Sharma", specialty: "Oncology", institution: "Metro Cancer Center" },
    { id: "hcp-2", name: "Dr. Marcus Vance", specialty: "Cardiology", institution: "St. Jude Cardiology" },
    { id: "hcp-3", name: "Dr. Elena Rostova", specialty: "Immunology", institution: "Global Research Hospital" },
    { id: "hcp-4", name: "Dr. David Cho", specialty: "Oncology", institution: "University Medical Center" },
    { id: "hcp-5", name: "Dr. Sarah Jenkins", specialty: "Neurology", institution: "Neurology Specialist Clinic" }
  ],
  availableMaterials: [
    "OncoBoost Phase III Trial Reprint (NEJM)",
    "OncoBoost Efficacy & Safety Slide Deck",
    "OncoBoost Patient Starter Kit Brochure",
    "CardioShield Dosing Guide",
    "NeuroRevive Clinical Study Summary"
  ],
  availableSamples: [
    "OncoBoost 10mg (Starter Packs)",
    "OncoBoost 20mg (Starter Packs)",
    "CardioShield 50mg (Starter Kits)",
    "NeuroRevive 5mg (Sample Bottles)"
  ]
};

const crmSlice = createSlice({
  name: "crm",
  initialState,
  reducers: {
    setFormField: (
      state,
      action: PayloadAction<{ key: keyof Omit<Interaction, "id" | "createdAt">; value: any }>
    ) => {
      const { key, value } = action.payload;
      (state.currentForm as any)[key] = value;
    },
    resetForm: (state) => {
      state.currentForm = initialFormState();
      state.editingId = null;
    },
    addInteraction: (state, action: PayloadAction<Interaction>) => {
      state.interactions.unshift(action.payload);
    },
    updateInteraction: (
      state,
      action: PayloadAction<{ id: string; updatedData: Omit<Interaction, "id" | "createdAt"> }>
    ) => {
      const { id, updatedData } = action.payload;
      const index = state.interactions.findIndex((item) => item.id === id);
      if (index !== -1) {
        state.interactions[index] = {
          ...state.interactions[index],
          ...updatedData,
        };
      }
      state.editingId = null;
    },
    deleteInteraction: (state, action: PayloadAction<string>) => {
      state.interactions = state.interactions.filter((item) => item.id !== action.payload);
    },
    startEditInteraction: (state, action: PayloadAction<string>) => {
      const interaction = state.interactions.find((item) => item.id === action.payload);
      if (interaction) {
        state.editingId = interaction.id;
        state.currentForm = {
          hcpName: interaction.hcpName,
          interactionType: interaction.interactionType,
          date: interaction.date,
          time: interaction.time,
          attendees: interaction.attendees,
          topicsDiscussed: interaction.topicsDiscussed,
          materialsShared: interaction.materialsShared,
          samplesDistributed: interaction.samplesDistributed,
          sentiment: interaction.sentiment,
          outcomes: interaction.outcomes,
          followUpActions: interaction.followUpActions,
          suggestedFollowUps: interaction.suggestedFollowUps,
        };
      }
    },
    cancelEdit: (state) => {
      state.editingId = null;
      state.currentForm = initialFormState();
    },
    setTraceLog: (state, action: PayloadAction<TraceLogItem[] | null>) => {
      state.traceLog = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<"interface" | "architecture" | "logs">) => {
      state.activeTab = action.payload;
    },
    setAvailableData: (
      state,
      action: PayloadAction<{
        hcps: { id: string; name: string; specialty: string; institution: string }[];
        materials: string[];
        samples: string[];
      }>
    ) => {
      state.availableHCPs = action.payload.hcps;
      state.availableMaterials = action.payload.materials;
      state.availableSamples = action.payload.samples;
    },
    setInteractions: (state, action: PayloadAction<Interaction[]>) => {
      state.interactions = action.payload;
    },
  },
});

export const {
  setFormField,
  resetForm,
  addInteraction,
  updateInteraction,
  deleteInteraction,
  startEditInteraction,
  cancelEdit,
  setTraceLog,
  setLoading,
  setError,
  setActiveTab,
  setAvailableData,
  setInteractions,
} = crmSlice.actions;

export const reduxStore = configureStore({
  reducer: {
    crm: crmSlice.reducer,
  },
});

export type RootState = ReturnType<typeof reduxStore.getState>;
export type AppDispatch = typeof reduxStore.dispatch;
