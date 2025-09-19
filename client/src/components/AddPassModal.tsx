import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { type InsertClassPass } from "@shared/schema";

interface AddPassModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (data: InsertClassPass) => void;
  children?: React.ReactNode;
}

const passTypes = [
  { value: '5-class-pack', label: '5-Class Pack' },
  { value: '10-class-pack', label: '10-Class Package' },
  { value: '20-class-pack', label: '20-Class Package' },
  { value: 'monthly-unlimited', label: 'Monthly Unlimited' },
  { value: 'weekly-unlimited', label: 'Weekly Unlimited' },
  { value: 'single-class', label: 'Single Class' },
];

export function AddPassModal({ open, onOpenChange, onSubmit, children }: AddPassModalProps) {
  const [formData, setFormData] = useState<Partial<InsertClassPass>>({});
  const [purchaseDate, setPurchaseDate] = useState<Date>();
  const [expirationDate, setExpirationDate] = useState<Date>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.studioName || !formData.passType || !formData.totalClasses || !purchaseDate || !expirationDate) {
      return;
    }

    const passData: InsertClassPass = {
      studioName: formData.studioName,
      passType: formData.passType,
      totalClasses: formData.totalClasses,
      purchaseDate,
      expirationDate,
    };

    onSubmit?.(passData);
    
    // Reset form
    setFormData({});
    setPurchaseDate(undefined);
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
            <Label htmlFor="passType">Pass Type</Label>
            <Select 
              value={formData.passType || ''} 
              onValueChange={(value) => updateFormData('passType', value)}
              required
            >
              <SelectTrigger data-testid="select-pass-type">
                <SelectValue placeholder="Select pass type" />
              </SelectTrigger>
              <SelectContent>
                {passTypes.map((type) => (
                  <SelectItem key={type.value} value={type.label}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Purchase Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !purchaseDate && "text-muted-foreground"
                    )}
                    data-testid="button-purchase-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {purchaseDate ? format(purchaseDate, "MMM d, yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={purchaseDate}
                    onSelect={setPurchaseDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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