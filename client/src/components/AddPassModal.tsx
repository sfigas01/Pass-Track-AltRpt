import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.studioName || !formData.totalClasses || !expirationDate) {
      return;
    }

    const passData = {
      studioName: formData.studioName,
      totalClasses: formData.totalClasses,
      notes: formData.notes || undefined,
      expirationDate,
      purchaseDate: new Date(), // Auto-fill with today's date
    };

    onSubmit?.(passData);
    
    // Reset form
    setFormData({});
    setExpirationDate(undefined);
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
              max="50"
              placeholder="10"
              value={formData.totalClasses || ''}
              onChange={(e) => updateFormData('totalClasses', parseInt(e.target.value) || 0)}
              data-testid="input-total-classes"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Expiration Date</Label>
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