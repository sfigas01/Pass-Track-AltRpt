import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Dashboard } from "@/components/Dashboard";
import { BottomNav, type NavItem } from "@/components/BottomNav";
import { type ClassPass, type InsertClassPass } from "@shared/schema";
import NotFound from "@/pages/not-found";

// todo: remove mock functionality
const mockPasses: ClassPass[] = [
  {
    id: '1',
    studioName: 'CorePower Yoga',
    passType: '10-Class Package',
    totalClasses: 10,
    remainingClasses: 7,
    purchaseDate: new Date('2024-01-15'),
    expirationDate: new Date('2024-04-15'),
  },
  {
    id: '2',
    studioName: 'SoulCycle',
    passType: 'Monthly Unlimited',
    totalClasses: 20,
    remainingClasses: 12,
    purchaseDate: new Date('2024-01-01'),
    expirationDate: new Date('2024-02-01'),
  },
  {
    id: '3',
    studioName: "Barry's Bootcamp",
    passType: '5-Class Pack',
    totalClasses: 5,
    remainingClasses: 0,
    purchaseDate: new Date('2023-12-01'),
    expirationDate: new Date('2023-12-31'),
  },
  {
    id: '4',
    studioName: 'Orange Theory',
    passType: '8-Class Package',
    totalClasses: 8,
    remainingClasses: 3,
    purchaseDate: new Date('2024-01-20'),
    expirationDate: new Date('2024-03-20'),
  },
];

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

function Router({ passes, onCheckIn, onViewDetails, onAddPass }: {
  passes: ClassPass[];
  onCheckIn: (passId: string) => void;
  onViewDetails: (passId: string) => void;
  onAddPass: (data: InsertClassPass) => void;
}) {
  return (
    <Switch>
      <Route path="/">
        <Dashboard 
          passes={passes}
          onCheckIn={onCheckIn}
          onViewDetails={onViewDetails}
          onAddPass={onAddPass}
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
  const [passes, setPasses] = useState<ClassPass[]>(mockPasses);
  const [activeNav, setActiveNav] = useState('home');

  const handleCheckIn = (passId: string) => {
    console.log('Check in for pass:', passId);
    setPasses(prev => prev.map(pass => 
      pass.id === passId && pass.remainingClasses > 0
        ? { ...pass, remainingClasses: pass.remainingClasses - 1 }
        : pass
    ));
  };

  const handleViewDetails = (passId: string) => {
    console.log('View details for pass:', passId);
  };

  const handleAddPass = (data: InsertClassPass) => {
    console.log('Adding new pass:', data);
    const newPass: ClassPass = {
      id: Date.now().toString(),
      ...data,
      remainingClasses: data.totalClasses,
    };
    setPasses(prev => [newPass, ...prev]);
  };

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
              <Router 
                passes={passes}
                onCheckIn={handleCheckIn}
                onViewDetails={handleViewDetails}
                onAddPass={handleAddPass}
              />
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
