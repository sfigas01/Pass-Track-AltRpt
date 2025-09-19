import { ThemeProvider } from '../ThemeProvider';
import { Button } from '@/components/ui/button';
import { useTheme } from '../ThemeProvider';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? "Light" : "Dark"} Mode
    </Button>
  );
}

export default function ThemeProviderExample() {
  return (
    <ThemeProvider defaultTheme="light">
      <div className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Theme Provider Example</h3>
        <ThemeToggle />
        <div className="p-4 border rounded-md bg-card text-card-foreground">
          <p>This card adapts to the current theme</p>
        </div>
      </div>
    </ThemeProvider>
  );
}