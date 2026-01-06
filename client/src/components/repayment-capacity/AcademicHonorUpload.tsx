import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Upload, CheckCircle2, XCircle, Clock, Award, FileText } from 'lucide-react';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface AcademicHonor {
  id: number;
  honorType: string;
  honorName: string;
  awardLevel: string;
  awardDate: string;
  certificateUrl: string;
  issuingOrganization: string;
  verificationStatus: string;
  createdAt: string;
}

export default function AcademicHonorUpload() {
  const [honors, setHonors] = useState<AcademicHonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    honorType: '奖学金',
    honorName: '',
    awardLevel: '校级',
    awardDate: '',
    issuingOrganization: '',
    remarks: '',
    file: null as File | null,
  });

  useEffect(() => {
    fetchHonors();
  }, []);

  const fetchHonors = async () => {
    try {
      setLoading(true);
      const response: any = await axiosInstance.get('/academic-honors');

      if (response.code === 200) {
        setHonors(response.data || []);
      }
    } catch (error: any) {
      console.error('获取学业荣誉失败:', error);
      if (error.message && !error.message.includes('404')) {
        toast.error(error.message || '获取学业荣誉失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file) {
      toast.error('请选择要上传的证书文件');
      return;
    }

    if (!uploadForm.honorName || !uploadForm.awardDate) {
      toast.error('请填写完整的荣誉信息');
      return;
    }

    try {
      // 先上传文件
      const formData = new FormData();
      formData.append('file', uploadForm.file);

      const uploadResponse: any = await axiosInstance.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (uploadResponse.code !== 200) {
        throw new Error(uploadResponse.message || '文件上传失败');
      }

      const fileUrl = uploadResponse.data.url;
      console.log('文件上传成功，URL:', fileUrl);

      // 提交学业荣誉
      const honorData = {
        honorType: uploadForm.honorType,
        honorName: uploadForm.honorName,
        awardLevel: uploadForm.awardLevel || null,
        awardDate: uploadForm.awardDate || null,
        certificateUrl: fileUrl,
        issuingOrganization: uploadForm.issuingOrganization || null,
      };

      console.log('提交学业荣誉数据:', honorData);

      const response: any = await axiosInstance.post('/academic-honors', honorData);

      console.log('学业荣誉提交响应:', response);

      if (response.code === 200) {
        toast.success('学业荣誉上传成功！');
        setUploadDialogOpen(false);
        setUploadForm({
          honorType: '奖学金',
          honorName: '',
          awardLevel: '校级',
          awardDate: '',
          issuingOrganization: '',
          remarks: '',
          file: null,
        });
        fetchHonors();
        // 触发刷新资质档案事件
        window.dispatchEvent(new CustomEvent('archive-updated'));
      }
    } catch (error: any) {
      console.error('上传学业荣誉失败:', error);
      toast.error(error.message || '上传学业荣誉失败');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
      PENDING: { label: '待核验', variant: 'secondary', icon: Clock },
      VERIFIED: { label: '已核验', variant: 'default', icon: CheckCircle2 },
      FAILED: { label: '核验失败', variant: 'destructive', icon: XCircle },
    };
    const config = statusMap[status] || { label: status, variant: 'outline', icon: FileText };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getHonorTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      '奖学金': { label: '奖学金', variant: 'default' },
      '竞赛获奖': { label: '竞赛获奖', variant: 'secondary' },
      '优秀学生': { label: '优秀学生', variant: 'outline' },
      '科研成果': { label: '科研成果', variant: 'default' },
      '社会实践': { label: '社会实践', variant: 'secondary' },
    };
    const config = typeMap[type] || { label: type, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getAwardLevelBadge = (level: string) => {
    const levelMap: Record<string, { label: string; className: string }> = {
      '国家级': { label: '国家级', className: 'bg-red-100 text-red-800' },
      '省级': { label: '省级', className: 'bg-orange-100 text-orange-800' },
      '校级': { label: '校级', className: 'bg-blue-100 text-blue-800' },
      '院级': { label: '院级', className: 'bg-green-100 text-green-800' },
    };
    const config = levelMap[level] || { label: level, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-purple-600" />
                上传学业荣誉证明
              </CardTitle>
              <CardDescription className="mt-2">
                专为无时间兼职但学业优秀的大学生提供，上传学业成绩和荣誉证书，帮助降低利率、提高授信额度
              </CardDescription>
            </div>
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                  <Upload className="h-4 w-4 mr-2" />
                  上传证明
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>上传学业荣誉证明</DialogTitle>
                  <DialogDescription>
                    上传您的学业成绩证书或荣誉证书，将作为贷款审批的加分项
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>荣誉类型 *</Label>
                      <Select
                        value={uploadForm.honorType}
                        onValueChange={(value) => setUploadForm({ ...uploadForm, honorType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="奖学金">奖学金</SelectItem>
                          <SelectItem value="竞赛获奖">竞赛获奖</SelectItem>
                          <SelectItem value="优秀学生">优秀学生</SelectItem>
                          <SelectItem value="科研成果">科研成果</SelectItem>
                          <SelectItem value="社会实践">社会实践</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>获奖级别 *</Label>
                      <Select
                        value={uploadForm.awardLevel}
                        onValueChange={(value) => setUploadForm({ ...uploadForm, awardLevel: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="国家级">国家级</SelectItem>
                          <SelectItem value="省级">省级</SelectItem>
                          <SelectItem value="校级">校级</SelectItem>
                          <SelectItem value="院级">院级</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>荣誉名称 *</Label>
                    <Input
                      placeholder="例如：国家励志奖学金、全国大学生数学建模竞赛一等奖"
                      value={uploadForm.honorName}
                      onChange={(e) => setUploadForm({ ...uploadForm, honorName: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>获奖日期 *</Label>
                      <Input
                        type="date"
                        value={uploadForm.awardDate}
                        onChange={(e) => setUploadForm({ ...uploadForm, awardDate: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>颁发机构</Label>
                      <Input
                        placeholder="例如：教育部、XX大学"
                        value={uploadForm.issuingOrganization}
                        onChange={(e) => setUploadForm({ ...uploadForm, issuingOrganization: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>证书文件 *</Label>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
                    />
                    <p className="text-xs text-muted-foreground">
                      支持图片和PDF格式，可上传成绩单截图、GPA证书、奖学金证书、竞赛获奖证书、优秀学生证书等
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>备注说明（可选）</Label>
                    <Textarea
                      placeholder="可添加其他说明信息"
                      value={uploadForm.remarks}
                      onChange={(e) => setUploadForm({ ...uploadForm, remarks: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={handleUpload} className="bg-gradient-to-r from-purple-500 to-blue-500">
                    上传
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Honors List */}
      {honors.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">暂无学业荣誉记录</p>
              <p className="text-muted-foreground mb-6">
                上传您的学业成绩和荣誉证书，提升贷款审批通过率和授信额度
              </p>
              <Button onClick={() => setUploadDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                立即上传
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {honors.map((honor) => (
            <Card key={honor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <CardTitle className="text-xl">{honor.honorName}</CardTitle>
                      {getHonorTypeBadge(honor.honorType)}
                      {getAwardLevelBadge(honor.awardLevel)}
                      {getStatusBadge(honor.verificationStatus)}
                    </div>
                    <CardDescription className="mt-2">
                      <div className="flex flex-wrap items-center gap-4">
                        <span>获奖日期：{new Date(honor.awardDate).toLocaleDateString('zh-CN')}</span>
                        {honor.issuingOrganization && (
                          <span>颁发机构：{honor.issuingOrganization}</span>
                        )}
                      </div>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {honor.certificateUrl && (
                  <div className="mb-4">
                    <a
                      href={honor.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <FileText className="h-4 w-4" />
                      查看证书
                    </a>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  上传时间：{new Date(honor.createdAt).toLocaleString('zh-CN')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

