import { useState } from 'react';
import { Dashboard } from '../Dashboard';
import { ThemeProvider } from '../ThemeProvider';
import { type ClassPass, type InsertClassPass } from '@shared/schema';

// todo: remove mock functionality
const mockPasses: ClassPass[] = [
  {
    id: '1',
    studioName: 'CorePower Yoga',
    totalClasses: 10,
    remainingClasses: 7,
    purchaseDate: new Date('2024-01-15'),
    expirationDate: new Date('2024-04-15'),
    notes: null,
  },
  {
    id: '2',
    studioName: 'SoulCycle',
    totalClasses: 20,
    remainingClasses: 12,
    purchaseDate: new Date('2024-01-01'),
    expirationDate: new Date('2024-02-01'),
    notes: 'Monthly unlimited pass',
  },
  {
    id: '3',
    studioName: "Barry's Bootcamp",
    totalClasses: 5,
    remainingClasses: 0,
    purchaseDate: new Date('2023-12-01'),
    expirationDate: new Date('2023-12-31'),
    notes: null,
  },
  {
    id: '4',
    studioName: 'Orange Theory',
    totalClasses: 8,
    remainingClasses: 3,
    purchaseDate: new Date('2024-01-20'),
    expirationDate: new Date('2024-03-20'),
    notes: 'Great HIIT workouts',
  },
];

export default function DashboardExample() {
  const [passes, setPasses] = useState<ClassPass[]>(mockPasses);

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

  const handleAddPass = (data: InsertClassPass & { purchaseDate: Date }) => {
    console.log('Adding new pass:', data);
    const newPass: ClassPass = {
      id: Date.now().toString(),
      studioName: data.studioName,
      totalClasses: data.totalClasses,
      remainingClasses: data.totalClasses,
      purchaseDate: data.purchaseDate,
      expirationDate: data.expirationDate,
      notes: data.notes || null,
    };
    setPasses(prev => [newPass, ...prev]);
  };

  return (
    <ThemeProvider>
      <div className="h-screen">
        <Dashboard
          passes={passes}
          onCheckIn={handleCheckIn}
          onViewDetails={handleViewDetails}
          onAddPass={handleAddPass}
        />
      </div>
    </ThemeProvider>
  );
}