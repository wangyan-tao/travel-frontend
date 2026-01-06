import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { profileApi, type EvaluationRequest } from '@/lib/profileApi';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Evaluation() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<EvaluationRequest>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<{ score: number; level: string } | null>(null);

  const questions = [
    {
      id: 'monthlyIncome',
      title: '您的月收入范围是？',
      options: [
        { value: '1000以下', label: '1000元以下' },
        { value: '1000-2000', label: '1000-2000元' },
        { value: '2000-3000', label: '2000-3000元' },
        { value: '3000以上', label: '3000元以上' },
      ],
    },
    {
      id: 'repaymentCapability',
      title: '您的还款能力如何？',
      options: [
        { value: '完全无法还款', label: '完全无法还款' },
        { value: '还款困难', label: '还款困难' },
        { value: '可以还款', label: '可以还款' },
        { value: '轻松还款', label: '轻松还款' },
      ],
    },
    {
      id: 'creditRecord',
      title: '您的信用记录如何？',
      options: [
        { value: '有逾期记录', label: '有逾期记录' },
        { value: '信用一般', label: '信用一般' },
        { value: '信用良好', label: '信用良好' },
        { value: '信用优秀', label: '信用优秀' },
      ],
    },
    {
      id: 'travelBudget',
      title: '您的旅游预算范围是？',
      options: [
        { value: '1000以下', label: '1000元以下' },
        { value: '1000-2000', label: '1000-2000元' },
        { value: '2000-3000', label: '2000-3000元' },
        { value: '3000以上', label: '3000元以上' },
      ],
    },
    {
      id: 'repaymentPreference',
      title: '您希望的还款期限是？',
      options: [
        { value: '1-2个月', label: '1-2个月' },
        { value: '3-6个月', label: '3-6个月' },
        { value: '6-12个月', label: '6-12个月' },
        { value: '12个月以上', label: '12个月以上' },
      ],
    },
    {
      id: 'riskTolerance',
      title: '您的风险承受能力是？',
      options: [
        { value: '保守型', label: '保守型（低风险）' },
        { value: '稳健型', label: '稳健型（中低风险）' },
        { value: '积极型', label: '积极型（中高风险）' },
        { value: '激进型', label: '激进型（高风险）' },
      ],
    },
  ];

  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleNext = () => {
    const currentQuestion = questions[currentStep];
    if (!formData[currentQuestion.id as keyof EvaluationRequest]) {
      toast.error('请选择一个选项');
      return;
    }
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(formData).length !== questions.length) {
      toast.error('请完成所有问题');
      return;
    }

    setSubmitting(true);
    try {
      const request: EvaluationRequest = {
        monthlyIncome: formData.monthlyIncome || '',
        repaymentCapability: formData.repaymentCapability || '',
        creditRecord: formData.creditRecord || '',
        travelBudget: formData.travelBudget || '',
        repaymentPreference: formData.repaymentPreference || '',
        riskTolerance: formData.riskTolerance || '',
        answers: formData as Record<string, any>,
      };

      const evaluation = await profileApi.submitEvaluation(request);
      setResult({
        score: evaluation.totalScore,
        level: evaluation.evaluationLevel,
      });
      setShowResult(true);
      toast.success('测评提交成功！');
    } catch (error: any) {
      toast.error(error.message || '提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const getLevelDescription = (level: string) => {
    switch (level) {
      case 'R1':
        return '低风险（85-100分）：您的信用状况和还款能力优秀，可以申请较高额度的贷款产品。';
      case 'R2':
        return '中低风险（70-84分）：您的信用状况和还款能力良好，可以申请中等额度的贷款产品。';
      case 'R3':
        return '中风险（55-69分）：您的信用状况和还款能力一般，建议申请较低额度的贷款产品。';
      case 'R4':
        return '中高风险（40-54分）：您的信用状况和还款能力需要提升，建议谨慎申请贷款。';
      case 'R5':
        return '高风险（0-39分）：建议先提升信用状况和还款能力后再申请贷款。';
      default:
        return '';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'R1':
        return 'text-green-600';
      case 'R2':
        return 'text-blue-600';
      case 'R3':
        return 'text-yellow-600';
      case 'R4':
        return 'text-orange-600';
      case 'R5':
        return 'text-red-600';
      default:
        return '';
    }
  };

  if (showResult && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <CheckCircle2 className="h-16 w-16 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">测评完成</h2>
              <p className="text-muted-foreground">感谢您完成测评问卷</p>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">测评总分</div>
                <div className="text-4xl font-bold text-primary">{result.score} 分</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">测评等级</div>
                <div className={`text-4xl font-bold ${getLevelColor(result.level)}`}>
                  {result.level}
                </div>
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>测评结果</AlertTitle>
                <AlertDescription>{getLevelDescription(result.level)}</AlertDescription>
              </Alert>
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setLocation('/loan-products')} className="min-w-[120px]">
                查看产品
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowResult(false);
                  setCurrentStep(0);
                  setFormData({});
                }}
              >
                重新测评
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        <Card className="p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">风险测评问卷</h1>
            <p className="text-muted-foreground">
              请如实填写以下问题，以便我们为您推荐合适的贷款产品
            </p>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>进度</span>
              <span>
                {currentStep + 1} / {questions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-6 mb-8">
            <div>
              <Label className="text-lg font-semibold mb-4 block">
                {currentQuestion.title}
              </Label>
              <RadioGroup
                value={formData[currentQuestion.id as keyof EvaluationRequest] || ''}
                onValueChange={(value) => {
                  setFormData({
                    ...formData,
                    [currentQuestion.id]: value,
                  });
                }}
                className="space-y-3"
              >
                {currentQuestion.options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label
                      htmlFor={option.value}
                      className="font-normal cursor-pointer flex-1"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              上一题
            </Button>
            <Button onClick={handleNext} disabled={submitting}>
              {currentStep === questions.length - 1 ? '提交' : '下一题'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

