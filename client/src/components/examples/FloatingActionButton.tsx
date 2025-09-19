import { FloatingActionButton } from '../FloatingActionButton';

export default function FloatingActionButtonExample() {
  const handleAddPass = () => {
    console.log('Add pass triggered');
  };

  return (
    <div className="relative h-48 bg-muted/20 border rounded-lg">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">Floating Action Button</h3>
        <p className="text-sm text-muted-foreground">
          The floating action button is positioned fixed in the bottom right corner.
        </p>
      </div>
      <FloatingActionButton 
        onClick={handleAddPass}
        className="absolute bottom-4 right-4 static"
      />
    </div>
  );
}