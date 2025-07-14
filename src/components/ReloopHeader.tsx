import { Award, Recycle, Menu, Info, BarChart3, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface ReloopHeaderProps {
  points?: number;
  onViewPoints?: () => void;
  onViewStats?: () => void;
  onViewInfo?: () => void;
  onViewSettings?: () => void;
  onLogin?: () => void;
  onRegister?: () => void;
  user?: { id: string; phone_hash: string } | null;
}

export function ReloopHeader({ points = 0, onViewPoints, onViewStats, onViewInfo, onViewSettings, onLogin, onRegister, user }: ReloopHeaderProps) {
  return (
    <header className="bg-gradient-eco text-primary-foreground p-4 shadow-eco sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <Recycle className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold">Reloop</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {onViewPoints && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onViewPoints}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <Award className="w-4 h-4 mr-1" />
              {points} pts
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Menu className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 bg-card border-border shadow-lg z-50"
            >
              <DropdownMenuItem onClick={onViewStats} className="cursor-pointer">
                <BarChart3 className="w-4 h-4 mr-2" />
                Impact Stats
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onViewInfo} className="cursor-pointer">
                <Info className="w-4 h-4 mr-2" />
                Toxicity Guide
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {!user && (
                <>
                  <DropdownMenuItem onClick={onLogin} className="cursor-pointer">
                    <Award className="w-4 h-4 mr-2" />
                    Login
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onRegister} className="cursor-pointer">
                    <Award className="w-4 h-4 mr-2" />
                    Register
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={onViewSettings} className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}