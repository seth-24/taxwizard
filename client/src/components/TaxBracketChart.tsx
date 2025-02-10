import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme, VictoryTooltip } from "victory";

interface TaxBracketChartProps {
  brackets: Array<{ min: number; max: number; rate: number }>;
  income: number;
}

export default function TaxBracketChart({ brackets, income }: TaxBracketChartProps) {
  const chartData = brackets.map((bracket) => ({
    x: bracket.min,
    y: bracket.rate * 100,
    label: `${(bracket.rate * 100).toFixed(1)}%\n$${bracket.min.toLocaleString()} - ${
      bracket.max === Infinity ? "∞" : `$${bracket.max.toLocaleString()}`
    }`,
  }));

  return (
    <div className="h-[300px] w-full">
      <VictoryChart
        theme={VictoryTheme.material}
        domainPadding={{ x: 20 }}
        width={600}
        height={300}
      >
        <VictoryAxis
          tickFormat={(tick) => `$${(tick / 1000).toFixed(0)}k`}
          style={{
            tickLabels: { fontSize: 10, padding: 5 },
          }}
        />
        <VictoryAxis
          dependentAxis
          tickFormat={(tick) => `${tick}%`}
          style={{
            tickLabels: { fontSize: 10, padding: 5 },
          }}
        />
        <VictoryBar
          data={chartData}
          labelComponent={<VictoryTooltip />}
          style={{
            data: {
              fill: ({ datum }) =>
                datum.x <= income ? "hsl(var(--primary))" : "hsl(var(--muted))",
            },
          }}
        />
      </VictoryChart>
    </div>
  );
}
