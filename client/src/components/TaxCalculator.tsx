import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { taxCalculationSchema, type FilingStatus, type State } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import TaxResults from "./TaxResults";
import { Calculator } from "lucide-react";
import { statesList } from "@/lib/tax-utils";

type FormData = {
  income: number;
  filingStatus: FilingStatus;
  state: State;
  standardDeduction: number;
  additionalDeductions: number;
};

export default function TaxCalculator() {
  const { toast } = useToast();
  const [results, setResults] = useState<any>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(taxCalculationSchema),
    defaultValues: {
      income: undefined,
      filingStatus: "single",
      state: "CA",
      standardDeduction: undefined,
      additionalDeductions: undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("POST", "/api/calculate-tax", {
        ...data,
        income: Number(data.income),
        standardDeduction: Number(data.standardDeduction),
        additionalDeductions: Number(data.additionalDeductions || 0),
      });
      return res.json();
    },
    onSuccess: (data) => {
      setResults(data);
      toast({
        title: "Calculation Complete",
        description: "Your tax estimate has been calculated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: FormData) {
    mutation.mutate(data);
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="income"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Income</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter your annual income"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="filingStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Filing Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select filing status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married Filing Jointly</SelectItem>
                      <SelectItem value="headOfHousehold">Head of Household</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State of Residence</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statesList.map((state) => (
                        <SelectItem key={state.code} value={state.code}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="standardDeduction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Standard Deduction</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter standard deduction"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additionalDeductions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Deductions</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter additional deductions"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
          >
            <Calculator className="mr-2 h-4 w-4" />
            Calculate Taxes
          </Button>
        </form>
      </Form>

      {results && <TaxResults results={results} />}
    </div>
  );
}