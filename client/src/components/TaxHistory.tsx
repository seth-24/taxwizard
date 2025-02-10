import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { formatCurrency } from "@/lib/tax-utils";

export default function TaxHistory() {
  const { data: history } = useQuery({
    queryKey: ["/api/tax-history"],
  });

  const generateReport = (calculation: any) => {
    // TODO: Generate PDF report
    console.log("Generating report for", calculation);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Recent Calculations</h2>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print All
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Income</TableHead>
            <TableHead>Filing Status</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history?.map((calc: any) => (
            <TableRow key={calc.id}>
              <TableCell>
                {new Date(calc.calculatedAt).toLocaleDateString()}
              </TableCell>
              <TableCell>{formatCurrency(Number(calc.income))}</TableCell>
              <TableCell className="capitalize">{calc.filingStatus}</TableCell>
              <TableCell>{calc.state}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => generateReport(calc)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
