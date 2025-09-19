import { Button } from "@/components/ui/button";
import { Home, Calendar, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
};

const navItems: NavItem[] = [
  { id: 'home', label: 'Passes', icon: Home, path: '/' },
  { id: 'schedule', label: 'Schedule', icon: Calendar, path: '/schedule' },
  { id: 'stats', label: 'Stats', icon: BarChart3, path: '/stats' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

interface BottomNavProps {
  activeItem?: string;
  onItemClick?: (item: NavItem) => void;
}

export function BottomNav({ activeItem = 'home', onItemClick }: BottomNavProps) {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t"
      data-testid="nav-bottom"
    >
      <div className="flex items-center justify-around py-2 px-4 safe-area-padding-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={cn(
                "flex flex-col items-center gap-1 p-2 h-auto min-h-12",
                "hover-elevate active-elevate-2",
                isActive && "text-primary"
              )}
              onClick={() => onItemClick?.(item)}
              data-testid={`nav-${item.id}`}
            >
              <Icon className={cn(
                "h-5 w-5 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-xs transition-colors",
                isActive ? "text-primary font-medium" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}