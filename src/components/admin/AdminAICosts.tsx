import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Euro, Calendar, Settings, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GENERATOR_MODELS = ["google/gemini-2.0-flash-001","google/gemini-2.5-pro-preview-03-25","openai/gpt-4o-mini","openai/gpt-4o","anthropic/claude-3-haiku","anthropic/claude-3.5-sonnet","meta-llama/llama-3.1-8b-instruct"];
const REVIEWER_MODELS = ["openai/gpt-4o-mini","openai/gpt-4o","google/gemini-2.0-flash-001","anthropic/claude-3-haiku","anthropic/claude-3.5-sonnet","meta-llama/llama-3.1-8b-instruct"];

export default function AdminAICosts() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortDate, setSortDate] = useState("desc");
  const [showSettings, setShowSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [generatorModel, setGeneratorModel] = useState("google/gemini-2.0-flash-001");
  const [reviewerModel, setReviewerModel] = useState("openai/gpt-4o-mini");
  const [promptInstructions, setPromptInstructions] = useState("");
  const [monthlyLimit, setMonthlyLimit] = useState("5.00");

  useEffect(() => { fetchLogs(); fetchSettings(); }, [sortDate]);

  const fetchSettings = async () => {
    const { data } = await supabase.from("platform_settings").select("*");
    if (!data) return;
    const get = (key: string) => data.find((s: any) => s.key === key)?.value;
    if (get("ai_generator_model")) setGeneratorModel(get("ai_generator_model"));
    if (get("ai_reviewer_model")) setReviewerModel(get("ai_reviewer_model"));
    if (get("ai_prompt_instructions")) setPromptInstructions(get("ai_prompt_instructions"));
    if (get("ai_monthly_limit_eur")) setMonthlyLimit(get("ai_monthly_limit_eur"));
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    const settings = [
      { key: "ai_generator_model", value: generatorModel },
      { key: "ai_reviewer_model", value: reviewerModel },
      { key: "ai_prompt_instructions", value: promptInstructions },
      { key: "ai_monthly_limit_eur", value: monthlyLimit },
    ];
    for (const s of settings) {
      await supabase.from("platform_settings").upsert({ key: s.key, value: s.value }, { onConflict: "key" });
    }
    setSavingSettings(false);
    toast({ title: "AI settings saved ✅" });
  };

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase.from("ai_generation_logs").select("*").order("created_at", { ascending: sortDate === "asc" });
    setLogs(data || []);
    setLoading(false);
  };

  const totalEur = logs.reduce((sum, l) => sum + (l.cost_eur || 0), 0);
  const totalUsd = logs.reduce((sum, l) => sum + (l.cost_usd || 0), 0);
  const now = new Date();
  const thisMonthLogs = logs.filter(l => { const d = new Date(l.created_at); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
  const monthlyEur = thisMonthLogs.reduce((sum, l) => sum + (l.cost_eur || 0), 0);
  const limitEur = parseFloat(monthlyLimit) || 5;
  const limitPct = Math.min((monthlyEur / limitEur) * 100, 100);

  const byDate = logs.reduce((acc, log) => {
    const date = new Date(log.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    if (!acc[date]) acc[date] = { logs: [], totalEur: 0 };
    acc[date].logs.push(log);
    acc[date].totalEur += log.cost_eur || 0;
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Euro className="w-6 h-6 text-accent" /> AI Costs
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Track AI generation costs and configure models</p>
        </div>
        <Button onClick={() => setShowSettings(!showSettings)} variant="outline" className="gap-2">
          <Settings className="w-4 h-4" /> {showSettings ? "Hide Settings" : "AI Settings"}
        </Button>
      </div>

      {showSettings && (
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Settings className="w-4 h-4" /> AI Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Generator Model</label>
                <select value={generatorModel} onChange={e => setGeneratorModel(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background">
                  {GENERATOR_MODELS.map(m => <option key={m} value={m}>{m.split("/")[1]}</option>)}
                </select>
                <p className="text-xs text-muted-foreground mt-1">Primary model for generating editorials</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Reviewer Model</label>
                <select value={reviewerModel} onChange={e => setReviewerModel(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background">
                  {REVIEWER_MODELS.map(m => <option key={m} value={m}>{m.split("/")[1]}</option>)}
                </select>
                <p className="text-xs text-muted-foreground mt-1">Model for reviewing and refining output</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Monthly Spend Limit (EUR)</label>
              <Input type="number" step="0.50" min="0" value={monthlyLimit} onChange={e => setMonthlyLimit(e.target.value)} className="max-w-xs" />
              <p className="text-xs text-muted-foreground mt-1">Warning threshold for monthly AI spend</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Custom Prompt Instructions</label>
              <Textarea value={promptInstructions} onChange={e => setPromptInstructions(e.target.value)}
                placeholder="e.g. Always mention the book is available in Malayalam. Focus on emotional storytelling..."
                className="min-h-[100px]" />
              <p className="text-xs text-muted-foreground mt-1">Appended to every editorial generation prompt</p>
            </div>
            <Button onClick={saveSettings} disabled={savingSettings} className="gap-2">
              <Save className="w-4 h-4" /> {savingSettings ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>
      )}

      {monthlyEur > limitEur * 0.8 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-4 pb-3">
            <p className="text-sm text-destructive font-medium">⚠️ Monthly spend €{monthlyEur.toFixed(4)} is {limitPct.toFixed(0)}% of your €{limitEur} limit</p>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-destructive rounded-full transition-all" style={{ width: `${limitPct}%` }} />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-3">
        <select value={sortDate} onChange={e => setSortDate(e.target.value)} className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background">
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 pb-3 text-center"><p className="text-xs text-muted-foreground">Total Generations</p><p className="text-2xl font-bold">{logs.length}</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 text-center"><p className="text-xs text-muted-foreground">Total Cost (EUR)</p><p className="text-2xl font-bold text-accent">€{totalEur.toFixed(4)}</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 text-center"><p className="text-xs text-muted-foreground">Total Cost (USD)</p><p className="text-2xl font-bold">${totalUsd.toFixed(4)}</p></CardContent></Card>
        <Card className={monthlyEur > limitEur * 0.8 ? "border-destructive/50" : ""}><CardContent className="pt-4 pb-3 text-center"><p className="text-xs text-muted-foreground">This Month</p><p className={`text-2xl font-bold ${monthlyEur > limitEur * 0.8 ? "text-destructive" : ""}`}>€{monthlyEur.toFixed(4)}</p><p className="text-xs text-muted-foreground">limit: €{limitEur}</p></CardContent></Card>
      </div>

      {loading ? <p className="text-muted-foreground text-center py-8">Loading...</p> : logs.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No generations yet.</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(byDate).map(([date, data]: [string, any]) => (
            <Card key={date}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" />{date}</CardTitle>
                  <div className="flex gap-2"><Badge variant="outline">€{data.totalEur.toFixed(4)}</Badge><Badge variant="secondary">{data.logs.length} generations</Badge></div>
                </div>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-muted-foreground border-b border-border"><th className="pb-2">Book</th><th className="pb-2">Generator</th><th className="pb-2">Reviewer</th><th className="pb-2">Tokens</th><th className="pb-2">Cost (EUR)</th><th className="pb-2">Time</th></tr></thead>
                  <tbody>
                    {data.logs.map((log: any) => (
                      <tr key={log.id} className="border-b border-border/50">
                        <td className="py-2 font-medium">{log.book_title}</td>
                        <td className="py-2 text-xs text-muted-foreground">{log.generator_model?.split("/")[1]}</td>
                        <td className="py-2 text-xs text-muted-foreground">{log.reviewer_model?.split("/")[1]}</td>
                        <td className="py-2">{log.tokens_used}</td>
                        <td className="py-2 text-accent font-medium">€{(log.cost_eur || 0).toFixed(5)}</td>
                        <td className="py-2 text-xs text-muted-foreground">{new Date(log.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
