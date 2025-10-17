import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, Calendar, TrendingUp, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="px-4 py-6 flex justify-between items-center max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold">PassTrack</h1>
        <Button
          onClick={() => window.location.href = '/api/login'}
          data-testid="button-login"
        >
          Log In
        </Button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Track Your Fitness Classes
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Never lose track of your gym passes again. Manage all your studio memberships in one simple app.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => window.location.href = '/api/login'}
              className="text-lg"
              data-testid="button-get-started"
            >
              Get Started Free
            </Button>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <Card className="p-6 space-y-3">
              <Activity className="w-10 h-10 text-primary" />
              <h3 className="font-semibold">Track Classes</h3>
              <p className="text-sm text-muted-foreground">
                Monitor remaining classes and expiration dates across all your studios
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <Calendar className="w-10 h-10 text-primary" />
              <h3 className="font-semibold">Check In</h3>
              <p className="text-sm text-muted-foreground">
                Easy check-in system to track your class attendance
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <TrendingUp className="w-10 h-10 text-primary" />
              <h3 className="font-semibold">Usage Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Visualize your fitness spending and class usage patterns
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <Shield className="w-10 h-10 text-primary" />
              <h3 className="font-semibold">Secure & Private</h3>
              <p className="text-sm text-muted-foreground">
                Your data is encrypted and protected with secure authentication
              </p>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        <p>© 2025 PassTrack. Track your fitness journey with confidence.</p>
      </footer>
    </div>
  );
}
