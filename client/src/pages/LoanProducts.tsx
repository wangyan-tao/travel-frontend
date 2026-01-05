import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { toast } from 'sonner';
import axios from '@/lib/axios';

interface LoanProduct {
  id: number;
  productName: string;
  productType: string;
  minAmount: number;
  maxAmount: number;
  interestRate: number;
  minTerm: number;
  maxTerm: number;
  institutionName: string;
}

export default function LoanProducts() {
  const [productType, setProductType] = useState('all');
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params: any = {
          page,
          size: pageSize,
        };
        if (productType !== 'all') {
          params.productType = productType;
        }
        const response: any = await axios.get('/loan-products', { params });
        if (response.code === 200) {
          const list: LoanProduct[] = response.data || [];
          setProducts(list);
          setHasMore(Array.isArray(list) && list.length === pageSize);
        } else {
          toast.error(response.message || '获取贷款产品失败');
        }
      } catch (error: any) {
        toast.error(error.message || '获取贷款产品失败');
      }
    };
    fetchProducts();
  }, [productType, page]);

  useEffect(() => {
    setPage(1);
  }, [productType]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* 导航栏 */}
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">青</span>
                </div>
                <span className="text-xl font-bold">青春旅贷</span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/repayment">
                <Button variant="ghost">还款管理</Button>
              </Link>
              <Button variant="outline" onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}>
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">贷款产品</h1>
          <p className="text-muted-foreground">选择适合您的旅游贷款产品</p>
        </div>

        {/* 筛选 */}
        <div className="mb-6">
          <Select value={productType} onValueChange={setProductType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部产品</SelectItem>
              <SelectItem value="短期旅游">短期旅游</SelectItem>
              <SelectItem value="中期旅游">中期旅游</SelectItem>
              <SelectItem value="长期旅游">长期旅游</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{product.productName}</h3>
                    <Badge variant="secondary">{product.productType}</Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">额度范围</span>
                    <span className="font-semibold">
                      ¥{Number(product.minAmount).toFixed(2)} - ¥{Number(product.maxAmount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">年化利率</span>
                    <span className="font-semibold text-primary">
                      {Number(product.interestRate).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">分期期限</span>
                    <span className="font-semibold">
                      {product.minTerm}-{product.maxTerm}个月
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">持牌机构</span>
                    <span className="font-semibold">{product.institutionName}</span>
                  </div>
                </div>

                <Link href={`/loan-application/${product.id}`}>
                  <Button className="w-full">立即申请</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {products.length > 0 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    className={page === 1 ? 'pointer-events-none opacity-50' : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) {
                        setPage(page - 1);
                      }
                    }}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-3 text-sm text-muted-foreground">
                    第 {page} 页
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    className={!hasMore ? 'pointer-events-none opacity-50' : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      if (hasMore) {
                        setPage(page + 1);
                      }
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
