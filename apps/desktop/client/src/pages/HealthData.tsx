import { useState, useEffect } from "react";
import { healthAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const healthTypes = [
  { value: "weight", label: "体重", unit: "kg" },
  { value: "blood_pressure", label: "血压", unit: "mmHg" },
  { value: "heart_rate", label: "心率", unit: "bpm" },
  { value: "blood_sugar", label: "血糖", unit: "mmol/L" },
  { value: "temperature", label: "体温", unit: "°C" },
];

export default function HealthData() {
  const [type, setType] = useState<string>("weight");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [recordedAt, setRecordedAt] = useState(new Date().toISOString().slice(0, 16));
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setIsLoading(true);
      const data = await healthAPI.list();
      setRecords(data);
    } catch (error) {
      console.error('Failed to load health records:', error);
      toast.error("加载数据失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) {
      toast.error("请输入数值");
      return;
    }

    const selectedType = healthTypes.find(t => t.value === type);
    if (!selectedType) return;

    try {
      setIsSubmitting(true);
      await healthAPI.create({
        type,
        value: value.trim(),
        unit: selectedType.unit,
        notes: notes.trim() || undefined,
        recordedAt: new Date(recordedAt).getTime(),
      });
      
      toast.success("健康数据已保存");
      setValue("");
      setNotes("");
      setRecordedAt(new Date().toISOString().slice(0, 16));
      await loadRecords();
    } catch (error) {
      console.error('Failed to create health record:', error);
      toast.error("保存失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await healthAPI.delete(id);
      toast.success("记录已删除");
      await loadRecords();
    } catch (error) {
      console.error('Failed to delete health record:', error);
      toast.error("删除失败");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl mb-2">健康数据</h1>
        <p className="text-muted-foreground font-serif-elegant">记录和管理您的健康指标</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>添加记录</CardTitle>
            <CardDescription>记录您的健康数据</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>类型</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {healthTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>数值</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="输入数值"
                    className="flex-1"
                  />
                  <div className="w-20 flex items-center justify-center bg-muted rounded-md text-sm text-muted-foreground">
                    {healthTypes.find(t => t.value === type)?.unit}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>记录时间</Label>
                <Input
                  type="datetime-local"
                  value={recordedAt}
                  onChange={(e) => setRecordedAt(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>备注（可选）</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="添加备注信息..."
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    添加记录
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Records List */}
        <Card>
          <CardHeader>
            <CardTitle>历史记录</CardTitle>
            <CardDescription>最近的健康数据记录</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>暂无记录</p>
                <p className="text-sm mt-1">开始添加您的健康数据</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {records.map((record) => {
                  const typeInfo = healthTypes.find(t => t.value === record.type);
                  return (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 border border-border rounded-md hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="font-medium">{typeInfo?.label}</span>
                          <span className="text-lg font-semibold">{record.value}</span>
                          <span className="text-sm text-muted-foreground">{record.unit}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {new Date(record.recordedAt).toLocaleString('zh-CN')}
                        </div>
                        {record.notes && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {record.notes}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(record.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
