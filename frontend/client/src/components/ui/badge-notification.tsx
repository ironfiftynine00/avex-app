import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface BadgeNotificationProps {
  badge: {
    id: string;
    name: string;
    description: string;
    icon?: string;
  };
  isVisible: boolean;
  onClose: () => void;
}

export function BadgeNotification({ badge, isVisible, onClose }: BadgeNotificationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        setShow(false);
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-2xl border-0 max-w-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold">Badge Earned!</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShow(false);
                    onClose();
                  }}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="text-center">
                <div className="text-4xl mb-2">🏆</div>
                <h4 className="text-xl font-semibold mb-2">{badge.name}</h4>
                <p className="text-white/90 text-sm">{badge.description}</p>
              </div>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                className="mt-4 text-center"
              >
                <div className="inline-flex items-center space-x-1 bg-white/20 rounded-full px-3 py-1 text-sm">
                  <Award className="w-4 h-4" />
                  <span>Achievement Unlocked</span>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}