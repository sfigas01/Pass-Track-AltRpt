import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Dashboard } from "@/components/Dashboard";
import { BottomNav, type NavItem } from "@/components/BottomNav";
import { type ClassPass, type InsertClassPass } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import NotFound from "@/pages/not-found";

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col h-full bg-background">
      <header className="sticky top-0 z-30 bg-background border-b px-4 py-3">
        <h1 className="text-xl font-bold">{title}</h1>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 pb-20">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Coming Soon</h2>
          <p className="text-muted-foreground">This feature is under development</p>
        </div>
      </main>
    </div>
  );
}

function PassesRouter() {
  const { toast } = useToast();
  
  // Fetch all class passes
  const { data: passes = [], isLoading, refetch } = useQuery<ClassPass[]>({
    queryKey: ['/api/class-passes'],
  });

  // Mutation for adding a new pass
  const addPassMutation = useMutation({
    mutationFn: async (data: InsertClassPass & { purchaseDate: Date }) => {
      const response = await apiRequest('POST', '/api/class-passes', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/class-passes'] });
      toast({
        title: "Pass Added",
        description: "Your new class pass has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add class pass",
        variant: "destructive",
      });
    },
  });

  // Mutation for check-in
  const checkInMutation = useMutation({
    mutationFn: async (passId: string) => {
      const response = await apiRequest('POST', `/api/class-passes/${passId}/check-in`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/class-passes'] });
      toast({
        title: "Checked In",
        description: "Successfully checked in to your class!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to check in",
        variant: "destructive",
      });
    },
  });

  const handleCheckIn = (passId: string) => {
    checkInMutation.mutate(passId);
  };

  const handleViewDetails = (passId: string) => {
    console.log('View details for pass:', passId);
    // TODO: Navigate to details page or open modal
  };

  const handleAddPass = (data: InsertClassPass & { purchaseDate: Date }) => {
    addPassMutation.mutate(data);
  };

  return (
    <Switch>
      <Route path="/">
        <Dashboard 
          passes={passes}
          onCheckIn={handleCheckIn}
          onViewDetails={handleViewDetails}
          onAddPass={handleAddPass}
        />
      </Route>
      <Route path="/schedule">
        <PlaceholderPage title="Schedule" />
      </Route>
      <Route path="/stats">
        <PlaceholderPage title="Stats" />
      </Route>
      <Route path="/settings">
        <PlaceholderPage title="Settings" />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [activeNav, setActiveNav] = useState('home');

  const handleNavClick = (item: NavItem) => {
    console.log('Navigation to:', item.path);
    setActiveNav(item.id);
    // In a real app with wouter, you'd navigate to item.path
    window.history.pushState({}, '', item.path);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="light">
          <div className="h-screen flex flex-col bg-background">
            <main className="flex-1 overflow-hidden">
              <PassesRouter />
            </main>
            <BottomNav 
              activeItem={activeNav}
              onItemClick={handleNavClick}
            />
          </div>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
