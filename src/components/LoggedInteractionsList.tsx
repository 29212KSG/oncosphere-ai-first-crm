import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, startEditInteraction, deleteInteraction, setFormField, setTraceLog } from "../reduxStore";
import { Edit2, Trash2, Calendar, Clock, Smile, Frown, Meh, Users, FileText, Gift, CornerDownRight } from "lucide-react";
import { TraceLogItem } from "../types";

export default function LoggedInteractionsList() {
  const dispatch = useDispatch();
  const interactions = useSelector((state: RootState) => state.crm.interactions);
  const editingId = useSelector((state: RootState) => state.crm.editingId);

  const handleEdit = (id: string) => {
    dispatch(startEditInteraction(id));

    // Simulate the LangGraph edit_interaction tool trace!
    const interaction = interactions.find((item) => item.id === id);
    if (interaction) {
      const editTrace: TraceLogItem[] = [
        {
          timestamp: new Date().toISOString(),
          node: "__start__",
          type: "node",
          message: `Initiating LangGraph agent session to edit interaction ID: "${id}".`
        },
        {
          timestamp: new Date().toISOString(),
          node: "Edit_Interaction_Trigger",
          type: "node",
          message: "User clicked Edit on history card. Opening active state dictionary."
        },
        {
          timestamp: new Date().toISOString(),
          node: "Edit_Interaction_Tool",
          type: "tool",
          message: `Invoking 'Edit Interaction' Tool for record ID: "${id}". Loading existing database state values into memory stack.`,
          data: {
            target_id: id,
            current_hcp: interaction.hcpName,
            existing_sentiment: interaction.sentiment,
            existing_type: interaction.interactionType
          }
        },
        {
          timestamp: new Date().toISOString(),
          node: "Fetch_Product_Portfolio_Tool",
          type: "tool",
          message: "Validating associated drug samples and clinical brochure links for the edit payload.",
          data: {
            associated_samples: interaction.samplesDistributed,
            associated_materials: interaction.materialsShared
          }
        },
        {
          timestamp: new Date().toISOString(),
          node: "__end__",
          type: "node",
          message: "LangGraph complete. Fields populated in form state. Ready for modification.",
          data: { form_load_success: true }
        }
      ];
      dispatch(setTraceLog(editTrace));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this interaction log?")) {
      try {
        const response = await fetch(`/api/interactions/${id}`, {
          method: "DELETE"
        });
        if (!response.ok) throw new Error("Failed to delete interaction from database");
        dispatch(deleteInteraction(id));
      } catch (error: any) {
        alert(`Database Error: ${error.message}`);
      }
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return <Smile className="h-5 w-5 text-emerald-500" />;
      case "Negative":
        return <Frown className="h-5 w-5 text-rose-500" />;
      default:
        return <Meh className="h-5 w-5 text-amber-500" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-slate-900">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Interaction History Registry</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            Compliant records of logged activities with Healthcare Professionals.
          </p>
        </div>
        <span className="text-xs bg-slate-50 px-3 py-1 rounded-full text-slate-600 border border-slate-200 font-mono font-medium">
          Total Logs: {interactions.length}
        </span>
      </div>

      {interactions.length === 0 ? (
        <div className="text-center py-12 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
          <p className="text-sm text-slate-500">No interactions logged yet.</p>
          <p className="text-xs text-slate-400 mt-1">Use the Structured Form or AI Assistant to write your first log.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {interactions.map((item) => {
            const isBeingEdited = editingId === item.id;
            return (
              <div
                key={item.id}
                className={`border rounded-xl p-5 transition-all duration-300 ${
                  isBeingEdited
                    ? "bg-blue-50/60 border-blue-300 shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/30"
                }`}
              >
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      {getSentimentIcon(item.sentiment)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-md">{item.hcpName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-blue-50 border border-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold">
                          {item.interactionType}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1 font-mono font-normal">
                          <Calendar className="h-3 w-3" />
                          {item.date}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1 font-mono font-normal">
                          <Clock className="h-3 w-3" />
                          {item.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleEdit(item.id)}
                      title="Edit Interaction Log"
                      className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                        isBeingEdited
                          ? "bg-blue-600 border-blue-700 text-white font-semibold"
                          : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50 hover:text-slate-800"
                      }`}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>{isBeingEdited ? "Editing..." : "Edit"}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      title="Delete Interaction Log"
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="space-y-3 text-sm text-slate-600">
                  {/* Attendees */}
                  {item.attendees.length > 0 && (
                    <div className="flex items-start gap-2 text-xs text-slate-500">
                      <Users className="h-3.5 w-3.5 mt-0.5 text-slate-400 flex-shrink-0" />
                      <div className="flex flex-wrap gap-1.5">
                        <span className="font-semibold text-slate-500">Attendees:</span>
                        {item.attendees.map((att, idx) => (
                          <span key={idx} className="bg-slate-50 border border-slate-100 px-2 py-0.5 rounded text-slate-700">
                            {att}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Topics discussed */}
                  {item.topicsDiscussed && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 shadow-sm">
                      <p className="font-semibold text-slate-500 mb-1">Topics Discussed:</p>
                      <p className="leading-relaxed font-normal">{item.topicsDiscussed}</p>
                    </div>
                  )}

                  {/* Materials & Samples Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {/* Materials */}
                    {item.materialsShared.length > 0 && (
                      <div className="bg-slate-50/50 p-3 border border-slate-200 rounded-lg">
                        <p className="text-xs font-semibold text-slate-600 flex items-center gap-1 mb-1.5">
                          <FileText className="h-3.5 w-3.5 text-blue-600" />
                          <span>Materials Shared:</span>
                        </p>
                        <ul className="text-xs text-slate-600 list-disc list-inside space-y-1 font-normal">
                          {item.materialsShared.map((mat, idx) => (
                            <li key={idx} className="truncate">{mat}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Samples */}
                    {item.samplesDistributed.length > 0 && (
                      <div className="bg-slate-50/50 p-3 border border-slate-200 rounded-lg">
                        <p className="text-xs font-semibold text-slate-600 flex items-center gap-1 mb-1.5">
                          <Gift className="h-3.5 w-3.5 text-orange-500" />
                          <span>Samples Distributed:</span>
                        </p>
                        <ul className="text-xs text-slate-600 space-y-1">
                          {item.samplesDistributed.map((samp, idx) => (
                            <li key={idx} className="flex justify-between items-center bg-white px-2 py-1 border border-slate-200 rounded">
                              <span className="truncate font-normal">{samp.name}</span>
                              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-semibold font-mono">
                                x{samp.quantity}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Outcomes */}
                  {item.outcomes && (
                    <div className="text-xs">
                      <span className="font-semibold text-slate-500">Key Outcomes:</span>{" "}
                      <span className="text-slate-700 font-normal">{item.outcomes}</span>
                    </div>
                  )}

                  {/* Follow-up actions */}
                  {item.followUpActions && (
                    <div className="text-xs">
                      <span className="font-semibold text-slate-500">Follow-up:</span>{" "}
                      <span className="text-slate-700 font-normal">{item.followUpActions}</span>
                    </div>
                  )}

                  {/* Suggested Followups */}
                  {item.suggestedFollowUps.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-[10px] uppercase font-mono tracking-wider text-blue-600 font-bold">
                        AI Suggested Follow-ups
                      </p>
                      <div className="mt-1 space-y-1">
                        {item.suggestedFollowUps.map((fol, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700 font-normal">
                            <CornerDownRight className="h-3 w-3 text-blue-600 flex-shrink-0" />
                            <span>{fol}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
