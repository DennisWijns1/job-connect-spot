import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, CheckCircle, Euro } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface PaymentQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientId?: string;
  recipientIBAN?: string;
  projectTitle?: string;
  projectId?: string;
  suggestedAmount?: number;
}

export const PaymentQRModal = ({
  isOpen,
  onClose,
  recipientName,
  recipientId,
  recipientIBAN = 'BE71 0961 2345 6769',
  projectTitle,
  projectId,
  suggestedAmount,
}: PaymentQRModalProps) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState(suggestedAmount?.toString() || '');
  const [isPaid, setIsPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR code whenever amount changes
  useEffect(() => {
    if (!isOpen || !amount || parseFloat(amount) <= 0) {
      setQrDataUrl(null);
      return;
    }

    const paymentData = `BCD\n002\n1\nSCT\n\n${recipientName}\n${recipientIBAN.replace(/\s/g, '')}\nEUR${parseFloat(amount).toFixed(2)}\n\n\n${projectTitle || 'HandyMatch Betaling'}`;

    QRCode.toDataURL(paymentData, {
      errorCorrectionLevel: 'M',
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
      width: 192,
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => {
        console.error('QR generation error:', err);
        setQrDataUrl(null);
      });
  }, [amount, isOpen, recipientName, recipientIBAN, projectTitle]);

  const handlePaymentConfirm = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Voer een geldig bedrag in');
      return;
    }

    setIsProcessing(true);

    try {
      // Record payment in Supabase if we have a user
      if (user) {
        const reference = `HM-${Date.now()}`;
        await (supabase.from('payments' as any) as any).insert({
          payer_id: user.id,
          recipient_id: recipientId || null,
          project_id: projectId || null,
          amount: parseFloat(amount),
          currency: 'EUR',
          status: 'completed',
          reference,
          completed_at: new Date().toISOString(),
        });
      }

      setIsPaid(true);
      toast.success(`Betaling van €${amount} verstuurd naar ${recipientName}!`);

      setTimeout(() => {
        setIsPaid(false);
        setAmount('');
        setQrDataUrl(null);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Payment recording error:', err);
      // Still show success as the QR was shown (actual payment happens via bank app)
      setIsPaid(true);
      toast.success(`Betaling van €${amount} verstuurd naar ${recipientName}!`);
      setTimeout(() => {
        setIsPaid(false);
        setAmount('');
        setQrDataUrl(null);
        onClose();
      }, 2000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto"
          >
            <div className="bg-card rounded-[24px] overflow-hidden shadow-card-hover">
              {/* Header */}
              <div className="gradient-primary p-6 text-white relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-[16px] bg-white/20 flex items-center justify-center">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-xl">Betaal {recipientName}</h2>
                    {projectTitle && (
                      <p className="text-white/80 text-sm">{projectTitle}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {isPaid ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10 text-success" />
                    </div>
                    <h3 className="font-display font-bold text-xl text-foreground mb-2">
                      Betaling Verstuurd!
                    </h3>
                    <p className="text-muted-foreground">
                      €{amount} naar {recipientName}
                    </p>
                  </motion.div>
                ) : (
                  <>
                    {/* QR Code */}
                    <div className="bg-white p-4 rounded-[20px] mb-6 flex items-center justify-center">
                      {qrDataUrl ? (
                        <motion.img
                          key={qrDataUrl}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          src={qrDataUrl}
                          alt="Betaal QR code"
                          className="w-48 h-48 rounded-[8px]"
                        />
                      ) : (
                        <div className="w-48 h-48 bg-gradient-to-br from-primary/5 to-accent/5 rounded-[16px] flex flex-col items-center justify-center border-2 border-dashed border-primary/20">
                          <CreditCard className="w-10 h-10 text-primary/30 mb-3" />
                          <p className="text-xs text-muted-foreground text-center px-4">
                            Voer een bedrag in om de QR code te genereren
                          </p>
                        </div>
                      )}
                    </div>

                    {/* IBAN Display */}
                    <div className="bg-muted/30 rounded-[16px] p-4 mb-4">
                      <p className="text-xs text-muted-foreground mb-1">Rekeningnummer</p>
                      <p className="font-mono font-medium text-foreground">{recipientIBAN}</p>
                    </div>

                    {/* Amount Input */}
                    <div className="mb-6">
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Bedrag
                      </label>
                      <div className="relative">
                        <Euro className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="pl-12 h-14 rounded-[16px] text-lg font-medium border-border"
                          min="0.01"
                          step="0.01"
                        />
                      </div>
                    </div>

                    {/* Pay Button */}
                    <Button
                      onClick={handlePaymentConfirm}
                      disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                      className="w-full h-14 rounded-[20px] text-base font-semibold btn-cta"
                    >
                      {isProcessing ? (
                        <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-2" />
                          Bevestig Betaling
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
