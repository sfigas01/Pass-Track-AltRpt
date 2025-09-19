import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onClick?: () => void;
  className?: string;
}

export function FloatingActionButton({ onClick, className }: FloatingActionButtonProps) {
  return (
    <Button
      size="icon"
      className={cn(
        "fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full shadow-lg",
        "hover:shadow-xl transition-shadow duration-200",
        className
      )}
      onClick={onClick}
      data-testid="button-add-pass"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}