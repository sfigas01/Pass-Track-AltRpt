import { useState } from 'react';
import { AddPassModal } from '../AddPassModal';
import { Button } from '@/components/ui/button';
import { type InsertClassPass } from '@shared/schema';

export default function AddPassModalExample() {
  const [open, setOpen] = useState(false);
  const [submittedData, setSubmittedData] = useState<InsertClassPass | null>(null);

  const handleSubmit = (data: InsertClassPass) => {
    console.log('Form submitted with data:', data);
    setSubmittedData(data);
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Add Pass Modal Example</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Click the button below to open the add pass modal.
      </p>
      
      <AddPassModal 
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleSubmit}
      >
        <Button>Open Add Pass Modal</Button>
      </AddPassModal>

      {submittedData && (
        <div className="mt-4 p-3 bg-muted/50 rounded-md">
          <h4 className="font-medium text-sm mb-2">Last submitted data:</h4>
          <pre className="text-xs text-muted-foreground">
            {JSON.stringify(submittedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}