import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { Box, Link2, Layers, BadgeCheck } from 'lucide-react';

export default function SCPlusOverview() {
  const { t } = useTranslation();
  
  const schemes = [
    { key: 'mpt', path: '/scplus/mpt', icon: Box, color: 'text-purple-400' },
    { key: 'iou', path: '/scplus/iou', icon: Link2, color: 'text-blue-400' },
    { key: 'nft', path: '/scplus/nft', icon: Layers, color: 'text-pink-400' },
    { key: 'credentials', path: '/scplus/credentials', icon: BadgeCheck, color: 'text-amber-400' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold animated-gradient-text">
            {t('scplus.overviewPage.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('scplus.overviewPage.subtitle')}
          </p>
        </div>

        {/* Comparison Table */}
        <div className="glass-card border border-border/50 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="p-4 text-left text-sm font-semibold text-muted-foreground">
                  {t('scplus.overviewPage.scheme')}
                </th>
                {schemes.map(scheme => {
                  const Icon = scheme.icon;
                  return (
                    <th key={scheme.key} className="p-4 text-center">
                      <NavLink 
                        to={scheme.path}
                        className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity"
                      >
                        <Icon className={`w-8 h-8 ${scheme.color}`} />
                        <span className="font-semibold">{t(`scplus.${scheme.key}`)}</span>
                      </NavLink>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* Positioning Row */}
              <tr className="border-b border-border/30">
                <td className="p-4 text-sm font-medium text-muted-foreground">
                  {t('scplus.overviewPage.positioning')}
                </td>
                {schemes.map(scheme => (
                  <td key={scheme.key} className="p-4 text-sm text-center">
                    {t(`scplus.${scheme.key}Scheme.positioning`)}
                  </td>
                ))}
              </tr>
              {/* Features Row */}
              <tr className="border-b border-border/30">
                <td className="p-4 text-sm font-medium text-muted-foreground">
                  {t('scplus.overviewPage.features')}
                </td>
                {schemes.map(scheme => (
                  <td key={scheme.key} className="p-4 text-sm text-center">
                    {t(`scplus.${scheme.key}Scheme.features`)}
                  </td>
                ))}
              </tr>
              {/* Best For Row */}
              <tr className="border-b border-border/30">
                <td className="p-4 text-sm font-medium text-muted-foreground">
                  {t('scplus.overviewPage.bestFor')}
                </td>
                {schemes.map(scheme => (
                  <td key={scheme.key} className="p-4 text-sm text-center">
                    {t(`scplus.${scheme.key}Scheme.bestFor`)}
                  </td>
                ))}
              </tr>
              {/* Transaction Steps Row */}
              <tr>
                <td className="p-4 text-sm font-medium text-muted-foreground">
                  {t('scplus.overviewPage.transactionSteps')}
                </td>
                <td className="p-4 text-sm text-center font-semibold text-purple-400">5~6</td>
                <td className="p-4 text-sm text-center font-semibold text-blue-400">5</td>
                <td className="p-4 text-sm text-center font-semibold text-pink-400">4</td>
                <td className="p-4 text-sm text-center font-semibold text-amber-400">3</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
