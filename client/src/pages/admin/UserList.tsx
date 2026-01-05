import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, User, Mail, Phone, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface UserData {
  id: number;
  username: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function UserList() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // 模拟数据加载
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      const mockUsers: UserData[] = [
        {
          id: 1,
          username: 'student001',
          email: 'student001@example.com',
          phone: '13800138001',
          role: 'USER',
          status: 'ACTIVE',
          createdAt: '2024-01-15'
        },
        {
          id: 2,
          username: 'student002',
          email: 'student002@example.com',
          phone: '13800138002',
          role: 'USER',
          status: 'ACTIVE',
          createdAt: '2024-01-16'
        },
        // 可以添加更多模拟数据
      ];
      setUsers(mockUsers);
      setLoading(false);
    }, 500);
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">用户列表</h1>
          <p className="text-muted-foreground">查看和管理所有注册用户</p>
        </div>

        {/* 搜索栏 */}
        <Card className="p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索用户名或邮箱..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={loadUsers}>
              刷新
            </Button>
          </div>
        </Card>

        {/* 用户列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{user.username}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {user.createdAt}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {user.status === 'ACTIVE' ? '活跃' : '未激活'}
                    </Badge>
                    <Badge variant="outline">
                      {user.role === 'ADMIN' ? '管理员' : '用户'}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            没有找到匹配的用户
          </div>
        )}
      </div>
    </div>
  );
}
