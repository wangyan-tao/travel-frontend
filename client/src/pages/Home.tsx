import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, TrendingUp, Clock, Award } from 'lucide-react';
import { useIdentityGuard } from '@/hooks/useIdentityGuard';

export default function Home() {
  const [, setLocation] = useLocation();
  const { interceptNavigation } = useIdentityGuard();

  const handleProtectedLinkClick = (e: React.MouseEvent, path: string) => {
    if (!interceptNavigation(path)) {
      e.preventDefault();
    }
  };
  const features = [
    {
      icon: Shield,
      title: '安全可靠',
      description: '持牌机构合作，全程合规透明，保障用户资金安全'
    },
    {
      icon: TrendingUp,
      title: '低息优惠',
      description: '专为大学生设计的低息贷款产品，减轻还款压力'
    },
    {
      icon: Clock,
      title: '快速审批',
      description: '在线申请，快速审批，最快当天到账'
    },
    {
      icon: Award,
      title: '学业加分',
      description: '上传学业荣誉证明，提升授信额度和利率优惠'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl font-bold tracking-tight">
              青春旅贷
            </h1>
            <p className="text-2xl text-muted-foreground">
              大学生专属旅游贷款平台
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              低门槛、强适配、全透明的旅游贷款服务，助力大学生安全、理性实现出行梦想
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8">
                  立即注册
                </Button>
              </Link>
              <Link href="/loan-products" onClick={(e) => handleProtectedLinkClick(e, '/loan-products')}>
                <Button size="lg" variant="outline" className="text-lg px-8">
                  浏览产品
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">核心优势</h2>
            <p className="text-muted-foreground">专为大学生打造的贷款服务</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">申请流程</h2>
            <p className="text-muted-foreground">简单三步，轻松获得贷款</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '01', title: '实名注册', desc: '上传身份证和学生证，完成实名认证' },
                { step: '02', title: '选择产品', desc: '浏览贷款产品，选择适合的额度和期限' },
                { step: '03', title: '提交申请', desc: '填写申请信息，等待审批通过' }
              ].map((item, index) => (
                <div key={index} className="text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="p-12 text-center bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <h2 className="text-3xl font-bold mb-4">开启你的旅行之旅</h2>
            <p className="text-lg mb-8 opacity-90">
              立即注册，享受大学生专属优惠
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                免费注册
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p>© 2024 青春旅贷. All rights reserved.</p>
            <p className="mt-2 text-sm">专注大学生旅游贷款服务</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
