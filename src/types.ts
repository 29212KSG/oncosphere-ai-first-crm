export type InteractionType = 
  | "Meeting" 
  | "Call" 
  | "Email" 
  | "Lunch and Learn" 
  | "Webcast" 
  | "Advisory Board";

export type SentimentType = "Positive" | "Neutral" | "Negative";

export interface SampleDistribution {
  name: string;
  quantity: number;
}

export interface Interaction {
  id: string;
  hcpName: string;
  interactionType: InteractionType;
  date: string;
  time: string;
  attendees: string[];
  topicsDiscussed: string;
  materialsShared: string[];
  samplesDistributed: SampleDistribution[];
  sentiment: SentimentType;
  outcomes: string;
  followUpActions: string;
  suggestedFollowUps: string[];
  createdAt: string;
}

export interface TraceLogItem {
  timestamp: string;
  node: string;
  type: "node" | "tool";
  message: string;
  data?: any;
}

export interface CRMState {
  interactions: Interaction[];
  currentForm: Omit<Interaction, "id" | "createdAt">;
  editingId: string | null;
  loading: boolean;
  error: string | null;
  traceLog: TraceLogItem[] | null;
  activeTab: "interface" | "architecture" | "logs";
  availableHCPs: { id: string; name: string; specialty: string; institution: string }[];
  availableMaterials: string[];
  availableSamples: string[];
}
