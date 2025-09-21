import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Dashboard } from "@/components/Dashboard";
import { type ClassPass, type InsertClassPass } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import NotFound from "@/pages/not-found";


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

  // Mutation for extending a pass
  const extendPassMutation = useMutation({
    mutationFn: async ({ passId, data }: { passId: string; data: { additionalClasses: number; additionalCost: number } }) => {
      const response = await apiRequest('POST', `/api/class-passes/${passId}/extend`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/class-passes'] });
      toast({
        title: "Pass Extended",
        description: "Your class pass has been extended successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to extend pass",
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

  const handleExtendPass = (passId: string, data: { additionalClasses: number; additionalCost: number }) => {
    extendPassMutation.mutate({ passId, data });
  };

  return (
    <Dashboard 
      passes={passes}
      onCheckIn={handleCheckIn}
      onViewDetails={handleViewDetails}
      onAddPass={handleAddPass}
      onExtendPass={handleExtendPass}
    />
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="light">
          <div className="h-screen flex flex-col bg-background">
            <PassesRouter />
          </div>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
