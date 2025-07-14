import { Award, Recycle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReloopHeaderProps {
  points?: number;
  onViewPoints?: () => void;
}

export function ReloopHeader({ points = 0, onViewPoints }: ReloopHeaderProps) {
  return (
    <header className="bg-gradient-eco text-primary-foreground p-4 shadow-eco">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <Recycle className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold">Reloop</h1>
        </div>
        
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
      </div>
    </header>
  );
}