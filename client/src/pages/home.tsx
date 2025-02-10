import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TaxCalculator from "@/components/TaxCalculator";

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              U.S. Tax Calculator 2024
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Estimate your federal and state taxes based on your income and filing status.
            </p>
            <TaxCalculator />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
