import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function GuarantorInfo() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    idCardNo: '',
    relationship: '',
    phone: '',
    workUnit: '',
    position: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.idCardNo || !formData.phone) {
      toast.error('请填写完整信息');
      return;
    }

    if (!agreed) {
      toast.error('请阅读并同意知情同意书');
      return;
    }

    setLoading(true);
    
    try {
      // TODO: 调用后端API
      toast.success('担保人信息提交成功');
      setLocation('/loan-products');
    } catch (error) {
      toast.error('提交失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <Card className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">担保人信息</h1>
            <p className="text-muted-foreground">请填写担保人基本信息</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">担保人姓名 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入担保人姓名"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="idCardNo">身份证号 *</Label>
                <Input
                  id="idCardNo"
                  value={formData.idCardNo}
                  onChange={(e) => setFormData({ ...formData, idCardNo: e.target.value })}
                  placeholder="请输入身份证号"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship">与本人关系 *</Label>
                <Input
                  id="relationship"
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  placeholder="如：父亲、母亲"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">联系电话 *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="请输入联系电话"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workUnit">工作单位</Label>
                <Input
                  id="workUnit"
                  value={formData.workUnit}
                  onChange={(e) => setFormData({ ...formData, workUnit: e.target.value })}
                  placeholder="请输入工作单位"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">职务</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="请输入职务"
                />
              </div>
            </div>

            <Card className="p-4 bg-muted">
              <h3 className="font-semibold mb-2">知情同意书</h3>
              <p className="text-sm text-muted-foreground mb-4">
                本人作为申请人的担保人，已充分了解贷款相关条款，同意为申请人提供担保，并承担相应的担保责任。
              </p>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="agree" 
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked as boolean)}
                />
                <Label htmlFor="agree" className="text-sm cursor-pointer">
                  我已阅读并同意《担保人知情同意书》
                </Label>
              </div>
            </Card>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => setLocation('/identity-verification')}>
                上一步
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? '提交中...' : '提交并继续'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
