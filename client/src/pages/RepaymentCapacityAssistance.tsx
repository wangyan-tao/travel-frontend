import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, GraduationCap, FolderOpen, TrendingUp, Sparkles } from 'lucide-react';
import PartTimeJobRecommendation from '@/components/repayment-capacity/PartTimeJobRecommendation';
import AcademicHonorUpload from '@/components/repayment-capacity/AcademicHonorUpload';
import QualificationArchive from '@/components/repayment-capacity/QualificationArchive';

export default function RepaymentCapacityAssistance() {
  const [activeTab, setActiveTab] = useState('jobs');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container py-8 md:py-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                还款能力辅助板块
              </h1>
              <p className="text-muted-foreground mt-1">
                资质提升 + 渠道拓展
              </p>
            </div>
          </div>
          
          {/* Description Card */}
          <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="pt-6">
              <p className="text-base leading-relaxed text-gray-700">
                本板块核心为职场新秀提供贷款资质加分项，通过两类路径助力提升贷款审批通过率、拉高授信额度，
                适配不同需求的职场新秀，双向并行覆盖无兼职/有兼职、重学业/重实践等各类群体。
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">实践创收路径</CardTitle>
                  <CardDescription>兼职商铺 & 就业单位推荐</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                基于注册位置信息，精准推荐本地合规兼职商铺，支持上传兼职证明作为还款能力支撑材料
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">学业资质路径</CardTitle>
                  <CardDescription>学业荣誉证明上传</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                专为无时间兼职但学业优秀的职场新秀提供，上传学业成绩和荣誉证书，帮助降低利率、提高授信额度
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-white/80 backdrop-blur-sm">
            <TabsTrigger 
              value="jobs" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white flex items-center gap-2 py-3"
            >
              <Briefcase className="h-4 w-4" />
              <span>兼职推荐</span>
            </TabsTrigger>
            <TabsTrigger 
              value="honors" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white flex items-center gap-2 py-3"
            >
              <GraduationCap className="h-4 w-4" />
              <span>学业荣誉</span>
            </TabsTrigger>
            <TabsTrigger 
              value="archive" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white flex items-center gap-2 py-3"
            >
              <FolderOpen className="h-4 w-4" />
              <span>资质档案</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="mt-6">
            <PartTimeJobRecommendation />
          </TabsContent>

          <TabsContent value="honors" className="mt-6">
            <AcademicHonorUpload />
          </TabsContent>

          <TabsContent value="archive" className="mt-6">
            <QualificationArchive />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

