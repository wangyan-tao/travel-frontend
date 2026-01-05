import { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { createWorker } from 'tesseract.js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { uploadFile } from '@/lib/axios';

interface IDCardData {
  name?: string;
  idNumber?: string;
  address?: string;
  issueDate?: string;
  imageData?: string;
  imageUrl?: string;
}

interface IDCardOCRProps {
  onDataExtracted: (data: IDCardData) => void;
  side: 'front' | 'back';
  title?: string;
}

export default function IDCardOCR({ onDataExtracted, side, title }: IDCardOCRProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 身份证号码正则
  const idCardRegex = /\d{17}[\dXx]/;
  
  // 姓名正则（中文2-4个字）
  const nameRegex = /姓名[：:]\s*([^\s]{2,4})/;
  
  // 地址正则
  const addressRegex = /住址[：:]\s*(.+?)(?=出生|$)/;

  const processImage = async (imageData: string, file: File) => {
    setIsProcessing(true);
    
    try {
      // 1. 上传文件到七牛云
      let imageUrl = '';
      try {
        imageUrl = await uploadFile(file);
      } catch (uploadError) {
        console.error('文件上传失败:', uploadError);
        toast.error('图片上传失败，请重试');
        setIsProcessing(false);
        return;
      }

      // 2. OCR识别
      const worker = await createWorker('chi_sim');
      
      const { data: { text } } = await worker.recognize(imageData);
      await worker.terminate();
      
      // 提取身份证信息
      const extractedData: IDCardData = {};
      
      // 提取身份证号
      const idMatch = text.match(idCardRegex);
      if (idMatch) {
        extractedData.idNumber = idMatch[0];
      }
      
      // 提取姓名（仅正面）
      if (side === 'front') {
        const nameMatch = text.match(nameRegex);
        if (nameMatch) {
          extractedData.name = nameMatch[1];
        }
        
        // 提取地址
        const addressMatch = text.match(addressRegex);
        if (addressMatch) {
          extractedData.address = addressMatch[1].trim();
        }
      }
      
      // 提取签发日期（仅反面）
      if (side === 'back') {
        const dateMatch = text.match(/(\d{4}\.\d{2}\.\d{2})/);
        if (dateMatch) {
          extractedData.issueDate = dateMatch[1];
        }
      }
      
      if (Object.keys(extractedData).length > 0) {
        onDataExtracted({ ...extractedData, imageData, imageUrl });
        toast.success('身份证信息识别成功');
      } else {
        onDataExtracted({ imageData, imageUrl });
        toast.warning('未能识别到有效信息，请手动填写');
      }
      
    } catch (error) {
      console.error('OCR识别失败:', error);
      toast.error('图片识别失败，请重试或手动填写');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCapture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setShowCamera(false);
      
      // Convert base64 to file
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          processImage(imageSrc, file);
        });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 检查文件大小（最大10MB）
      if (file.size > 10 * 1024 * 1024) {
        toast.error('图片大小不能超过10MB');
        return;
      }
      
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        toast.error('请上传图片文件');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setCapturedImage(imageData);
        processImage(imageData, file);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {title ? title : `上传身份证${side === 'front' ? '正面' : '反面'}`}
        </h3>
        
        {showCamera ? (
          <div className="space-y-4">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full rounded-lg"
              videoConstraints={{
                facingMode: 'environment'
              }}
            />
            <div className="flex gap-2">
              <Button onClick={handleCapture} className="flex-1">
                <Camera className="mr-2 h-4 w-4" />
                拍照
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCamera(false)}
                className="flex-1"
              >
                取消
              </Button>
            </div>
          </div>
        ) : capturedImage ? (
          <div className="space-y-4">
            <img 
              src={capturedImage} 
              alt="身份证" 
              className="w-full rounded-lg border"
            />
            {isProcessing && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>正在识别身份证信息...</span>
              </div>
            )}
            <Button 
              variant="outline" 
              onClick={() => {
                setCapturedImage(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="w-full"
            >
              重新上传
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={() => setShowCamera(true)}
              className="h-32 flex flex-col"
            >
              <Camera className="h-8 w-8 mb-2" />
              <span>拍照上传</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              className="h-32 flex flex-col"
            >
              <Upload className="h-8 w-8 mb-2" />
              <span>从相册选择</span>
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}
        
        <p className="text-sm text-muted-foreground">
          提示：请确保身份证图片清晰完整，系统将自动识别并填写信息
        </p>
      </div>
    </Card>
  );
}
