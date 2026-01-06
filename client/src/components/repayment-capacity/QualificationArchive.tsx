import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FolderOpen, Briefcase, GraduationCap, CheckCircle2, XCircle, Clock, FileText, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface JobProof {
  id: number;
  jobId: number;
  jobTitle?: string;
  companyName?: string;
  proofType: string;
  proofUrl: string;
  monthlyIncome?: number;
  startDate: string;
  endDate?: string;
  verificationStatus: string;
  createdAt: string;
}

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

export default function QualificationArchive() {
  const [jobProofs, setJobProofs] = useState<JobProof[]>([]);
  const [academicHonors, setAcademicHonors] = useState<AcademicHonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchArchive();
    
    // 监听上传成功事件，自动刷新资质档案
    const handleArchiveUpdate = () => {
      fetchArchive();
    };
    
    window.addEventListener('archive-updated', handleArchiveUpdate);
    
    return () => {
      window.removeEventListener('archive-updated', handleArchiveUpdate);
    };
  }, []);

  const fetchArchive = async () => {
    try {
      setLoading(true);
      console.log('开始获取资质档案...');

      // 并行获取工作证明和学业荣誉
      const [jobProofsResponse, honorsResponse] = await Promise.all([
        axiosInstance.get('/jobs/proof').catch((err) => {
          console.error('获取工作证明失败:', err);
          return { code: 200, data: [] };
        }),
        axiosInstance.get('/academic-honors').catch((err) => {
          console.error('获取学业荣誉失败:', err);
          return { code: 200, data: [] };
        }),
      ]);

      console.log('工作证明响应:', jobProofsResponse);
      console.log('学业荣誉响应:', honorsResponse);

      if (jobProofsResponse.code === 200) {
        const proofs = jobProofsResponse.data || [];
        console.log('工作证明数量:', proofs.length);
        setJobProofs(proofs);
      }
      if (honorsResponse.code === 200) {
        const honors = honorsResponse.data || [];
        console.log('学业荣誉数量:', honors.length);
        setAcademicHonors(honors);
      }
    } catch (error: any) {
      console.error('获取资质档案失败:', error);
      toast.error(error.message || '获取资质档案失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJobProof = async (id: number) => {
    try {
      const response: any = await axiosInstance.delete(`/jobs/proof/${id}`);

      if (response.code === 200) {
        toast.success('删除成功');
        fetchArchive();
      }
    } catch (error: any) {
      console.error('删除失败:', error);
      toast.error(error.message || '删除失败');
    }
  };

  const handleDeleteHonor = async (id: number) => {
    try {
      const response: any = await axiosInstance.delete(`/academic-honors/${id}`);

      if (response.code === 200) {
        toast.success('删除成功');
        fetchArchive();
      }
    } catch (error: any) {
      console.error('删除失败:', error);
      toast.error(error.message || '删除失败');
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

  const totalCount = jobProofs.length + academicHonors.length;
  const verifiedCount = [
    ...jobProofs.filter(p => p.verificationStatus === 'VERIFIED'),
    ...academicHonors.filter(h => h.verificationStatus === 'VERIFIED'),
  ].length;

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
      {/* Statistics Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-2 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">资质档案总数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <FolderOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">{totalCount}</p>
                <p className="text-xs text-muted-foreground">份档案</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">已核验档案</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">{verifiedCount}</p>
                <p className="text-xs text-muted-foreground">份已核验</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">档案复用</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">✓</p>
                <p className="text-xs text-muted-foreground">可直接复用</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
        <CardContent className="pt-6">
          <p className="text-sm text-gray-700">
            系统自动保留您上传的兼职证明和学业荣誉证书，形成个人专属资质档案。
            此档案可在后续申请其他贷款产品时直接复用，无需重复上传。
          </p>
        </CardContent>
      </Card>

      {/* Archive Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">全部档案</TabsTrigger>
          <TabsTrigger value="jobs">工作证明</TabsTrigger>
          <TabsTrigger value="honors">学业荣誉</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-6">
            {/* Job Proofs Section */}
            {jobProofs.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  工作证明 ({jobProofs.length})
                </h3>
                <div className="grid gap-4">
                  {jobProofs.map((proof) => (
                    <Card key={proof.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base">{proof.proofType}</CardTitle>
                            <CardDescription className="mt-1">
                              {proof.companyName && (
                                <span>{proof.companyName} · </span>
                              )}
                              {proof.jobTitle && (
                                <span>{proof.jobTitle} · </span>
                              )}
                              {proof.monthlyIncome && (
                                <span>月收入：¥{proof.monthlyIncome}</span>
                              )}
                            </CardDescription>
                          </div>
                          {getStatusBadge(proof.verificationStatus)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            <p>工作期间：{new Date(proof.startDate).toLocaleDateString('zh-CN')}
                              {proof.endDate && ` - ${new Date(proof.endDate).toLocaleDateString('zh-CN')}`}
                            </p>
                            <p className="mt-1">上传时间：{new Date(proof.createdAt).toLocaleString('zh-CN')}</p>
                          </div>
                          <div className="flex gap-2">
                            {proof.proofUrl && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={proof.proofUrl} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4 mr-1" />
                                  下载
                                </a>
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  删除
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>确认删除</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    确定要删除这份工作证明吗？删除后无法恢复。
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>取消</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteJobProof(proof.id)}>
                                    删除
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Academic Honors Section */}
            {academicHonors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  学业荣誉 ({academicHonors.length})
                </h3>
                <div className="grid gap-4">
                  {academicHonors.map((honor) => (
                    <Card key={honor.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base">{honor.honorName}</CardTitle>
                            <CardDescription className="mt-1">
                              <span>{honor.honorType}{honor.awardLevel ? ` · ${honor.awardLevel}` : ''}</span>
                              {honor.issuingOrganization && (
                                <span> · {honor.issuingOrganization}</span>
                              )}
                            </CardDescription>
                          </div>
                          {getStatusBadge(honor.verificationStatus)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            {honor.awardDate && (
                              <p>获奖日期：{new Date(honor.awardDate).toLocaleDateString('zh-CN')}</p>
                            )}
                            <p className={honor.awardDate ? 'mt-1' : ''}>上传时间：{new Date(honor.createdAt).toLocaleString('zh-CN')}</p>
                          </div>
                          <div className="flex gap-2">
                            {honor.certificateUrl && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={honor.certificateUrl} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4 mr-1" />
                                  下载
                                </a>
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  删除
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>确认删除</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    确定要删除这份学业荣誉吗？删除后无法恢复。
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>取消</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteHonor(honor.id)}>
                                    删除
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {totalCount === 0 && (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">暂无资质档案</p>
                    <p className="text-muted-foreground">
                      上传工作证明或学业荣誉后，将自动保存到您的资质档案中
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="mt-6">
          {jobProofs.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">暂无工作证明</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {jobProofs.map((proof) => (
                <Card key={proof.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{proof.proofType}</CardTitle>
                        <CardDescription className="mt-1">
                          {proof.companyName && (
                            <span>{proof.companyName} · </span>
                          )}
                          {proof.jobTitle && (
                            <span>{proof.jobTitle} · </span>
                          )}
                          {proof.monthlyIncome && (
                            <span>月收入：¥{proof.monthlyIncome}</span>
                          )}
                        </CardDescription>
                      </div>
                      {getStatusBadge(proof.verificationStatus)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <p>工作期间：{new Date(proof.startDate).toLocaleDateString('zh-CN')}
                          {proof.endDate && ` - ${new Date(proof.endDate).toLocaleDateString('zh-CN')}`}
                        </p>
                        <p className="mt-1">上传时间：{new Date(proof.createdAt).toLocaleString('zh-CN')}</p>
                      </div>
                      <div className="flex gap-2">
                        {proof.proofUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={proof.proofUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-1" />
                              下载
                            </a>
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-1" />
                              删除
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认删除</AlertDialogTitle>
                              <AlertDialogDescription>
                                确定要删除这份工作证明吗？删除后无法恢复。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteJobProof(proof.id)}>
                                删除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="honors" className="mt-6">
          {academicHonors.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">暂无学业荣誉</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {academicHonors.map((honor) => (
                <Card key={honor.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{honor.honorName}</CardTitle>
                        <CardDescription className="mt-1">
                          <span>{honor.honorType}{honor.awardLevel ? ` · ${honor.awardLevel}` : ''}</span>
                          {honor.issuingOrganization && (
                            <span> · {honor.issuingOrganization}</span>
                          )}
                        </CardDescription>
                      </div>
                      {getStatusBadge(honor.verificationStatus)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {honor.awardDate && (
                          <p>获奖日期：{new Date(honor.awardDate).toLocaleDateString('zh-CN')}</p>
                        )}
                        <p className={honor.awardDate ? 'mt-1' : ''}>上传时间：{new Date(honor.createdAt).toLocaleString('zh-CN')}</p>
                      </div>
                      <div className="flex gap-2">
                        {honor.certificateUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={honor.certificateUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-1" />
                              下载
                            </a>
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-1" />
                              删除
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认删除</AlertDialogTitle>
                              <AlertDialogDescription>
                                确定要删除这份学业荣誉吗？删除后无法恢复。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteHonor(honor.id)}>
                                删除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

