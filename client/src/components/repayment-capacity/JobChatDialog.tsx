import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Phone, MapPin, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'recruiter';
  timestamp: Date;
}

interface JobChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: {
    id: number;
    jobTitle: string;
    companyName: string;
    city: string;
    district: string;
    contactPhone: string;
    salaryRange: string;
    jobType: string;
  };
}

export default function JobChatDialog({ open, onOpenChange, job }: JobChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `您好，我对${job.jobTitle}这个岗位很感兴趣，想了解一下具体的工作内容和要求。`,
      sender: 'user',
      timestamp: new Date(),
    },
    {
      id: '2',
      content: `您好！感谢您对我们${job.companyName}的关注。这个岗位主要负责${job.jobTitle}相关工作，工作时间灵活，适合在校大学生。请问您什么时候方便来面试呢？`,
      sender: 'recruiter',
      timestamp: new Date(Date.now() + 1000),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 自动滚动到底部
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputValue('');

    // 模拟招聘方回复（实际应该通过WebSocket或API实现）
    setTimeout(() => {
      const replyMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '收到您的消息，我们会尽快回复您。如有紧急问题，请直接拨打联系电话。',
        sender: 'recruiter',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, replyMessage]);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCall = () => {
    window.location.href = `tel:${job.contactPhone}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-500 text-white">
                  {job.companyName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-lg">{job.companyName}</DialogTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Briefcase className="h-3 w-3" />
                  <span>{job.jobTitle}</span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCall}
              className="flex items-center gap-2"
            >
              <Phone className="h-4 w-4" />
              拨打电话
            </Button>
          </div>
          
          {/* 岗位信息 */}
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{job.city} {job.district}</span>
            </div>
            <span>薪资：{job.salaryRange}</span>
            <span>类型：{job.jobType}</span>
          </div>
        </DialogHeader>

        {/* 聊天消息区域 */}
        <ScrollArea className="flex-1">
          <div className="px-6 py-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'recruiter' && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-blue-500 text-white text-xs">
                      {job.companyName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`flex flex-col max-w-[70%] ${
                    message.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                {message.sender === 'user' && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-gray-500 text-white text-xs">
                      我
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* 输入区域 */}
        <div className="border-t px-6 py-4">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息..."
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!inputValue.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            提示：您也可以直接拨打 <span className="text-blue-600 font-medium">{job.contactPhone}</span> 联系招聘方
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

