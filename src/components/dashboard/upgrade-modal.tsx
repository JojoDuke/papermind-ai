"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, Sparkles, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useCredits } from "@/contexts/CreditsContext";
import { useToast } from "@/components/ui/use-toast";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { refreshCredits } = useCredits();
  const { toast } = useToast();

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUserId();
  }, []);

  const handleUpgrade = async () => {
    if (!userId) return;
    
    // Direct redirect to Dodo Payments with production product ID
    const currentOrigin = window.location.origin;
    const paymentUrl = `https://checkout.dodopayments.com/buy/pdt_d7YDUnxXaEs3K3DyEyUOO?quantity=1&redirect_url=${encodeURIComponent(`${currentOrigin}/dashboard?success=true`)}&metadata_user_id=${encodeURIComponent(userId)}`;
    window.location.href = paymentUrl;
  };

  const handleRefreshPremium = async () => {
    if (!userId) return;
    
    setIsRefreshing(true);
    try {
      // Try the manual test endpoint first
      const testEndpointUrl = `https://papermind-ai-backend.onrender.com/test/update-premium/${userId}`;
      const response = await fetch(testEndpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh premium status');
      }
      
      const result = await response.json();
      console.log('Premium refresh result:', result);
      
      // Refresh the UI to reflect the changes
      await refreshCredits();
      
      toast({
        title: "Premium status refreshed",
        description: "Your premium status has been updated successfully.",
        variant: "default",
      });
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error refreshing premium status:', error);
      toast({
        title: "Error",
        description: "Failed to refresh premium status. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-purple-500" />
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription>
            Get unlimited access to all features and 100 credits per month.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-500">
            Upgrade to Premium to continue using the chat feature and unlock:
          </p>
          <ul className="list-disc pl-4 text-sm text-gray-500 space-y-2">
            <li>100 monthly credits</li>
            <li>Exclusive podcast feature</li>
            <li>Advanced AI document analysis</li>
            <li>Total Upload Limit increased to 50MB</li>
            <li>Priority support</li>
          </ul>
        </div>
        <DialogFooter className="flex flex-col space-y-2">
          <Button 
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-500 hover:from-purple-600 hover:via-purple-700 hover:to-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <Sparkles className="h-5 w-5" />
            Upgrade Now
          </Button>
          
          <Button
            variant="outline"
            onClick={handleRefreshPremium}
            disabled={isRefreshing}
            className="text-xs"
          >
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {isRefreshing ? "Refreshing..." : "Already Paid? Refresh Premium Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 