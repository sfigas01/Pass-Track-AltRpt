import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { type ClassPass } from "@shared/schema";

const extendPassSchema = z.object({
  additionalClasses: z.coerce.number().min(1, "Must add at least 1 class").max(50, "Cannot add more than 50 classes"),
  additionalCost: z.coerce.number().min(0, "Cost cannot be negative"),
});

type ExtendPassForm = z.infer<typeof extendPassSchema>;

interface ExtendPassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ExtendPassForm) => void;
  pass?: ClassPass;
}

export function ExtendPassModal({
  open,
  onOpenChange,
  onSubmit,
  pass,
}: ExtendPassModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ExtendPassForm>({
    resolver: zodResolver(extendPassSchema),
    defaultValues: {
      additionalClasses: 1,
      additionalCost: 0,
    },
  });

  const handleSubmit = async (data: ExtendPassForm) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to extend pass:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="modal-extend-pass">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Extend Pass
          </DialogTitle>
          {pass && (
            <p className="text-sm text-muted-foreground">
              Adding classes to {pass.studioName}
            </p>
          )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="additionalClasses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Classes</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Number of classes to add"
                      {...field}
                      data-testid="input-additional-classes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additionalCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Cost ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      data-testid="input-additional-cost"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {pass && (
              <div className="p-3 bg-muted/30 rounded-md text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Current classes:</span>
                  <span className="font-medium">{pass.totalClasses}</span>
                </div>
                <div className="flex justify-between">
                  <span>Classes remaining:</span>
                  <span className="font-medium">{pass.remainingClasses}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current cost:</span>
                  <span className="font-medium">${(pass.cost / 100).toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-extend"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
                data-testid="button-submit-extend"
              >
                {isSubmitting ? "Extending..." : "Extend Pass"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}