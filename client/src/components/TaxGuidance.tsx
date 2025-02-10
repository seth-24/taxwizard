import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function TaxGuidance() {
  return (
    <div className="space-y-6">
      <div className="bg-primary/5 p-4 rounded-lg flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
        <div>
          <h3 className="font-semibold">2024 Tax Filing Deadline</h3>
          <p className="text-sm text-muted-foreground">
            The deadline for filing your 2023 tax return is April 15, 2024.
          </p>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="filing-status">
          <AccordionTrigger>How to Choose Your Filing Status</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Single:</strong> Choose this if you're unmarried or legally separated
              </li>
              <li>
                <strong>Married Filing Jointly:</strong> For married couples combining their income
              </li>
              <li>
                <strong>Head of Household:</strong> For unmarried individuals supporting dependents
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="deductions">
          <AccordionTrigger>Understanding Tax Deductions</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">Common deductions that can reduce your taxable income:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Student loan interest payments</li>
              <li>Charitable contributions</li>
              <li>State and local taxes paid</li>
              <li>Mortgage interest</li>
              <li>Medical expenses exceeding 7.5% of AGI</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="state-taxes">
          <AccordionTrigger>State Tax Information</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">State tax rates and policies vary significantly:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nine states have no income tax: AK, FL, NV, NH, SD, TN, TX, WA, WY</li>
              <li>California has the highest state income tax rate at 13.3%</li>
              <li>Most states use progressive tax brackets similar to federal taxes</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Need Professional Help?</h3>
          <p className="text-sm text-muted-foreground">
            While our calculator provides estimates, consider consulting a tax professional for complex situations. They can help you:
          </p>
          <ul className="list-disc pl-6 mt-2 text-sm text-muted-foreground">
            <li>Identify additional deductions and credits</li>
            <li>Handle complex investments or business income</li>
            <li>Plan for future tax years</li>
            <li>Ensure compliance with tax laws</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
