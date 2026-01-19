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
import { getProvinces, getCitiesByProvince } from '@/lib/cityData';

export default function IdentityVerification() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [formData, setFormData] = useState({
    realName: '',
    idCard: '',
    idCardFrontUrl: '',
    idCardBackUrl: '',
    university: '',
    city: ''
  });

  const provinces = getProvinces();
  const cities = province ? getCitiesByProvince(province) : [];

  const handleProvinceChange = (value: string) => {
    setProvince(value);
    setCity(''); // 重置城市选择
    setFormData({ ...formData, city: '' });
  };

  const handleCityChange = (value: string) => {
    setCity(value);
    // 只存储城市名称，不包含省份
    setFormData({ ...formData, city: value });
  };

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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (
      !formData.realName ||
      !formData.idCard ||
      !formData.idCardFrontUrl ||
      !formData.idCardBackUrl ||
      !formData.university ||
      !province ||
      !city ||
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
        university: formData.university,
        city: formData.city
      };
      const response: any = await axios.post('/identity/submit', payload);
      if (response.code === 200) {
        toast.success('实名信息提交成功');
        // 触发全局事件，通知所有使用 useIdentityGuard 的组件更新认证状态
        window.dispatchEvent(new Event('identity-verified'));
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
            <p className="text-muted-foreground">请上传身份证完成实名认证</p>
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
                <Label htmlFor="university">毕业院校 *</Label>
                <Input
                  id="university"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  placeholder="请输入毕业院校名称"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">所在省份 *</Label>
                <Select
                  value={province}
                  onValueChange={handleProvinceChange}
                >
                  <SelectTrigger id="province">
                    <SelectValue placeholder="请选择所在省份" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">所在城市 *</Label>
                <Select
                  value={city}
                  onValueChange={handleCityChange}
                  disabled={!province}
                >
                  <SelectTrigger id="city">
                    <SelectValue placeholder={province ? "请选择所在城市" : "请先选择省份"} />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
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
