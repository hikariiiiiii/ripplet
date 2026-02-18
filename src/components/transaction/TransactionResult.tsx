import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, Loader2, Copy, ExternalLink, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TransactionResult } from '@/types';

interface TransactionResultDisplayProps {
  result: TransactionResult | null;
  onRetry?: () => void;
  networkType?: 'mainnet' | 'testnet';
}

export function TransactionResultDisplay({
  result,
  onRetry,
  networkType = 'mainnet',
}: TransactionResultDisplayProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="relative">
          <div className="absolute inset-0 animate-ping opacity-25">
            <Loader2 className="w-12 h-12 text-sky-400" />
          </div>
          <Loader2 className="relative w-12 h-12 text-sky-500 animate-spin" />
        </div>
        <p className="text-lg font-medium text-slate-300">
          {t('transaction.pending')}
        </p>
        <p className="text-sm text-slate-500">
          {t('transaction.pendingDescription')}
        </p>
      </div>
    );
  }

  if (result.success) {
    const explorerUrl = networkType === 'mainnet'
      ? `https://xrpscan.com/tx/${result.hash}`
      : `https://testnet.xrpscan.com/tx/${result.hash}`;

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(result.hash);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        const textArea = document.createElement('textarea');
        textArea.value = result.hash;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    };

    return (
      <div className="flex flex-col items-center p-8 space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
          <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 p-3 rounded-full shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-emerald-400">
            {t('transaction.success')}
          </h3>
          <p className="text-sm text-slate-400">
            {t('transaction.successDescription')}
          </p>
        </div>

        <div className="w-full max-w-md space-y-2">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {t('transaction.hash')}
          </label>
          <div className="flex items-center gap-2 p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg group hover:border-slate-600 transition-colors">
            <code className="flex-1 text-sm text-slate-300 font-mono truncate">
              {result.hash}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="shrink-0 h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-lg transition-all duration-200"
        >
          <ExternalLink className="w-4 h-4" />
          {t('transaction.viewExplorer')}
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-8 space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full" />
        <div className="relative bg-gradient-to-br from-rose-400 to-rose-600 p-3 rounded-full shadow-lg shadow-rose-500/30">
          <XCircle className="w-10 h-10 text-white" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-rose-400">
          {t('transaction.failed')}
        </h3>
        <p className="text-sm text-slate-400">
          {t('transaction.failedDescription')}
        </p>
      </div>

      <div className="w-full max-w-md space-y-3">
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-rose-400 uppercase tracking-wider">
              {t('transaction.errorCode')}:
            </span>
            <code className="text-sm text-rose-300 font-mono">
              {result.code}
            </code>
          </div>
        </div>

        {result.message && (
          <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg">
            <p className="text-sm text-slate-300">
              {result.message}
            </p>
          </div>
        )}
      </div>

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="gap-2 border-rose-500/50 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500"
        >
          <span>{t('transaction.tryAgain')}</span>
        </Button>
      )}
    </div>
  );
}
