import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TaxBracketChart from "./TaxBracketChart";
import { useQuery } from "@tanstack/react-query";

interface TaxResultsProps {
  results: {
    income: number;
    federalTax: number;
    stateTax: number;
    effectiveRate: number;
    filingStatus: string;
  };
}

export default function TaxResults({ results }: TaxResultsProps) {
  const { data: brackets } = useQuery({
    queryKey: ["/api/tax-brackets", results.filingStatus],
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tax Calculation Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Federal Tax</div>
              <div className="text-2xl font-bold">
                ${results.federalTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">State Tax</div>
              <div className="text-2xl font-bold">
                ${results.stateTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Effective Tax Rate</div>
              <div className="text-2xl font-bold">
                {results.effectiveRate.toFixed(1)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {brackets && (
        <Card>
          <CardHeader>
            <CardTitle>Tax Brackets</CardTitle>
          </CardHeader>
          <CardContent>
            <TaxBracketChart brackets={brackets} income={results.income} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
