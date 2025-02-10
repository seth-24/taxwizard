import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaxCalculator from "@/components/TaxCalculator";
import TaxHistory from "@/components/TaxHistory";
import TaxGuidance from "@/components/TaxGuidance";
import DocumentScanner from "@/components/DocumentScanner";

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              TaxPro Advisor 2024
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Expert tax calculations and guidance for all U.S. states. Get accurate estimates, professional reports, and state-specific tax insights.
            </p>
            <Tabs defaultValue="calculator" className="space-y-4">
              <TabsList>
                <TabsTrigger value="calculator">Calculator</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="guidance">Tax Guidance</TabsTrigger>
              </TabsList>
              <TabsContent value="calculator">
                <TaxCalculator />
              </TabsContent>
              <TabsContent value="history">
                <TaxHistory />
              </TabsContent>
              <TabsContent value="documents">
                <DocumentScanner />
              </TabsContent>
              <TabsContent value="guidance">
                <TaxGuidance />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        {/* Ad Space */}
        <div className="bg-muted p-4 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">Advertisement Space</p>
          <div className="h-[120px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
            <p className="text-muted-foreground">Premium Ad Space Available</p>
          </div>
        </div>
      </div>
    </div>
  );
}