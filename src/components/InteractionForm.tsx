import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  RootState, 
  setFormField, 
  addInteraction, 
  updateInteraction, 
  cancelEdit, 
  setTraceLog, 
  setLoading, 
  setError 
} from "../reduxStore";
import { 
  Calendar, 
  Clock, 
  Users, 
  MessageSquare, 
  Mic, 
  Sparkles, 
  Search, 
  Plus, 
  X, 
  HelpCircle, 
  Check, 
  AlertCircle,
  TrendingUp,
  FileText,
  Gift
} from "lucide-react";
import { InteractionType, SentimentType } from "../types";

export default function InteractionForm() {
  const dispatch = useDispatch();
  const currentForm = useSelector((state: RootState) => state.crm.currentForm);
  const editingId = useSelector((state: RootState) => state.crm.editingId);
  const availableHCPs = useSelector((state: RootState) => state.crm.availableHCPs);
  const availableMaterials = useSelector((state: RootState) => state.crm.availableMaterials);
  const availableSamples = useSelector((state: RootState) => state.crm.availableSamples);
  const loading = useSelector((state: RootState) => state.crm.loading);

  // Local component state
  const [hcpSearch, setHcpSearch] = useState("");
  const [hcpDropdownOpen, setHcpDropdownOpen] = useState(false);
  const [attendeeInput, setAttendeeInput] = useState("");
  const [materialsSearch, setMaterialsSearch] = useState("");
  const [materialsDropdownOpen, setMaterialsDropdownOpen] = useState(false);
  
  const [sampleSelectedName, setSampleSelectedName] = useState("");
  const [sampleQuantity, setSampleQuantity] = useState(1);
  const [sampleSectionOpen, setSampleSectionOpen] = useState(false);

  // Sync search input with pre-filled hcpName
  React.useEffect(() => {
    setHcpSearch(currentForm.hcpName);
  }, [currentForm.hcpName]);

  const handleFieldChange = (key: keyof typeof currentForm, value: any) => {
    dispatch(setFormField({ key, value }));
  };

  const handleAddAttendee = () => {
    if (attendeeInput.trim()) {
      const updated = [...currentForm.attendees, attendeeInput.trim()];
      handleFieldChange("attendees", updated);
      setAttendeeInput("");
    }
  };

  const handleRemoveAttendee = (index: number) => {
    const updated = currentForm.attendees.filter((_, i) => i !== index);
    handleFieldChange("attendees", updated);
  };

  const handleAddMaterial = (material: string) => {
    if (!currentForm.materialsShared.includes(material)) {
      const updated = [...currentForm.materialsShared, material];
      handleFieldChange("materialsShared", updated);
    }
    setMaterialsDropdownOpen(false);
    setMaterialsSearch("");
  };

  const handleRemoveMaterial = (material: string) => {
    const updated = currentForm.materialsShared.filter((m) => m !== material);
    handleFieldChange("materialsShared", updated);
  };

  const handleAddSample = () => {
    if (sampleSelectedName) {
      // check if already exists, update quantity, else add
      const existingIdx = currentForm.samplesDistributed.findIndex((s) => s.name === sampleSelectedName);
      let updated = [...currentForm.samplesDistributed];
      if (existingIdx !== -1) {
        updated[existingIdx] = {
          name: sampleSelectedName,
          quantity: updated[existingIdx].quantity + Number(sampleQuantity)
        };
      } else {
        updated.push({ name: sampleSelectedName, quantity: Number(sampleQuantity) });
      }
      handleFieldChange("samplesDistributed", updated);
      setSampleSelectedName("");
      setSampleQuantity(1);
      setSampleSectionOpen(false);
    }
  };

  const handleRemoveSample = (index: number) => {
    const updated = currentForm.samplesDistributed.filter((_, i) => i !== index);
    handleFieldChange("samplesDistributed", updated);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentForm.hcpName) {
      alert("HCP Name is required. Please select or enter an HCP.");
      return;
    }

    try {
      if (editingId) {
        const response = await fetch(`/api/interactions/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentForm)
        });
        if (!response.ok) throw new Error("Failed to update interaction in database");
        
        dispatch(updateInteraction({ id: editingId, updatedData: currentForm }));
        alert("Interaction log updated successfully in MySQL database!");
      } else {
        const response = await fetch("/api/interactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentForm)
        });
        if (!response.ok) throw new Error("Failed to save interaction to database");
        const savedInteraction = await response.json();
        
        dispatch(addInteraction(savedInteraction));
        alert("New Interaction log committed successfully to MySQL database!");
      }
      dispatch(cancelEdit()); // clears form and editing id
    } catch (error: any) {
      alert(`Database Error: ${error.message}`);
    }
  };

  // Simulate dictating voice note
  const handleVoiceNoteTrigger = async () => {
    const speechScript = 
      "I had a quick Lunch and Learn meeting with Dr. Jane Sharma today. " +
      "We discussed the OncoBoost Phase III trial efficacy report. " +
      "She asked for the physical trial print, so I shared the NEJM clinical reprint. " +
      "I also left 2 starter packs of OncoBoost 10mg with her. " +
      "She seemed very positive about the clinical outcomes and wants to follow up in 2 weeks.";

    handleFieldChange("topicsDiscussed", "Listening to voice note... [Simulating Audio Feed]");
    dispatch(setLoading(true));

    try {
      const response = await fetch("/api/ai/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: speechScript }),
      });
      const resData = await response.json();
      if (resData.success) {
        // Load extracted data into form!
        Object.keys(resData.data).forEach((key) => {
          handleFieldChange(key as any, resData.data[key]);
        });
        dispatch(setTraceLog(resData.trace));
      } else {
        dispatch(setError(resData.error));
      }
    } catch (e: any) {
      dispatch(setError(e.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleAddSuggestedFollowUp = (suggestion: string) => {
    // strip the leading plus or bullet if any
    const cleanStr = suggestion.replace(/^\+?\s*/, "");
    const currentFollowUps = currentForm.followUpActions.trim();
    const delimiter = currentFollowUps ? "\n- " : "- ";
    handleFieldChange("followUpActions", currentFollowUps + delimiter + cleanStr);
  };

  return (
    <form onSubmit={handleFormSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 text-slate-900">
      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>{editingId ? "Edit Interaction Details" : "Interaction Details"}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {editingId ? "Modify and update committed CRM log data" : "Enter interaction details using structured fields"}
          </p>
        </div>
        {editingId && (
          <span className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-700 px-2.5 py-1 rounded-lg font-semibold font-mono">
            EDIT MODE
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* HCP Name (With Autocomplete Dropdown) */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            HCP Name <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              placeholder="Search or select HCP..."
              value={hcpSearch}
              onChange={(e) => {
                setHcpSearch(e.target.value);
                handleFieldChange("hcpName", e.target.value);
                setHcpDropdownOpen(true);
              }}
              onFocus={() => setHcpDropdownOpen(true)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-sans"
            />
            <Search className="absolute right-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Autocomplete Dropdown list */}
          {hcpDropdownOpen && (
            <div className="absolute z-30 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-48 overflow-y-auto divide-y divide-slate-100">
              {availableHCPs
                .filter((hcp) => hcp.name.toLowerCase().includes(hcpSearch.toLowerCase()))
                .map((hcp) => (
                  <button
                    key={hcp.id}
                    type="button"
                    onClick={() => {
                      setHcpSearch(hcp.name);
                      handleFieldChange("hcpName", hcp.name);
                      // Auto-populate some attendees for reality simulation
                      handleFieldChange("attendees", ["John Doe (Sales rep)", hcp.name]);
                      setHcpDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex justify-between items-center text-sm"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{hcp.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{hcp.specialty} • {hcp.institution}</p>
                    </div>
                    <span className="text-[10px] bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded font-mono">
                      {hcp.id}
                    </span>
                  </button>
                ))}
              {availableHCPs.filter((hcp) => hcp.name.toLowerCase().includes(hcpSearch.toLowerCase())).length === 0 && (
                <div className="px-4 py-3 text-xs text-slate-400 italic">No providers matched, press Enter to register as new profile.</div>
              )}
            </div>
          )}
        </div>

        {/* Interaction Type Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Interaction Type
          </label>
          <select
            value={currentForm.interactionType}
            onChange={(e) => handleFieldChange("interactionType", e.target.value as InteractionType)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-sans"
          >
            <option value="Meeting">Meeting</option>
            <option value="Call">Call</option>
            <option value="Email">Email</option>
            <option value="Lunch and Learn">Lunch and Learn</option>
            <option value="Webcast">Webcast</option>
            <option value="Advisory Board">Advisory Board</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>Date</span>
          </label>
          <input
            type="date"
            value={currentForm.date}
            onChange={(e) => handleFieldChange("date", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-mono"
          />
        </div>

        {/* Time Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>Time</span>
          </label>
          <input
            type="time"
            value={currentForm.time}
            onChange={(e) => handleFieldChange("time", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-mono"
          />
        </div>
      </div>

      {/* Attendees Tags input */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          <span>Attendees</span>
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Enter attendee name (e.g., John Doe, rep)..."
            value={attendeeInput}
            onChange={(e) => setAttendeeInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddAttendee();
              }
            }}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={handleAddAttendee}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs px-3.5 py-2 rounded-xl transition-colors border border-slate-200 flex items-center gap-1 font-medium"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
        {/* Render Attendees list tags */}
        <div className="flex flex-wrap gap-2">
          {currentForm.attendees.map((att, idx) => (
            <span
              key={idx}
              className="bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 shadow-sm"
            >
              <span>{att}</span>
              <button
                type="button"
                onClick={() => handleRemoveAttendee(idx)}
                className="text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {currentForm.attendees.length === 0 && (
            <p className="text-xs text-slate-400 italic mt-1">No attendees registered.</p>
          )}
        </div>
      </div>

      {/* Topics Discussed Area */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
            <span>Topics Discussed (Clinical / Scientific points)</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono italic">Supports speech summary</span>
        </label>
        <div className="relative">
          <textarea
            rows={3}
            placeholder="Enter key discussion points or literature clinical data review..."
            value={currentForm.topicsDiscussed}
            onChange={(e) => handleFieldChange("topicsDiscussed", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-sans"
          />
          <button
            type="button"
            onClick={handleVoiceNoteTrigger}
            disabled={loading}
            title="Simulate Speech Dictation & AI Processing"
            className="absolute bottom-3 right-3 bg-blue-50 border border-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 text-xs disabled:opacity-50 font-medium"
          >
            <Mic className="h-4 w-4 animate-pulse" />
            <span>Voice Note Demo</span>
          </button>
        </div>

        {/* Suggest simulated voice note summary */}
        <button
          type="button"
          onClick={handleVoiceNoteTrigger}
          disabled={loading}
          className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs text-blue-700 transition-all shadow-sm font-medium"
        >
          <Sparkles className="h-3.5 w-3.5 text-blue-600 animate-spin" />
          <span>Summarize from Voice Note (Requires Consent)</span>
        </button>
      </div>

      {/* Materials Shared Segment */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-slate-400" />
            <span>Materials Shared</span>
          </span>
          <button
            type="button"
            onClick={() => setMaterialsDropdownOpen(!materialsDropdownOpen)}
            className="text-xs bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 flex items-center gap-1 shadow-sm font-medium"
          >
            <Search className="h-3 w-3 text-slate-400" /> Search/Add
          </button>
        </div>

        {/* Search Material drop-down */}
        {materialsDropdownOpen && (
          <div className="relative mt-2 z-20">
            <input
              type="text"
              placeholder="Filter scientific brochures..."
              value={materialsSearch}
              onChange={(e) => setMaterialsSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 mb-1 focus:outline-none focus:border-blue-500"
            />
            <div className="bg-white border border-slate-200 rounded-xl max-h-32 overflow-y-auto divide-y divide-slate-100 shadow-2xl">
              {availableMaterials
                .filter((mat) => mat.toLowerCase().includes(materialsSearch.toLowerCase()))
                .map((mat) => (
                  <button
                    key={mat}
                    type="button"
                    onClick={() => handleAddMaterial(mat)}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-xs text-slate-700 flex items-center gap-2 justify-between"
                  >
                    <span>{mat}</span>
                    <Plus className="h-3 w-3 text-slate-400" />
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Shared lists */}
        <div className="space-y-1.5">
          {currentForm.materialsShared.map((mat) => (
            <div key={mat} className="flex justify-between items-center bg-white border border-slate-100 px-3 py-2 rounded-lg text-xs text-slate-700 shadow-sm">
              <span className="truncate pr-4">{mat}</span>
              <button
                type="button"
                onClick={() => handleRemoveMaterial(mat)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {currentForm.materialsShared.length === 0 && (
            <p className="text-xs text-slate-400 italic">No materials added.</p>
          )}
        </div>
      </div>

      {/* Samples Distributed Segment */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Gift className="h-4 w-4 text-slate-400" />
            <span>Samples Distributed</span>
          </span>
          <button
            type="button"
            onClick={() => setSampleSectionOpen(!sampleSectionOpen)}
            className="text-xs bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 flex items-center gap-1 shadow-sm font-medium"
          >
            <Plus className="h-3 w-3 text-slate-400" /> Add Sample
          </button>
        </div>

        {/* Add sample picker panel */}
        {sampleSectionOpen && (
          <div className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-2 shadow-sm">
            <div className="grid grid-cols-3 gap-2">
              <select
                value={sampleSelectedName}
                onChange={(e) => setSampleSelectedName(e.target.value)}
                className="col-span-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 focus:outline-none"
              >
                <option value="">-- Choose Sample Pack --</option>
                {availableSamples.map((samp) => (
                  <option key={samp} value={samp}>{samp}</option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={sampleQuantity}
                onChange={(e) => setSampleQuantity(Math.max(1, Number(e.target.value)))}
                className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 text-center focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setSampleSectionOpen(false)}
                className="px-2.5 py-1 text-[11px] text-slate-500 hover:text-slate-850"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddSample}
                disabled={!sampleSelectedName}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-[11px] font-semibold shadow-sm"
              >
                Confirm Add
              </button>
            </div>
          </div>
        )}

        {/* Active samples lists */}
        <div className="space-y-1.5">
          {currentForm.samplesDistributed.map((samp, idx) => (
            <div key={idx} className="flex justify-between items-center bg-white border border-slate-100 px-3 py-2 rounded-lg text-xs text-slate-700 shadow-sm">
              <span className="truncate pr-4">{samp.name}</span>
              <div className="flex items-center gap-3">
                <span className="bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
                  x{samp.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveSample(idx)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          {currentForm.samplesDistributed.length === 0 && (
            <p className="text-xs text-slate-400 italic">No samples added.</p>
          )}
        </div>
      </div>

      {/* Observed Sentiment Radio Row */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
          <span>Observed/Inferred HCP Sentiment</span>
        </label>
        <div className="flex gap-4">
          {(["Positive", "Neutral", "Negative"] as SentimentType[]).map((sent) => (
            <label
              key={sent}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border cursor-pointer transition-all ${
                currentForm.sentiment === sent
                  ? "bg-blue-50 border-blue-300 text-blue-700 font-semibold shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
              }`}
            >
              <input
                type="radio"
                name="sentiment"
                value={sent}
                checked={currentForm.sentiment === sent}
                onChange={() => handleFieldChange("sentiment", sent)}
                className="sr-only"
              />
              <span>
                {sent === "Positive" && "😊"}
                {sent === "Neutral" && "😐"}
                {sent === "Negative" && "🙁"}
              </span>
              <span className="text-xs">{sent}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Outcomes Area */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Outcomes (Key agreements or decisions)
        </label>
        <textarea
          rows={2}
          placeholder="What did the HCP agree to or decide?"
          value={currentForm.outcomes}
          onChange={(e) => handleFieldChange("outcomes", e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-sans"
        />
      </div>

      {/* Follow-up Actions Area */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Follow-up Actions (Next steps or tasks)
        </label>
        <textarea
          rows={2}
          placeholder="Enter next tasks, medical research requests, or follow-up schedule..."
          value={currentForm.followUpActions}
          onChange={(e) => handleFieldChange("followUpActions", e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-sans"
        />
      </div>

      {/* AI Suggested Follow-ups */}
      {currentForm.suggestedFollowUps.length > 0 && (
        <div className="pt-2 border-t border-slate-200">
          <p className="text-[10px] uppercase font-mono tracking-wider text-blue-600 font-bold mb-2">
            AI Suggested Follow-ups (Click to add to actions list)
          </p>
          <div className="flex flex-col gap-1.5">
            {currentForm.suggestedFollowUps.map((fol, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddSuggestedFollowUp(fol)}
                className="text-left text-xs text-blue-700 hover:text-blue-800 font-sans flex items-center gap-1.5 transition-colors font-medium bg-blue-50/50 hover:bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg"
              >
                <Plus className="h-3 w-3" />
                <span>{fol}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Submission Row */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        {editingId && (
          <button
            type="button"
            onClick={() => dispatch(cancelEdit())}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel Edit
          </button>
        )}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-500/10 transition-colors"
        >
          {editingId ? "Update Logged Interaction" : "Commit Interaction Log"}
        </button>
      </div>
    </form>
  );
}
