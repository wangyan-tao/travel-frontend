import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { profileApi, type UserLocation } from '@/lib/profileApi';
import { getProvinces, getCitiesByProvince } from '@/lib/cityData';
import { toast } from 'sonner';

interface EditLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: UserLocation | null | undefined;
  onSuccess?: () => void;
}

export default function EditLocationDialog({
  open,
  onOpenChange,
  location,
  onSuccess,
}: EditLocationDialogProps) {
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  const provinces = getProvinces();
  const cities = province ? getCitiesByProvince(province) : [];

  useEffect(() => {
    if (open && location) {
      setProvince(location.currentProvince || '');
      setCity(location.currentCity || '');
    } else if (open) {
      setProvince('');
      setCity('');
    }
  }, [open, location]);

  const handleProvinceChange = (value: string) => {
    setProvince(value);
    setCity(''); // 重置城市选择
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!province && !city) {
      toast.error('请至少选择省份或城市');
      return;
    }

    try {
      setLoading(true);
      await profileApi.updateLocation(province || undefined, city || undefined);
      toast.success('位置信息更新成功');
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('更新位置信息失败:', error);
      toast.error(error.message || '更新位置信息失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>修改位置信息</DialogTitle>
          <DialogDescription>更新您的所在省份和城市</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="province">所在省份</Label>
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
            <Label htmlFor="city">所在城市</Label>
            <Select
              value={city}
              onValueChange={setCity}
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              保存
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

