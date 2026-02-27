import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, HelpCircle, FileJson, AlertTriangle, FileText, Code, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  type MPTMetadata,
  type UriEntry,
  type AssetClass,
  ASSET_CLASSES,
  ASSET_SUBCLASSES,
  URI_CATEGORIES,
  decodeMetadata,
  validateMetadataSize,
} from '@/lib/xrpl/metadata-utils';
import { METADATA_TEMPLATES, getTemplateById } from '@/lib/xrpl/metadata-templates';
import { toast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

interface MPTMetadataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMetadata?: string; // JSON string (hex-encoded)
  onMetadataChange?: (json: string) => void;
}

const DEFAULT_FORM_DATA: MPTMetadata = {
  ticker: '',
  name: '',
  desc: '',
  icon: '',
  asset_class: undefined,
  asset_subclass: undefined,
  issuer_name: '',
  uris: [{ uri: '', category: 'website', title: '' }],
  additional_info: '',
};

export function MPTMetadataModal({
  open,
  onOpenChange,
  initialMetadata,
  onMetadataChange,
}: MPTMetadataModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<MPTMetadata>(DEFAULT_FORM_DATA);
  const [isJsonMode, setIsJsonMode] = useState(false);
  const [jsonValue, setJsonValue] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showTemplateConfirm, setShowTemplateConfirm] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<string>('');

  // Check if form has any data
  const hasFormData = useMemo(() => {
    const data = formData;
    return !!(
      data.ticker ||
      data.name ||
      data.desc ||
      data.icon ||
      data.asset_class ||
      data.asset_subclass ||
      data.issuer_name ||
      (data.uris && data.uris.some(u => u.uri || u.title)) ||
      data.additional_info
    );
  }, [formData]);

  // Size validation (memoized)
  const sizeValidation = useMemo(() => {
    if (!formData.ticker && !formData.name) return { valid: true, bytes: 0 };
    return validateMetadataSize(formData);
  }, [formData]);

  // Parse initial metadata when modal opens
  useEffect(() => {
    if (open && initialMetadata) {
      try {
        const decoded = decodeMetadata(initialMetadata);
        // Convert additional_info to string if it's an object
        const processedData: MPTMetadata = {
          ...decoded,
          additional_info: typeof decoded.additional_info === 'object'
            ? JSON.stringify(decoded.additional_info, null, 2)
            : decoded.additional_info || '',
        };
        // Ensure uris has at least one entry
        if (!processedData.uris || processedData.uris.length === 0) {
          processedData.uris = [{ uri: '', category: 'website', title: '' }];
        }
        setFormData(processedData);
      } catch {
        // If decoding fails, use default
        setFormData(DEFAULT_FORM_DATA);
      }
    } else if (open) {
      // Reset to defaults when opening without initial data
      setFormData(DEFAULT_FORM_DATA);
    }
    // Reset JSON mode and errors when modal opens
    if (open) {
      setIsJsonMode(false);
      setJsonError(null);
      setJsonValue('');
      setSelectedTemplate('');
    }
  }, [open, initialMetadata]);

  // Sync formData to JSON when in JSON mode
  useEffect(() => {
    if (isJsonMode && open) {
      // Convert to short keys for JSON display, but with LONG keys for readability
      const jsonData = {
        ticker: formData.ticker || '',
        name: formData.name || '',
        desc: formData.desc || '',
        icon: formData.icon || '',
        asset_class: formData.asset_class || '',
        asset_subclass: formData.asset_subclass || '',
        issuer_name: formData.issuer_name || '',
        uris: formData.uris || [],
        additional_info: formData.additional_info || '',
      };
      setJsonValue(JSON.stringify(jsonData, null, 2));
    }
  }, [formData, isJsonMode, open]);

  const updateField = <K extends keyof MPTMetadata>(field: K, value: MPTMetadata[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // URI handlers
  const handleAddUri = () => {
    setFormData((prev) => ({
      ...prev,
      uris: [...(prev.uris || []), { uri: '', category: 'website', title: '' }],
    }));
  };

  const handleRemoveUri = (index: number) => {
    if (!formData.uris || formData.uris.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      uris: prev.uris?.filter((_, i) => i !== index),
    }));
  };

  const handleUriChange = (index: number, field: keyof UriEntry, value: string) => {
    setFormData((prev) => ({
      ...prev,
      uris: prev.uris?.map((uri, i) =>
        i === index ? { ...uri, [field]: value } : uri
      ),
    }));
  };

  // Mode toggle handlers
  const handleSwitchToJson = useCallback(() => {
    // Convert formData to JSON string with LONG keys for readability
    const jsonData = {
      ticker: formData.ticker || '',
      name: formData.name || '',
      desc: formData.desc || '',
      icon: formData.icon || '',
      asset_class: formData.asset_class || '',
      asset_subclass: formData.asset_subclass || '',
      issuer_name: formData.issuer_name || '',
      uris: formData.uris || [],
      additional_info: formData.additional_info || '',
    };
    setJsonValue(JSON.stringify(jsonData, null, 2));
    setJsonError(null);
    setIsJsonMode(true);
  }, [formData]);

  const handleSwitchToForm = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonValue);
      // Convert to MPTMetadata format
      const newData: MPTMetadata = {
        ticker: parsed.ticker || '',
        name: parsed.name || '',
        desc: parsed.desc || '',
        icon: parsed.icon || '',
        asset_class: parsed.asset_class || undefined,
        asset_subclass: parsed.asset_subclass || undefined,
        issuer_name: parsed.issuer_name || '',
        uris: parsed.uris || [{ uri: '', category: 'website', title: '' }],
        additional_info: parsed.additional_info || '',
      };
      setFormData(newData);
      setJsonError(null);
      setIsJsonMode(false);
    } catch {
      setJsonError('Invalid JSON format');
      toast({
        title: t('mpt.metadata.invalidJson', { defaultValue: 'Invalid JSON' }),
        description: t('mpt.metadata.invalidJsonDesc', { defaultValue: 'Please fix JSON syntax errors before switching to Form mode' }),
        variant: 'destructive',
      });
    }
  }, [jsonValue, t]);

  // Template handlers
  const handleTemplateSelect = useCallback((templateId: string) => {
    if (!templateId) {
      setSelectedTemplate('');
      return;
    }

    // If form has data, show confirmation
    if (hasFormData) {
      setPendingTemplate(templateId);
      setShowTemplateConfirm(true);
    } else {
      applyTemplate(templateId);
    }
  }, [hasFormData]);

  const applyTemplate = useCallback((templateId: string) => {
    const template = getTemplateById(templateId);
    if (!template) return;

    // Convert short keys to long keys for form
    const templateData: MPTMetadata = {
      ticker: template.data.t,
      name: template.data.n,
      desc: template.data.d,
      icon: template.data.i,
      asset_class: template.data.ac as AssetClass,
      asset_subclass: template.data.as,
      issuer_name: template.data.in,
      uris: template.data.us?.map(u => ({
        uri: u.u,
        category: u.c as any,
        title: u.t,
      })) || [{ uri: '', category: 'website', title: '' }],
      additional_info: template.data.ai ? JSON.stringify(template.data.ai, null, 2) : '',
    };

    setFormData(templateData);
    setSelectedTemplate(templateId);
    setShowTemplateConfirm(false);
    setPendingTemplate('');
  }, []);

  const confirmTemplateOverwrite = useCallback(() => {
    applyTemplate(pendingTemplate);
  }, [pendingTemplate, applyTemplate]);

  const cancelTemplateOverwrite = useCallback(() => {
    setShowTemplateConfirm(false);
    setPendingTemplate('');
    setSelectedTemplate('');
  }, []);

  // Apply/Cancel handlers
  const handleApply = useCallback(() => {
    // Validate required fields
    if (!formData.ticker || !formData.name) {
      toast({
        title: t('mpt.metadata.requiredFields', { defaultValue: 'Required Fields' }),
        description: t('mpt.metadata.requiredFieldsDesc', { defaultValue: 'Ticker and Name are required' }),
        variant: 'destructive',
      });
      return;
    }

    // Check size
    if (!sizeValidation.valid) {
      toast({
        title: t('mpt.metadata.sizeExceeded', { defaultValue: 'Size Exceeded' }),
        description: t('mpt.metadata.sizeExceededDesc', { defaultValue: `Metadata exceeds 1024 bytes (current: ${sizeValidation.bytes})` }),
        variant: 'destructive',
      });
      return;
    }

    // Output JSON string (NOT hex-encoded - parent handles that)
    if (onMetadataChange) {
      onMetadataChange(JSON.stringify(formData));
    }
    onOpenChange(false);
  }, [formData, sizeValidation, onMetadataChange, onOpenChange, t]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // Native select styling
  const selectClassName = cn(
    'flex h-10 w-full rounded-lg border border-input bg-secondary/30 px-3 py-2 text-sm',
    'transition-colors duration-150',
    'hover:border-white/30',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-white/40',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'appearance-none cursor-pointer'
  );

  const showAssetSubclass = formData.asset_class === 'rwa';
  const subclasses = formData.asset_class ? ASSET_SUBCLASSES[formData.asset_class as AssetClass] : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson className="w-5 h-5" />
            {t('mpt.metadata.title', { defaultValue: 'MPT Metadata Editor' })}
          </DialogTitle>
          <DialogDescription>
            {t('mpt.metadata.description', { defaultValue: 'Define token metadata following XLS-89 standard' })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Template Selection */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Label htmlFor="template" className="text-xs text-muted-foreground mb-1 block">
                {t('mpt.metadata.template', { defaultValue: 'Start from Template' })}
              </Label>
              <select
                id="template"
                value={selectedTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className={selectClassName}
              >
                <option value="">{t('mpt.metadata.selectTemplate', { defaultValue: 'Choose a template...' })}</option>
                {METADATA_TEMPLATES.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Mode Toggle */}
            <div className="flex items-center gap-1 pt-5">
              <Button
                type="button"
                variant={!isJsonMode ? 'default' : 'outline'}
                size="sm"
                onClick={handleSwitchToForm}
                disabled={!isJsonMode}
                className={cn(
                  'h-8 text-xs',
                  !isJsonMode && 'bg-xrpl-green hover:bg-xrpl-green/90'
                )}
              >
                <FileText className="w-3.5 h-3.5 mr-1" />
                {t('mpt.metadata.formMode', { defaultValue: 'Form' })}
              </Button>
              <Button
                type="button"
                variant={isJsonMode ? 'default' : 'outline'}
                size="sm"
                onClick={handleSwitchToJson}
                disabled={isJsonMode}
                className={cn(
                  'h-8 text-xs',
                  isJsonMode && 'bg-xrpl-green hover:bg-xrpl-green/90'
                )}
              >
                <Code className="w-3.5 h-3.5 mr-1" />
                {t('mpt.metadata.jsonMode', { defaultValue: 'JSON' })}
              </Button>
            </div>
          </div>

          {/* Size Warning */}
          {sizeValidation.bytes > 0 && (
            <div className={cn(
              'rounded-lg border p-3 flex items-center gap-3',
              sizeValidation.valid
                ? 'border-green-500/30 bg-green-500/10'
                : 'border-amber-500/30 bg-amber-500/10'
            )}>
              {sizeValidation.valid ? (
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
              )}
              <span className={cn(
                'text-sm',
                sizeValidation.valid ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
              )}>
                {sizeValidation.valid
                  ? t('mpt.metadata.sizeOk', { defaultValue: `Size: ${sizeValidation.bytes} / 1024 bytes` })
                  : t('mpt.metadata.sizeWarning', { defaultValue: `Size exceeded: ${sizeValidation.bytes} / 1024 bytes - reduce content` })
                }
              </span>
            </div>
          )}

          {/* JSON Mode Editor */}
          {isJsonMode ? (
            <div className="space-y-2">
              <Label htmlFor="json-editor" className="text-xs text-muted-foreground">
                {t('mpt.metadata.jsonEditor', { defaultValue: 'JSON Editor (use long key names: ticker, name, desc, etc.)' })}
              </Label>
              {jsonError && (
                <div className="text-xs text-destructive">{jsonError}</div>
              )}
              <Textarea
                id="json-editor"
                value={jsonValue}
                onChange={(e) => {
                  setJsonValue(e.target.value);
                  setJsonError(null);
                }}
                placeholder='{\n  "ticker": "USDX",\n  "name": "USD Stablecoin",\n  ...\n}'
                className="font-mono text-xs min-h-[400px]"
              />
            </div>
          ) : (
            /* Form Mode */
            <>
              {/* Basic Info Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('mpt.metadata.basicInfo', { defaultValue: 'Basic Information' })}
                </h3>

                {/* Ticker */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="ticker" className="flex items-center gap-1">
                      {t('mpt.metadata.ticker', { defaultValue: 'Ticker' })}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{t('mpt.metadata.tickerHint', { defaultValue: 'Short token symbol (A-Z, 0-9, max 6 chars recommended)' })}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="ticker"
                    type="text"
                    maxLength={6}
                    placeholder={t('mpt.metadata.tickerPlaceholder', { defaultValue: 'e.g. USDX' })}
                    value={formData.ticker || ''}
                    onChange={(e) => updateField('ticker', e.target.value.toUpperCase())}
                  />
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-1">
                    {t('mpt.metadata.name', { defaultValue: 'Name' })}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={t('mpt.metadata.namePlaceholder', { defaultValue: 'e.g. USD Stablecoin' })}
                    value={formData.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="desc">{t('mpt.metadata.description', { defaultValue: 'Description' })}</Label>
                  <Textarea
                    id="desc"
                    placeholder={t('mpt.metadata.descriptionPlaceholder', { defaultValue: 'Description of the token' })}
                    value={formData.desc || ''}
                    onChange={(e) => updateField('desc', e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Icon */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="icon">{t('mpt.metadata.icon', { defaultValue: 'Icon URL' })}</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{t('mpt.metadata.iconHint', { defaultValue: 'URL to token icon image (PNG, SVG recommended)' })}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="icon"
                    type="url"
                    placeholder={t('mpt.metadata.iconPlaceholder', { defaultValue: 'https://example.com/icon.png' })}
                    value={formData.icon || ''}
                    onChange={(e) => updateField('icon', e.target.value)}
                  />
                </div>
              </div>

              {/* Asset Classification Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('mpt.metadata.assetClassification', { defaultValue: 'Asset Classification' })}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Asset Class */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="asset_class">{t('mpt.metadata.assetClass', { defaultValue: 'Asset Class' })}</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>{t('mpt.metadata.assetClassHint', { defaultValue: 'Top-level classification of the token' })}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <select
                      id="asset_class"
                      value={formData.asset_class || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateField('asset_class', value ? (value as AssetClass) : undefined);
                        // Reset subclass when asset class changes
                        updateField('asset_subclass', undefined);
                      }}
                      className={selectClassName}
                    >
                      <option value="">{t('mpt.metadata.selectAssetClass', { defaultValue: 'Select asset class' })}</option>
                      {ASSET_CLASSES.map((ac) => (
                        <option key={ac} value={ac}>
                          {ac.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Asset Subclass (conditional) */}
                  {showAssetSubclass && (
                    <div className="space-y-2">
                      <Label htmlFor="asset_subclass">{t('mpt.metadata.assetSubclass', { defaultValue: 'Asset Subclass' })}</Label>
                      <select
                        id="asset_subclass"
                        value={formData.asset_subclass || ''}
                        onChange={(e) => updateField('asset_subclass', e.target.value || undefined)}
                        className={selectClassName}
                      >
                        <option value="">{t('mpt.metadata.selectAssetSubclass', { defaultValue: 'Select subclass' })}</option>
                        {subclasses.map((sc) => (
                          <option key={sc} value={sc}>
                            {sc.charAt(0).toUpperCase() + sc.slice(1).replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Issuer Name */}
                <div className="space-y-2">
                  <Label htmlFor="issuer_name">{t('mpt.metadata.issuerName', { defaultValue: 'Issuer Name' })}</Label>
                  <Input
                    id="issuer_name"
                    type="text"
                    placeholder={t('mpt.metadata.issuerNamePlaceholder', { defaultValue: 'e.g. Example Issuer Inc.' })}
                    value={formData.issuer_name || ''}
                    onChange={(e) => updateField('issuer_name', e.target.value)}
                  />
                </div>
              </div>

              {/* URIs Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {t('mpt.metadata.uris', { defaultValue: 'Related Links' })}
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddUri}
                    className="h-7 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {t('mpt.metadata.addUri', { defaultValue: 'Add Link' })}
                  </Button>
                </div>

                {formData.uris?.map((uri, index) => (
                  <div key={index} className="space-y-3 p-4 rounded-lg border border-border/50 bg-secondary/20">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {t('mpt.metadata.uriNumber', { defaultValue: `Link ${index + 1}` })}
                      </span>
                      {formData.uris && formData.uris.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveUri(index)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* URI */}
                      <div className="sm:col-span-2 space-y-1">
                        <Label htmlFor={`uri-${index}`} className="text-xs">
                          {t('mpt.metadata.uriLabel', { defaultValue: 'URL' })}
                        </Label>
                        <Input
                          id={`uri-${index}`}
                          type="url"
                          placeholder="https://..."
                          value={uri.uri}
                          onChange={(e) => handleUriChange(index, 'uri', e.target.value)}
                        />
                      </div>

                      {/* Category */}
                      <div className="space-y-1">
                        <Label htmlFor={`category-${index}`} className="text-xs">
                          {t('mpt.metadata.categoryLabel', { defaultValue: 'Category' })}
                        </Label>
                        <select
                          id={`category-${index}`}
                          value={uri.category}
                          onChange={(e) => handleUriChange(index, 'category', e.target.value)}
                          className={selectClassName}
                        >
                          {URI_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-1">
                      <Label htmlFor={`title-${index}`} className="text-xs">
                        {t('mpt.metadata.uriTitle', { defaultValue: 'Title' })}
                      </Label>
                      <Input
                        id={`title-${index}`}
                        type="text"
                        placeholder={t('mpt.metadata.uriTitlePlaceholder', { defaultValue: 'e.g. Official Website' })}
                        value={uri.title}
                        onChange={(e) => handleUriChange(index, 'title', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Info Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('mpt.metadata.additionalInfo', { defaultValue: 'Additional Info' })}
                </h3>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="additional_info">{t('mpt.metadata.additionalInfoLabel', { defaultValue: 'Extra Metadata (JSON)' })}</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{t('mpt.metadata.additionalInfoHint', { defaultValue: 'Optional JSON object for custom metadata fields' })}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Textarea
                    id="additional_info"
                    placeholder={'{\"key\": \"value\"}'}
                    value={typeof formData.additional_info === 'object' ? JSON.stringify(formData.additional_info, null, 2) : formData.additional_info || ''}
                    onChange={(e) => updateField('additional_info', e.target.value)}
                    rows={4}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            {t('common.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            disabled={!sizeValidation.valid}
            className="bg-gradient-to-r from-xrpl-green to-xrpl-green-light hover:from-xrpl-green-light hover:to-xrpl-green text-background font-semibold"
          >
            {t('mpt.metadata.apply', { defaultValue: 'Apply' })}
          </Button>
        </div>

        {/* Template Confirmation Dialog */}
        {showTemplateConfirm && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-lg p-6 max-w-sm mx-4 shadow-xl">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">
                    {t('mpt.metadata.overwriteTitle', { defaultValue: 'Overwrite Current Data?' })}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t('mpt.metadata.overwriteDesc', { defaultValue: 'Applying a template will replace all current form data. This cannot be undone.' })}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={cancelTemplateOverwrite}
                >
                  {t('common.cancel', { defaultValue: 'Cancel' })}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={confirmTemplateOverwrite}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {t('mpt.metadata.overwrite', { defaultValue: 'Overwrite' })}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}