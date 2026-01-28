import { useState, useEffect } from "react";
import { reportAPI, healthAPI, aiAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, Plus } from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function Reports() {
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    if (selectedReportId) {
      loadReport(selectedReportId);
    }
  }, [selectedReportId]);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const data = await reportAPI.list();
      setReports(data);
    } catch (error) {
      console.error('Failed to load reports:', error);
      toast.error("加载报告失败");
    } finally {
      setIsLoading(false);
    }
  };

  const loadReport = async (id: number) => {
    try {
      const data = await reportAPI.get(id);
      setSelectedReport(data);
    } catch (error) {
      console.error('Failed to load report:', error);
      toast.error("加载报告详情失败");
    }
  };

  const generateReport = async () => {
    try {
      setIsGenerating(true);
      
      // Get all health records
      const healthRecords = await healthAPI.list();
      
      if (healthRecords.length === 0) {
        toast.error("请先添加健康数据");
        return;
      }

      // Prepare data summary
      const dataSummary = healthRecords
        .slice(0, 20)
        .map(r => `${r.type}: ${r.value}${r.unit} (${new Date(r.recordedAt).toLocaleDateString()})`)
        .join('\n');

      // Generate report with AI
      const aiResponse = await aiAPI.generateReport(dataSummary);
      const reportContent = JSON.parse(aiResponse.choices?.[0]?.message?.content || '{}');

      // Save report
      const result = await reportAPI.create({
        title: `健康报告 - ${new Date().toLocaleDateString('zh-CN')}`,
        summary: reportContent.summary || '数据总结',
        trendAnalysis: reportContent.trendAnalysis || '趋势分析',
        riskAssessment: reportContent.riskAssessment || '风险评估',
        recommendations: reportContent.recommendations || '改善建议',
      });

      toast.success("报告生成成功");
      setSelectedReportId(result.id);
      await loadReports();
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error("生成失败，请重试");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl mb-2">健康报告</h1>
          <p className="text-muted-foreground font-serif-elegant">查看您的个性化健康分析报告</p>
        </div>
        <Button
          onClick={generateReport}
          disabled={isGenerating}
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 mr-2" />
              生成新报告
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>报告列表</CardTitle>
              <CardDescription>历史生成的健康报告</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground text-center py-8">加载中...</p>
              ) : reports.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  暂无报告，点击右上角生成
                </p>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {reports.map((report) => (
                    <button
                      key={report.id}
                      onClick={() => setSelectedReportId(report.id)}
                      className={`w-full text-left p-4 rounded-md border transition-colors ${
                        selectedReportId === report.id
                          ? "border-primary bg-accent"
                          : "border-border hover:bg-accent/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 mt-0.5 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{report.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(report.createdAt).toLocaleDateString('zh-CN')}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Report Detail */}
        <div className="lg:col-span-2">
          {selectedReport ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedReport.title}</CardTitle>
                <CardDescription>
                  生成时间：{new Date(selectedReport.createdAt).toLocaleString('zh-CN')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">数据总结</h3>
                  <div className="text-muted-foreground">
                    <Streamdown>{selectedReport.summary}</Streamdown>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">趋势分析</h3>
                  <div className="text-muted-foreground">
                    <Streamdown>{selectedReport.trendAnalysis}</Streamdown>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">风险评估</h3>
                  <div className="text-muted-foreground">
                    <Streamdown>{selectedReport.riskAssessment}</Streamdown>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">改善建议</h3>
                  <div className="text-muted-foreground">
                    <Streamdown>{selectedReport.recommendations}</Streamdown>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-24 text-center text-muted-foreground">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>选择一个报告查看详情</p>
                <p className="text-sm mt-1">或点击右上角生成新报告</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
