import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { type InsertClassPass } from "@shared/schema";

interface AddPassModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (data: InsertClassPass & { purchaseDate: Date }) => void;
  children?: React.ReactNode;
}

export function AddPassModal({ open, onOpenChange, onSubmit, children }: AddPassModalProps) {
  const [formData, setFormData] = useState<Partial<InsertClassPass>>({});
  const [expirationDate, setExpirationDate] = useState<Date>();
  const [doesNotExpire, setDoesNotExpire] = useState(false);
  const [costDisplayValue, setCostDisplayValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse cost from display value
    const costValue = parseFloat(costDisplayValue) || 0;
    const costInCents = Math.round(costValue * 100);
    
    // Validate required fields (cost can be 0, so check for valid number)
    if (!formData.studioName || !formData.totalClasses || costDisplayValue === '' || (!expirationDate && !doesNotExpire)) {
      return;
    }

    const passData = {
      studioName: formData.studioName,
      totalClasses: formData.totalClasses,
      cost: costInCents,
      notes: formData.notes || undefined,
      expirationDate: doesNotExpire ? undefined : expirationDate,
      purchaseDate: new Date(), // Auto-fill with today's date
    };

    onSubmit?.(passData);
    
    // Reset form
    setFormData({});
    setExpirationDate(undefined);
    setDoesNotExpire(false);
    setCostDisplayValue('');
    onOpenChange?.(false);
  };

  const updateFormData = (field: keyof InsertClassPass, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-md" data-testid="modal-add-pass">
        <DialogHeader>
          <DialogTitle>Add New Class Pass</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studioName">Studio Name</Label>
            <Input
              id="studioName"
              placeholder="e.g. CorePower Yoga"
              value={formData.studioName || ''}
              onChange={(e) => updateFormData('studioName', e.target.value)}
              data-testid="input-studio-name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalClasses">Number of Classes</Label>
            <Input
              id="totalClasses"
              type="number"
              min="1"
              placeholder="10"
              value={formData.totalClasses || ''}
              onChange={(e) => updateFormData('totalClasses', parseInt(e.target.value) || 0)}
              data-testid="input-total-classes"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost">Cost</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
              <Input
                id="cost"
                type="text"
                inputMode="decimal"
                placeholder="120.00"
                className="pl-8"
                value={costDisplayValue}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  // Allow typing numbers and one decimal point
                  if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
                    setCostDisplayValue(inputValue);
                  }
                }}
                data-testid="input-cost"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Expiration Date</Label>
            
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox
                id="does-not-expire"
                checked={doesNotExpire}
                onCheckedChange={(checked) => {
                  setDoesNotExpire(!!checked);
                  if (checked) {
                    setExpirationDate(undefined);
                  }
                }}
                data-testid="checkbox-does-not-expire"
              />
              <Label
                htmlFor="does-not-expire"
                className="text-sm font-normal cursor-pointer"
              >
                This pass does not expire
              </Label>
            </div>

            {!doesNotExpire && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expirationDate && "text-muted-foreground"
                    )}
                    data-testid="button-expiration-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expirationDate ? format(expirationDate, "MMM d, yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expirationDate}
                    onSelect={setExpirationDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}

            {doesNotExpire && (
              <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-md">
                This pass will never expire and can be used indefinitely.
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this pass..."
              value={formData.notes || ''}
              onChange={(e) => updateFormData('notes', e.target.value)}
              data-testid="input-notes"
              className="resize-none"
              rows={3}
            />
          </div>

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
              data-testid="button-save-pass"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Pass
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}