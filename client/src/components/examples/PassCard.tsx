import { PassCard } from '../PassCard';
import { type ClassPass } from '@shared/schema';

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
    passType: 'Unlimited Monthly',
    totalClasses: 20,
    remainingClasses: 12,
    purchaseDate: new Date('2024-01-01'),
    expirationDate: new Date('2024-02-01'),
  },
  {
    id: '3',
    studioName: 'Barry\'s Bootcamp',
    passType: '5-Class Pack',
    totalClasses: 5,
    remainingClasses: 0,
    purchaseDate: new Date('2023-12-01'),
    expirationDate: new Date('2023-12-31'),
  },
];

export default function PassCardExample() {
  const handleCheckIn = (id: string) => {
    console.log('Check in triggered for pass:', id);
  };

  const handleViewDetails = (id: string) => {
    console.log('View details triggered for pass:', id);
  };

  return (
    <div className="p-4 space-y-4 max-w-sm">
      <h3 className="text-lg font-semibold mb-4">Pass Cards Examples</h3>
      {mockPasses.map((pass) => (
        <PassCard
          key={pass.id}
          pass={pass}
          onCheckIn={handleCheckIn}
          onViewDetails={handleViewDetails}
        />
      ))}
    </div>
  );
}