import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { type ClassPass } from "@shared/schema";

interface LogSessionModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  pass: ClassPass | null;
  onSubmit?: (data: { passId: string; sessionDate: Date; unitsUsed: number }) => void;
}

export function LogSessionModal({ open, onOpenChange, pass, onSubmit }: LogSessionModalProps) {
  const [sessionDate, setSessionDate] = useState<Date>(new Date());
  const [unitsUsed, setUnitsUsed] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pass || !unitsUsed || parseFloat(unitsUsed) <= 0) {
      return;
    }

    onSubmit?.({
      passId: pass.id,
      sessionDate,
      unitsUsed: parseFloat(unitsUsed),
    });
    
    // Reset form
    setSessionDate(new Date());
    setUnitsUsed('');
    onOpenChange?.(false);
  };

  if (!pass) return null;

  const calculatedCost = ((pass.costPerUnit || 0) / 100) * parseFloat(unitsUsed || '0');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="modal-log-session">
        <DialogHeader>
          <DialogTitle>Log Session - {pass.studioName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Session Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !sessionDate && "text-muted-foreground"
                  )}
                  data-testid="button-session-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {sessionDate ? format(sessionDate, "MMM d, yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={sessionDate}
                  onSelect={(date) => date && setSessionDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unitsUsed">
              {pass.unitType ? `${pass.unitType.charAt(0).toUpperCase()}${pass.unitType.slice(1)} Used` : 'Units Used'}
            </Label>
            <Input
              id="unitsUsed"
              type="text"
              inputMode="decimal"
              placeholder="2.5"
              value={unitsUsed}
              onChange={(e) => {
                const inputValue = e.target.value;
                if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
                  setUnitsUsed(inputValue);
                }
              }}
              data-testid="input-units-used"
              required
            />
          </div>

          {unitsUsed && parseFloat(unitsUsed) > 0 && (
            <div className="p-3 bg-muted/30 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Calculated Cost:</span>
                <span className="text-lg font-semibold text-primary">
                  ${calculatedCost.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange?.(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              data-testid="button-save-session"
            >
              <Plus className="w-4 h-4 mr-1" />
              Log Session
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
