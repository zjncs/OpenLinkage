import { useState, useEffect } from "react";
import { reminderAPI, systemAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Bell, Loader2 } from "lucide-react";
import { toast } from "sonner";

const reminderTypes = [
  { value: "medication", label: "用药提醒" },
  { value: "exercise", label: "运动提醒" },
  { value: "checkup", label: "体检提醒" },
  { value: "custom", label: "自定义提醒" },
];

const frequencies = [
  { value: "daily", label: "每天" },
  { value: "weekly", label: "每周" },
  { value: "monthly", label: "每月" },
  { value: "once", label: "一次性" },
];

export default function SettingsPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("medication");
  const [frequency, setFrequency] = useState("daily");
  const [time, setTime] = useState("09:00");
  const [reminders, setReminders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      setIsLoading(true);
      const data = await reminderAPI.list();
      setReminders(data);
    } catch (error) {
      console.error('Failed to load reminders:', error);
      toast.error("加载提醒失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("请输入提醒标题");
      return;
    }

    try {
      setIsSubmitting(true);
      await reminderAPI.create({
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        frequency,
        time,
      });
      
      toast.success("提醒已创建");
      setTitle("");
      setDescription("");
      setTime("09:00");
      await loadReminders();
    } catch (error) {
      console.error('Failed to create reminder:', error);
      toast.error("创建失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: number, enabled: boolean) => {
    try {
      await reminderAPI.update({ id, enabled });
      await loadReminders();
    } catch (error) {
      console.error('Failed to toggle reminder:', error);
      toast.error("更新失败");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await reminderAPI.delete(id);
      toast.success("提醒已删除");
      await loadReminders();
    } catch (error) {
      console.error('Failed to delete reminder:', error);
      toast.error("删除失败");
    }
  };

  const handleNotificationTest = async () => {
    try {
      await systemAPI.showNotification(
        "灵犀健康",
        "这是一条测试通知"
      );
      toast.success("通知已发送");
    } catch (error) {
      console.error('Failed to show notification:', error);
      toast.error("通知发送失败");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl mb-2">设置</h1>
        <p className="text-muted-foreground font-serif-elegant">管理提醒和通知</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Reminder Form */}
        <Card>
          <CardHeader>
            <CardTitle>创建提醒</CardTitle>
            <CardDescription>设置健康提醒和通知</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>提醒标题</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如：服用降压药"
                />
              </div>

              <div className="space-y-2">
                <Label>描述（可选）</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="添加详细说明..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>类型</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reminderTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>频率</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>时间</Label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    创建中...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    创建提醒
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleNotificationTest}
              >
                <Bell className="w-4 h-4 mr-2" />
                测试通知
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reminders List */}
        <Card>
          <CardHeader>
            <CardTitle>提醒列表</CardTitle>
            <CardDescription>管理您的健康提醒</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : reminders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>暂无提醒</p>
                <p className="text-sm mt-1">创建您的第一个健康提醒</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {reminders.map((reminder) => {
                  const typeInfo = reminderTypes.find(t => t.value === reminder.type);
                  const freqInfo = frequencies.find(f => f.value === reminder.frequency);
                  
                  return (
                    <div
                      key={reminder.id}
                      className="flex items-start gap-3 p-4 border border-border rounded-md"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{reminder.title}</div>
                        {reminder.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {reminder.description}
                          </div>
                        )}
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                          <span>{typeInfo?.label}</span>
                          <span>•</span>
                          <span>{freqInfo?.label}</span>
                          <span>•</span>
                          <span>{reminder.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={reminder.enabled}
                          onCheckedChange={(checked) => handleToggle(reminder.id, checked)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(reminder.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
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
