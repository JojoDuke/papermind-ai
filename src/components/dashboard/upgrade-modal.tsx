"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUserId();
  }, []);

  const handleUpgrade = () => {
    if (!userId) return;

    const successUrl = `${window.location.origin}/dashboard?subscription=success`;
    const cancelUrl = `${window.location.origin}/dashboard`;

    // Create base URL
    const checkoutUrl = new URL('https://test.checkout.dodopayments.com/buy/pdt_idWXm8RKDDzZ5nnMMDyLo');
    
    // Add parameters with proper encoding
    const params = new URLSearchParams({
      'quantity': '1',
      'metadata[user_id]': userId,
      'success_url': successUrl,
      'cancel_url': cancelUrl,
    });
    
    // Combine URL and parameters
    window.location.href = `${checkoutUrl.toString()}?${params.toString()}`;
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
            <li>Priority support</li>
          </ul>
        </div>
        <div className="flex justify-center w-full">
          <Button 
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-500 hover:from-purple-600 hover:via-purple-700 hover:to-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <Sparkles className="h-5 w-5" />
            Upgrade Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 