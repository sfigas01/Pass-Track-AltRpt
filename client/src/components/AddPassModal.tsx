import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

type TrackingType = 'class_pack' | 'usage_based';

export function AddPassModal({ open, onOpenChange, onSubmit, children }: AddPassModalProps) {
  const [trackingType, setTrackingType] = useState<TrackingType>('class_pack');
  const [formData, setFormData] = useState<any>({});
  const [expirationDate, setExpirationDate] = useState<Date>();
  const [doesNotExpire, setDoesNotExpire] = useState(false);
  const [costDisplayValue, setCostDisplayValue] = useState('');
  const [membershipFeeValue, setMembershipFeeValue] = useState('');
  const [costPerUnitValue, setCostPerUnitValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let passData: any;
    
    if (trackingType === 'class_pack') {
      // Parse cost from display value
      const costValue = parseFloat(costDisplayValue) || 0;
      const costInCents = Math.round(costValue * 100);
      
      // Validate required fields
      if (!formData.studioName || !formData.totalClasses || costDisplayValue === '') {
        return;
      }

      passData = {
        trackingType: 'class_pack' as const,
        studioName: formData.studioName,
        totalClasses: formData.totalClasses,
        cost: costInCents,
        notes: formData.notes || undefined,
        expirationDate: doesNotExpire ? undefined : expirationDate,
        purchaseDate: new Date(),
      };
    } else {
      // Usage-based tracking
      const costPerUnit = parseFloat(costPerUnitValue) || 0;
      const costPerUnitCents = Math.round(costPerUnit * 100);
      const membershipFee = parseFloat(membershipFeeValue) || 0;
      const membershipFeeCents = Math.round(membershipFee * 100);
      
      // Validate required fields
      if (!formData.studioName || !formData.unitType || costPerUnitValue === '') {
        return;
      }

      passData = {
        trackingType: 'usage_based' as const,
        studioName: formData.studioName,
        unitType: formData.unitType,
        costPerUnit: costPerUnitCents,
        membershipFee: membershipFeeCents || undefined,
        membershipPeriod: formData.membershipPeriod || undefined,
        cost: membershipFeeCents, // Store membership fee in cost field
        notes: formData.notes || undefined,
        expirationDate: doesNotExpire ? undefined : expirationDate,
        purchaseDate: new Date(),
      };
    }

    onSubmit?.(passData);
    
    // Reset form
    setFormData({});
    setExpirationDate(undefined);
    setDoesNotExpire(false);
    setCostDisplayValue('');
    setMembershipFeeValue('');
    setCostPerUnitValue('');
    setTrackingType('class_pack');
    onOpenChange?.(false);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" data-testid="modal-add-pass">
        <DialogHeader>
          <DialogTitle>Add New Pass</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tracking Type Toggle */}
          <div className="space-y-2">
            <Label>Tracking Type</Label>
            <Tabs value={trackingType} onValueChange={(value) => setTrackingType(value as TrackingType)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="class_pack" data-testid="tab-class-pack">Class Pack</TabsTrigger>
                <TabsTrigger value="usage_based" data-testid="tab-usage-based">Pay Per Use</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="space-y-2">
            <Label htmlFor="studioName">{trackingType === 'class_pack' ? 'Studio Name' : 'Activity Name'}</Label>
            <Input
              id="studioName"
              placeholder={trackingType === 'class_pack' ? 'e.g. CorePower Yoga' : 'e.g. Golf Simulator'}
              value={formData.studioName || ''}
              onChange={(e) => updateFormData('studioName', e.target.value)}
              data-testid="input-studio-name"
              required
            />
          </div>

          {trackingType === 'class_pack' ? (
            <>
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
                      if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
                        setCostDisplayValue(inputValue);
                      }
                    }}
                    data-testid="input-cost"
                    required
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="unitType">Unit Type</Label>
                <Select value={formData.unitType || ''} onValueChange={(value) => updateFormData('unitType', value)}>
                  <SelectTrigger data-testid="select-unit-type">
                    <SelectValue placeholder="Select unit type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="sessions">Sessions</SelectItem>
                    <SelectItem value="visits">Visits</SelectItem>
                    <SelectItem value="classes">Classes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="costPerUnit">Cost Per {formData.unitType || 'Unit'}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                  <Input
                    id="costPerUnit"
                    type="text"
                    inputMode="decimal"
                    placeholder="25.00"
                    className="pl-8"
                    value={costPerUnitValue}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
                        setCostPerUnitValue(inputValue);
                      }
                    }}
                    data-testid="input-cost-per-unit"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="membershipFee">Membership Fee (Optional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                  <Input
                    id="membershipFee"
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    className="pl-8"
                    value={membershipFeeValue}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
                        setMembershipFeeValue(inputValue);
                      }
                    }}
                    data-testid="input-membership-fee"
                  />
                </div>
              </div>

              {membershipFeeValue && parseFloat(membershipFeeValue) > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="membershipPeriod">Membership Period</Label>
                  <Select value={formData.membershipPeriod || ''} onValueChange={(value) => updateFormData('membershipPeriod', value)}>
                    <SelectTrigger data-testid="select-membership-period">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="one_time">One Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}

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