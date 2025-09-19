import { useState } from 'react';
import { BottomNav, type NavItem } from '../BottomNav';

export default function BottomNavExample() {
  const [activeItem, setActiveItem] = useState('home');

  const handleItemClick = (item: NavItem) => {
    console.log('Navigation triggered:', item.label);
    setActiveItem(item.id);
  };

  return (
    <div className="relative h-96 bg-muted/20 border rounded-lg">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">Bottom Navigation</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Mobile-first navigation with active state. Currently active: <strong>{activeItem}</strong>
        </p>
        <div className="space-y-2">
          <p className="text-sm">✓ Touch-friendly 44px+ targets</p>
          <p className="text-sm">✓ Clear visual feedback</p>
          <p className="text-sm">✓ Accessible labels</p>
        </div>
      </div>
      <BottomNav 
        activeItem={activeItem}
        onItemClick={handleItemClick}
      />
    </div>
  );
}