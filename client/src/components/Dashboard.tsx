import { useState, useMemo } from "react";
import { PassCard } from "./PassCard";
import { AddPassModal } from "./AddPassModal";
import { ExtendPassModal } from "./ExtendPassModal";
import { FloatingActionButton } from "./FloatingActionButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, Moon, Sun, DollarSign } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { type ClassPass, type InsertClassPass } from "@shared/schema";
import { useTheme } from "./ThemeProvider";

interface DashboardProps {
  passes?: ClassPass[];
  onCheckIn?: (passId: string) => void;
  onViewDetails?: (passId: string) => void;
  onAddPass?: (data: InsertClassPass & { purchaseDate: Date }) => void;
  onExtendPass?: (passId: string, data: { additionalClasses: number; additionalCost: number }) => void;
}

export function Dashboard({ passes = [], onCheckIn, onViewDetails, onAddPass, onExtendPass }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [extendingPass, setExtendingPass] = useState<ClassPass | null>(null);
  const { theme, setTheme } = useTheme();

  // Filter passes based on search and status
  const filteredPasses = passes.filter(pass => {
    const matchesSearch = pass.studioName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (pass.notes && pass.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterStatus === "all") return matchesSearch;
    
    // Handle non-expiring passes (where expirationDate is null)
    if (!pass.expirationDate) {
      switch (filterStatus) {
        case "active":
          return matchesSearch && pass.remainingClasses > 0;
        case "expiring":
        case "expired":
          return false; // Non-expiring passes can't be expiring or expired
        default:
          return matchesSearch;
      }
    }
    
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

  // Calculate spending analytics
  const spendingAnalytics = useMemo(() => {
    const totalSpent = passes.reduce((sum, pass) => sum + pass.cost, 0);
    
    const spendingByStudio = passes.reduce((acc, pass) => {
      if (!acc[pass.studioName]) {
        acc[pass.studioName] = 0;
      }
      acc[pass.studioName] += pass.cost;
      return acc;
    }, {} as Record<string, number>);

    // Generate colors for pie chart
    const colors = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#f97316', '#3b82f6', '#ec4899'];
    
    const pieData = Object.entries(spendingByStudio).map(([name, amount], index) => ({
      name,
      value: amount / 100, // Convert cents to dollars for display
      color: colors[index % colors.length],
    }));

    return {
      totalSpent,
      spendingByStudio,
      pieData,
    };
  }, [passes]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
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
              placeholder="Search studios or notes..."
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
      <main className="flex-1 px-4 py-4">
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
          <>
            <div className="space-y-4 mb-6" data-testid="passes-list">
              {filteredPasses.map((pass) => (
                <PassCard
                  key={pass.id}
                  pass={pass}
                  onCheckIn={onCheckIn}
                  onViewDetails={onViewDetails}
                  onExtend={() => setExtendingPass(pass)}
                />
              ))}
            </div>
            
            {/* Spending Analytics - Moved to bottom */}
            {passes.length > 0 && (
              <section className="pb-32">
                {/* Total Spent Card */}
                <Card className="p-4 mb-3">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                      <p className="text-2xl font-bold" data-testid="text-total-spent">
                        ${(spendingAnalytics.totalSpent / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Card>
                
                {/* Pie Chart */}
                {spendingAnalytics.pieData.length > 1 && (
                  <Card className="p-4">
                    <h4 className="text-sm font-medium text-center mb-3">Spending by Studio</h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={spendingAnalytics.pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {spendingAnalytics.pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {spendingAnalytics.pieData.map((entry, index) => (
                        <div 
                          key={entry.name} 
                          className="flex items-center gap-2 text-xs"
                          data-testid={`legend-${entry.name.replace(/\s+/g, '-').toLowerCase()}`}
                        >
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="truncate font-medium">{entry.name}</span>
                          <span className="text-muted-foreground">${entry.value.toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </section>
            )}
          </>
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

      {/* Extend Pass Modal */}
      <ExtendPassModal
        open={!!extendingPass}
        onOpenChange={(open) => !open && setExtendingPass(null)}
        pass={extendingPass || undefined}
        onSubmit={(data) => {
          if (extendingPass) {
            onExtendPass?.(extendingPass.id, data);
            setExtendingPass(null);
          }
        }}
      />
    </div>
  );
}