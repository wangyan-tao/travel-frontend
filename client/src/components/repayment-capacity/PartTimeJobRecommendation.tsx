import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, DollarSign, Clock, Phone, Briefcase, Upload, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import JobChatDialog from './JobChatDialog';

interface PartTimeJob {
  id: number;
  jobTitle: string;
  companyName: string;
  city: string;
  district: string;
  address: string;
  salaryRange: string;
  jobType: string;
  contactPhone: string;
  description: string;
  status: string;
}

interface JobProof {
  id: number;
  jobId: number;
  proofType: string;
  proofUrl: string;
  monthlyIncome?: number;
  startDate: string;
  endDate?: string;
  verificationStatus: string;
}

export default function PartTimeJobRecommendation() {
  const [jobs, setJobs] = useState<PartTimeJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [jobType, setJobType] = useState('all');
  const [selectedJob, setSelectedJob] = useState<PartTimeJob | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [chatJob, setChatJob] = useState<PartTimeJob | null>(null);
  const [uploadForm, setUploadForm] = useState({
    proofType: '工作证明',
    monthlyIncome: '',
    startDate: '',
    endDate: '',
    remarks: '',
    file: null as File | null,
  });

  // 只在组件首次挂载时获取用户位置
  useEffect(() => {
    fetchUserLocation();
  }, []);

  // 当筛选条件改变时，重新获取兼职列表
  useEffect(() => {
    fetchJobs();
  }, [city, district, jobType]);

  const fetchUserLocation = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:8080/api/user/location', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.code === 200 && response.data.data) {
        const location = response.data.data;
        // 只在城市为空时才设置默认值，避免覆盖用户手动输入
        setCity(prevCity => prevCity || (location.currentCity || location.schoolCity || ''));
      }
    } catch (error) {
      console.error('获取用户位置失败:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('请先登录');
        return;
      }

      const params: any = { status: 'ACTIVE' };
      if (city) params.city = city;
      if (district) params.district = district;
      if (jobType && jobType !== 'all') params.jobType = jobType;

      const response = await axios.get('http://localhost:8080/api/jobs/recommendations', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      if (response.data.code === 200) {
        setJobs(response.data.data || []);
      }
    } catch (error: any) {
      console.error('获取兼职推荐失败:', error);
      if (error.response?.status !== 404) {
        toast.error('获取兼职推荐失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (job: PartTimeJob) => {
    setChatJob(job);
    setChatDialogOpen(true);
  };

  const handleUploadProof = async () => {
    if (!selectedJob) return;

    if (!uploadForm.file) {
      toast.error('请选择要上传的证明文件');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('请先登录');
        return;
      }

      // 先上传文件
      const formData = new FormData();
      formData.append('file', uploadForm.file);

      const uploadResponse = await axios.post('http://localhost:8080/api/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (uploadResponse.data.code !== 200) {
        throw new Error('文件上传失败');
      }

      const fileUrl = uploadResponse.data.data.url;
      console.log('文件上传成功，URL:', fileUrl);

      // 提交工作证明
      const proofData = {
        jobId: selectedJob?.id || null,
        proofType: uploadForm.proofType,
        proofUrl: fileUrl,
        monthlyIncome: uploadForm.monthlyIncome ? parseFloat(uploadForm.monthlyIncome) : null,
        startDate: uploadForm.startDate,
        endDate: uploadForm.endDate || null,
      };

      console.log('提交工作证明数据:', proofData);

      const response = await axios.post('http://localhost:8080/api/jobs/proof', proofData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log('工作证明提交响应:', response.data);

      if (response.data.code === 200) {
        toast.success('工作证明上传成功！');
        setUploadDialogOpen(false);
        setUploadForm({
          proofType: '工作证明',
          monthlyIncome: '',
          startDate: '',
          endDate: '',
          remarks: '',
          file: null,
        });
        setSelectedJob(null);
        // 触发刷新资质档案事件
        window.dispatchEvent(new CustomEvent('archive-updated'));
      }
    } catch (error: any) {
      console.error('上传工作证明失败:', error);
      toast.error(error.response?.data?.message || '上传工作证明失败');
    }
  };

  const getJobTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      '餐饮服务': { label: '餐饮服务', variant: 'default' },
      '文创店铺': { label: '文创店铺', variant: 'secondary' },
      '超市导购': { label: '超市导购', variant: 'outline' },
      '短期实习': { label: '短期实习', variant: 'default' },
      '其他': { label: '其他', variant: 'outline' },
    };
    const config = typeMap[type] || { label: type, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
          <CardDescription>根据您的需求筛选合适的兼职岗位</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>所在城市</Label>
              <Input
                placeholder="输入城市名称"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>所在区域</Label>
              <Input
                placeholder="输入区域名称"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>岗位类型</Label>
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger>
                  <SelectValue placeholder="选择岗位类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="餐饮服务">餐饮服务</SelectItem>
                  <SelectItem value="文创店铺">文创店铺</SelectItem>
                  <SelectItem value="超市导购">超市导购</SelectItem>
                  <SelectItem value="短期实习">短期实习</SelectItem>
                  <SelectItem value="其他">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">暂无推荐岗位</p>
              <p className="text-muted-foreground">
                {city ? `在 ${city} 暂无符合条件的兼职岗位` : '请先设置您的所在城市'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{job.jobTitle}</CardTitle>
                      {getJobTypeBadge(job.jobType)}
                    </div>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.companyName} · {job.city} {job.district}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">薪资范围</p>
                      <p className="font-semibold text-green-600">{job.salaryRange}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">工作类型</p>
                      <p className="font-semibold">{job.jobType}</p>
                    </div>
                  </div>
                </div>

                {job.description && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-1">岗位描述</p>
                    <p className="text-sm">{job.description}</p>
                  </div>
                )}

                {job.address && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-1">详细地址</p>
                    <p className="text-sm flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.address}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleContact(job)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    联系招聘方
                  </Button>
                  <Dialog open={uploadDialogOpen && selectedJob?.id === job.id} onOpenChange={(open) => {
                    setUploadDialogOpen(open);
                    if (open) {
                      setSelectedJob(job);
                    } else {
                      setSelectedJob(null);
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedJob(job);
                          setUploadDialogOpen(true);
                        }}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        上传工作证明
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>上传工作证明</DialogTitle>
                        <DialogDescription>
                          上传您的兼职/实习证明，将作为贷款还款能力的支撑材料
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>证明类型</Label>
                          <Select
                            value={uploadForm.proofType}
                            onValueChange={(value) => setUploadForm({ ...uploadForm, proofType: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="工作证明">工作证明</SelectItem>
                              <SelectItem value="工资流水">工资流水</SelectItem>
                              <SelectItem value="劳动合同">劳动合同</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>开始日期</Label>
                            <Input
                              type="date"
                              value={uploadForm.startDate}
                              onChange={(e) => setUploadForm({ ...uploadForm, startDate: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>结束日期（可选）</Label>
                            <Input
                              type="date"
                              value={uploadForm.endDate}
                              onChange={(e) => setUploadForm({ ...uploadForm, endDate: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>月收入（可选）</Label>
                          <Input
                            type="number"
                            placeholder="请输入月收入金额"
                            value={uploadForm.monthlyIncome}
                            onChange={(e) => setUploadForm({ ...uploadForm, monthlyIncome: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>证明材料</Label>
                          <Input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
                          />
                          <p className="text-xs text-muted-foreground">
                            支持图片和PDF格式，文件大小不超过10MB
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
                        <Button onClick={handleUploadProof}>
                          上传
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 聊天对话框 */}
      {chatJob && (
        <JobChatDialog
          open={chatDialogOpen}
          onOpenChange={setChatDialogOpen}
          job={{
            id: chatJob.id,
            jobTitle: chatJob.jobTitle,
            companyName: chatJob.companyName,
            city: chatJob.city,
            district: chatJob.district,
            contactPhone: chatJob.contactPhone,
            salaryRange: chatJob.salaryRange,
            jobType: chatJob.jobType,
          }}
        />
      )}
    </div>
  );
}

