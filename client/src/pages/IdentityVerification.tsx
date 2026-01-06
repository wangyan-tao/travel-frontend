import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import IDCardOCR from '@/components/IDCardOCR';
import axios from '@/lib/axios';

// 中国34个省份列表
const PROVINCES = [
  '北京市', '天津市', '河北省', '山西省', '内蒙古自治区',
  '辽宁省', '吉林省', '黑龙江省', '上海市', '江苏省',
  '浙江省', '安徽省', '福建省', '江西省', '山东省',
  '河南省', '湖北省', '湖南省', '广东省', '广西壮族自治区',
  '海南省', '重庆市', '四川省', '贵州省', '云南省',
  '西藏自治区', '陕西省', '甘肃省', '青海省', '宁夏回族自治区',
  '新疆维吾尔自治区', '台湾省', '香港特别行政区', '澳门特别行政区'
];

export default function IdentityVerification() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    realName: '',
    idCard: '',
    idCardFrontUrl: '',
    idCardBackUrl: '',
    studentId: '',
    studentCardUrl: '',
    university: '',
    major: '',
    grade: '',
    city: ''
  });

  const handleIDCardDataExtracted = (data: any, side: 'front' | 'back') => {
    if (side === 'front') {
      setFormData(prev => ({
        ...prev,
        realName: data.name || prev.realName,
        idCard: data.idNumber || prev.idCard,
        idCardFrontUrl: data.imageUrl || prev.idCardFrontUrl
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        idCardBackUrl: data.imageUrl || prev.idCardBackUrl
      }));
    }
  };

  const handleStudentCardExtracted = (data: any) => {
    if (data?.imageUrl) {
      setFormData(prev => ({
        ...prev,
        studentCardUrl: data.imageUrl
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (
      !formData.realName ||
      !formData.idCard ||
      !formData.idCardFrontUrl ||
      !formData.idCardBackUrl ||
      !formData.studentId ||
      !formData.studentCardUrl ||
      !formData.university ||
      !formData.major ||
      !formData.grade ||
      !formData.city
    ) {
      toast.error('请完整填写必填信息并上传证件照片');
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        realName: formData.realName,
        idCard: formData.idCard,
        idCardFrontUrl: formData.idCardFrontUrl,
        idCardBackUrl: formData.idCardBackUrl,
        studentId: formData.studentId,
        studentCardUrl: formData.studentCardUrl,
        university: formData.university,
        major: formData.major,
        grade: formData.grade,
        city: formData.city
      };
      const response: any = await axios.post('/identity/submit', payload);
      if (response.code === 200) {
        toast.success('实名信息提交成功');
        setLocation('/guarantor-info');
      } else {
        toast.error(response.message || '提交失败，请稍后重试');
      }
    } catch (error: any) {
      toast.error(error.message || '提交失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <Card className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">实名认证</h1>
            <p className="text-muted-foreground">请上传身份证和学生证完成实名认证</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 身份证上传 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">身份证信息</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <IDCardOCR 
                  side="front" 
                  onDataExtracted={(data) => handleIDCardDataExtracted(data, 'front')} 
                />
                <IDCardOCR 
                  side="back" 
                  onDataExtracted={(data) => handleIDCardDataExtracted(data, 'back')} 
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">学生证信息</h3>
              <div className="grid md:grid-cols-1 gap-4">
                <IDCardOCR
                  side="front"
                  title="上传学生证"
                  onDataExtracted={handleStudentCardExtracted}
                />
              </div>
            </div>

            {/* 基本信息 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="realName">姓名 *</Label>
                <Input
                  id="realName"
                  value={formData.realName}
                  onChange={(e) => setFormData({ ...formData, realName: e.target.value })}
                  placeholder="请输入真实姓名"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="idCard">身份证号 *</Label>
                <Input
                  id="idCard"
                  value={formData.idCard}
                  onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
                  placeholder="请输入身份证号"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentId">学号 *</Label>
                <Input
                  id="studentId"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  placeholder="请输入学号"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="university">所在大学 *</Label>
                <Input
                  id="university"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  placeholder="请输入大学名称"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="major">专业 *</Label>
                <Input
                  id="major"
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  placeholder="请输入专业"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">年级 *</Label>
                <Input
                  id="grade"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  placeholder="请输入年级，如 大一/大二"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">所在省份 *</Label>
                <Select
                  value={formData.city}
                  onValueChange={(value) => setFormData({ ...formData, city: value })}
                >
                  <SelectTrigger id="city">
                    <SelectValue placeholder="请选择所在省份" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVINCES.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => setLocation('/login')}>
                返回
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? '提交中...' : '提交认证'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
