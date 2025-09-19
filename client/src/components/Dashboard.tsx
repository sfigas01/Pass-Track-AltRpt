import { useState } from "react";
import { PassCard } from "./PassCard";
import { AddPassModal } from "./AddPassModal";
import { FloatingActionButton } from "./FloatingActionButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Moon, Sun } from "lucide-react";
import { type ClassPass, type InsertClassPass } from "@shared/schema";
import { useTheme } from "./ThemeProvider";

interface DashboardProps {
  passes?: ClassPass[];
  onCheckIn?: (passId: string) => void;
  onViewDetails?: (passId: string) => void;
  onAddPass?: (data: InsertClassPass) => void;
}

export function Dashboard({ passes = [], onCheckIn, onViewDetails, onAddPass }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const { theme, setTheme } = useTheme();

  // Filter passes based on search and status
  const filteredPasses = passes.filter(pass => {
    const matchesSearch = pass.studioName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pass.passType.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    
    const daysUntilExpiry = Math.ceil((new Date(pass.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    switch (filterStatus) {
      case "active":
        return matchesSearch && pass.remainingClasses > 0 && daysUntilExpiry > 0;
      case "expiring":
        return matchesSearch && daysUntilExpiry <= 7 && daysUntilExpiry > 0;
      case "expired":
        return matchesSearch && (daysUntilExpiry <= 0 || pass.remainingClasses === 0);
      default:
        return matchesSearch;
    }
  });

  const getEmptyStateMessage = () => {
    if (passes.length === 0) {
      return {
        title: "No class passes yet",
        description: "Add your first class pass to start tracking your fitness journey!"
      };
    }
    
    if (filteredPasses.length === 0) {
      return {
        title: "No passes match your filters",
        description: "Try adjusting your search or filter to find your passes."
      };
    }
    
    return null;
  };

  const emptyState = getEmptyStateMessage();

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold" data-testid="title-app">FitPass</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
        
        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search studios or pass types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32" data-testid="select-filter">
              <Filter className="h-4 w-4 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expiring">Expiring</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto px-4 py-4 pb-20">
        {emptyState ? (
          <div className="flex flex-col items-center justify-center h-64 text-center" data-testid="empty-state">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Filter className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{emptyState.title}</h3>
            <p className="text-muted-foreground text-sm max-w-sm">{emptyState.description}</p>
            {passes.length === 0 && (
              <Button 
                onClick={() => setShowAddModal(true)} 
                className="mt-4"
                data-testid="button-add-first-pass"
              >
                Add Your First Pass
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4" data-testid="passes-list">
            {filteredPasses.map((pass) => (
              <PassCard
                key={pass.id}
                pass={pass}
                onCheckIn={onCheckIn}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => setShowAddModal(true)} />

      {/* Add Pass Modal */}
      <AddPassModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSubmit={(data) => {
          onAddPass?.(data);
          setShowAddModal(false);
        }}
      />
    </div>
  );
}