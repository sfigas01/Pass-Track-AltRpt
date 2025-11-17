// Reference: Updated with Replit Auth authentication
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
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import Landing from "@/pages/Landing";
import NotFound from "@/pages/not-found";


// Separate component for authenticated dashboard view
function AuthenticatedApp() {
  const { toast } = useToast();
  
  // Handle unauthorized errors by redirecting to login
  const handleError = (error: Error, fallbackMessage: string) => {
    if (isUnauthorizedError(error)) {
      window.location.href = '/api/login';
      return;
    }
    toast({
      title: "Error",
      description: error.message || fallbackMessage,
      variant: "destructive",
    });
  };
  
  // Fetch all class passes for authenticated user
  const { data: passes = [] } = useQuery<ClassPass[]>({
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
    onError: (error: Error) => {
      handleError(error, "Failed to add class pass");
    },
  });

  // Mutation for check-in (class packs)
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
    onError: (error: Error) => {
      handleError(error, "Failed to check in");
    },
  });

  // Mutation for logging usage session (usage-based tracking)
  const logSessionMutation = useMutation({
    mutationFn: async (data: { passId: string; sessionDate: Date; unitsUsed: number }) => {
      const response = await apiRequest('POST', `/api/usage-sessions`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/class-passes'] });
      toast({
        title: "Session Logged",
        description: "Your usage session has been logged successfully!",
      });
    },
    onError: (error: Error) => {
      handleError(error, "Failed to log session");
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
    onError: (error: Error) => {
      handleError(error, "Failed to extend pass");
    },
  });

  // Mutation for archiving a pass
  const archivePassMutation = useMutation({
    mutationFn: async (passId: string) => {
      const response = await apiRequest('POST', `/api/class-passes/${passId}/archive`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/class-passes'] });
      toast({
        title: "Pass Archived",
        description: "Your class pass has been archived and hidden from view.",
      });
    },
    onError: (error: Error) => {
      handleError(error, "Failed to archive pass");
    },
  });

  const handleCheckIn = (passId: string) => {
    checkInMutation.mutate(passId);
  };

  const handleLogSession = (data: { passId: string; sessionDate: Date; unitsUsed: number }) => {
    logSessionMutation.mutate(data);
  };

  const handleViewDetails = (passId: string) => {
    console.log('View details for pass:', passId);
  };

  const handleAddPass = (data: InsertClassPass & { purchaseDate: Date }) => {
    addPassMutation.mutate(data);
  };

  const handleExtendPass = (passId: string, data: { additionalClasses: number; additionalCost: number }) => {
    extendPassMutation.mutate({ passId, data });
  };

  const handleArchive = (passId: string) => {
    archivePassMutation.mutate(passId);
  };

  return (
    <Dashboard 
      passes={passes}
      onCheckIn={handleCheckIn}
      onLogSession={handleLogSession}
      onViewDetails={handleViewDetails}
      onAddPass={handleAddPass}
      onExtendPass={handleExtendPass}
      onArchive={handleArchive}
    />
  );
}

// Main router that switches between landing and dashboard
function PassesRouter() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Show landing page while loading or if not authenticated
  if (isLoading || !isAuthenticated) {
    return <Landing />;
  }

  return <AuthenticatedApp />;
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
