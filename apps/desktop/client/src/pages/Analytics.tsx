import { useState, useEffect } from "react";
import { healthAPI } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";

const healthTypes = [
  { value: "weight", label: "体重", unit: "kg" },
  { value: "heart_rate", label: "心率", unit: "bpm" },
  { value: "blood_sugar", label: "血糖", unit: "mmol/L" },
  { value: "temperature", label: "体温", unit: "°C" },
];

export default function Analytics() {
  const [selectedType, setSelectedType] = useState("weight");
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, [selectedType]);

  const loadRecords = async () => {
    try {
      setIsLoading(true);
      const data = await healthAPI.list(selectedType);
      setRecords(data);
    } catch (error) {
      console.error('Failed to load health records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare chart data
  const chartData = records
    .slice()
    .reverse()
    .map((record) => ({
      date: new Date(record.recordedAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric" }),
      value: parseFloat(record.value.split("/")[0] || record.value),
    }));

  // Calculate statistics
  const values = chartData.map(d => d.value);
  const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const latest = values[values.length - 1] || 0;
  const previous = values[values.length - 2] || latest;
  const change = latest - previous;
  const changePercent = previous !== 0 ? ((change / previous) * 100).toFixed(1) : "0";

  const typeInfo = healthTypes.find(t => t.value === selectedType);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl mb-2">数据分析</h1>
        <p className="text-muted-foreground font-serif-elegant">可视化您的健康趋势</p>
      </div>

      <div className="mb-6">
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {healthTypes.map(t => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : records.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>暂无{typeInfo?.label}数据</p>
            <p className="text-sm mt-1">前往健康数据页面添加记录</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Latest Value */}
            <Card>
              <CardHeader>
                <CardDescription>最新数值</CardDescription>
                <CardTitle className="text-3xl">
                  {latest.toFixed(1)} <span className="text-lg text-muted-foreground">{typeInfo?.unit}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  {change > 0 ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-red-500" />
                      <span className="text-red-500">+{changePercent}%</span>
                    </>
                  ) : change < 0 ? (
                    <>
                      <TrendingDown className="w-4 h-4 text-green-500" />
                      <span className="text-green-500">{changePercent}%</span>
                    </>
                  ) : (
                    <>
                      <Minus className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">无变化</span>
                    </>
                  )}
                  <span className="text-muted-foreground">较上次</span>
                </div>
              </CardContent>
            </Card>

            {/* Average */}
            <Card>
              <CardHeader>
                <CardDescription>平均值</CardDescription>
                <CardTitle className="text-3xl">
                  {average.toFixed(1)} <span className="text-lg text-muted-foreground">{typeInfo?.unit}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  基于 {records.length} 条记录
                </p>
              </CardContent>
            </Card>

            {/* Range */}
            <Card>
              <CardHeader>
                <CardDescription>数值范围</CardDescription>
                <CardTitle className="text-3xl">
                  {Math.min(...values).toFixed(1)} - {Math.max(...values).toFixed(1)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  最小值到最大值
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>趋势图</CardTitle>
              <CardDescription>
                {typeInfo?.label}变化趋势
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
