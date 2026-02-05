import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSettings, useUpdateSettings } from "@/hooks/use-chat";
import { CyberButton } from "./CyberButton";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Settings } from "@shared/schema";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();
  
  const form = useForm<Settings>({
    defaultValues: {
      systemPrompt: "",
      model: "gpt-5",
      temperature: 1
    }
  });

  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  const onSubmit = (data: Partial<Settings>) => {
    updateMutation.mutate(data, {
      onSuccess: () => onOpenChange(false)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-primary/20 text-foreground max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-mono text-xl tracking-widest text-primary flex items-center gap-2">
            <span className="w-2 h-2 bg-primary animate-pulse rounded-full" />
            SYSTEM CONFIGURATION
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="h-40 flex items-center justify-center font-mono animate-pulse">
            LOADING CONFIG...
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="model" className="font-mono text-xs uppercase text-muted-foreground">AI Model Core</Label>
              <Input
                id="model"
                {...form.register("model")}
                className="bg-background/50 border-primary/20 focus:border-primary font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature" className="font-mono text-xs uppercase text-muted-foreground">Entropy (Temperature)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  {...form.register("temperature", { valueAsNumber: true })}
                  className="bg-background/50 border-primary/20 focus:border-primary font-mono w-24"
                />
                <span className="text-xs text-muted-foreground">Higher = more creative/chaotic</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="systemPrompt" className="font-mono text-xs uppercase text-muted-foreground">System Persona Protocol</Label>
              <Textarea
                id="systemPrompt"
                {...form.register("systemPrompt")}
                className="bg-background/50 border-primary/20 focus:border-primary font-mono min-h-[150px] text-sm"
                placeholder="Define the AI persona here..."
              />
              <p className="text-[10px] text-muted-foreground">
                WARNING: Modifying core persona parameters may result in unfiltered outputs. Proceed with caution.
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t border-border/30">
              <CyberButton 
                type="submit" 
                disabled={updateMutation.isPending}
                className="w-full sm:w-auto"
              >
                {updateMutation.isPending ? "OVERWRITING..." : "SAVE CONFIGURATION"}
              </CyberButton>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
