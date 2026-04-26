import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme';
import { generateAndSharePDF, printPDFReport, PDFReportData } from '../../utils/premium/pdfGenerator';

// ============================================================================
// TYPES
// ============================================================================

interface ExportButtonProps {
  reportData: PDFReportData;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  onExportStart?: () => void;
  onExportComplete?: (success: boolean) => void;
}

interface ExportMenuProps {
  reportData: PDFReportData;
  onClose: () => void;
  onExportStart?: () => void;
  onExportComplete?: (success: boolean) => void;
}

// ============================================================================
// EXPORT MENU COMPONENT
// ============================================================================

const ExportMenu: React.FC<ExportMenuProps> = ({
  reportData,
  onClose,
  onExportStart,
  onExportComplete,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'share' | 'print' | null>(null);

  const handleShare = async () => {
    setIsExporting(true);
    setExportType('share');
    onExportStart?.();

    try {
      await generateAndSharePDF(reportData);
      onExportComplete?.(true);
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert(
        'Export Failed',
        'Unable to generate the PDF report. Please try again.',
        [{ text: 'OK' }]
      );
      onExportComplete?.(false);
    } finally {
      setIsExporting(false);
      setExportType(null);
      onClose();
    }
  };

  const handlePrint = async () => {
    setIsExporting(true);
    setExportType('print');
    onExportStart?.();

    try {
      await printPDFReport(reportData);
      onExportComplete?.(true);
    } catch (error) {
      console.error('Print failed:', error);
      Alert.alert(
        'Print Failed',
        'Unable to print the report. Please try again.',
        [{ text: 'OK' }]
      );
      onExportComplete?.(false);
    } finally {
      setIsExporting(false);
      setExportType(null);
      onClose();
    }
  };

  return (
    <View style={styles.menuContainer}>
      <View style={styles.menuHeader}>
        <Text style={styles.menuTitle}>Export Report</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={COLORS.mediumGray} />
        </TouchableOpacity>
      </View>

      <Text style={styles.menuDescription}>
        Generate a professional PDF report with all your analysis data.
      </Text>

      <View style={styles.menuOptions}>
        <TouchableOpacity
          style={[styles.menuOption, isExporting && exportType === 'share' && styles.menuOptionActive]}
          onPress={handleShare}
          disabled={isExporting}
        >
          {isExporting && exportType === 'share' ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <View style={styles.menuOptionIcon}>
              <Ionicons name="share-outline" size={24} color={COLORS.primary} />
            </View>
          )}
          <View style={styles.menuOptionContent}>
            <Text style={styles.menuOptionTitle}>Share PDF</Text>
            <Text style={styles.menuOptionDescription}>
              Save to files or share via email, messages, etc.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.lightGray} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuOption, isExporting && exportType === 'print' && styles.menuOptionActive]}
          onPress={handlePrint}
          disabled={isExporting}
        >
          {isExporting && exportType === 'print' ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <View style={styles.menuOptionIcon}>
              <Ionicons name="print-outline" size={24} color={COLORS.primary} />
            </View>
          )}
          <View style={styles.menuOptionContent}>
            <Text style={styles.menuOptionTitle}>Print Report</Text>
            <Text style={styles.menuOptionDescription}>
              Print directly or save as PDF
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.lightGray} />
        </TouchableOpacity>
      </View>

      <View style={styles.menuFooter}>
        <Ionicons name="information-circle" size={14} color={COLORS.mediumGray} />
        <Text style={styles.menuFooterText}>
          Report includes city comparison, projections, rent vs buy analysis, and negotiation toolkit.
        </Text>
      </View>
    </View>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ExportButton: React.FC<ExportButtonProps> = ({
  reportData,
  variant = 'primary',
  size = 'medium',
  showLabel = true,
  onExportStart,
  onExportComplete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = () => {
    setShowMenu(true);
  };

  const handleClose = () => {
    setShowMenu(false);
  };

  const handleExportStart = () => {
    setIsLoading(true);
    onExportStart?.();
  };

  const handleExportComplete = (success: boolean) => {
    setIsLoading(false);
    onExportComplete?.(success);
  };

  // Get button styles based on variant and size
  const getButtonStyle = () => {
    return [
      styles.button,
      variant === 'primary' && styles.buttonPrimary,
      variant === 'secondary' && styles.buttonSecondary,
      variant === 'outline' && styles.buttonOutline,
      size === 'small' && styles.buttonSmall,
      size === 'large' && styles.buttonLarge,
    ].filter(Boolean);
  };

  const getTextStyle = () => {
    return [
      styles.buttonText,
      variant === 'primary' && styles.buttonTextPrimary,
      variant === 'secondary' && styles.buttonTextSecondary,
      variant === 'outline' && styles.buttonTextOutline,
      size === 'small' && styles.buttonTextSmall,
      size === 'large' && styles.buttonTextLarge,
    ].filter(Boolean);
  };

  const getIconColor = () => {
    switch (variant) {
      case 'primary':
        return COLORS.white;
      case 'secondary':
        return COLORS.primary;
      case 'outline':
        return COLORS.primary;
      default:
        return COLORS.white;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  return (
    <>
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={handlePress}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={getIconColor()} />
        ) : (
          <Ionicons
            name="document-text-outline"
            size={getIconSize()}
            color={getIconColor()}
          />
        )}
        {showLabel && (
          <Text style={getTextStyle()}>
            {isLoading ? 'Generating...' : 'Export PDF'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Export Menu Modal */}
      {showMenu && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={handleClose}
            activeOpacity={1}
          />
          <ExportMenu
            reportData={reportData}
            onClose={handleClose}
            onExportStart={handleExportStart}
            onExportComplete={handleExportComplete}
          />
        </View>
      )}
    </>
  );
};

// ============================================================================
// QUICK EXPORT BUTTON (SIMPLER VERSION)
// ============================================================================

interface QuickExportButtonProps {
  reportData: PDFReportData;
  label?: string;
}

export const QuickExportButton: React.FC<QuickExportButtonProps> = ({
  reportData,
  label = 'Export Report',
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await generateAndSharePDF(reportData);
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert('Export Failed', 'Unable to generate the PDF report.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.quickExportButton}
      onPress={handleExport}
      disabled={isExporting}
    >
      {isExporting ? (
        <ActivityIndicator size="small" color={COLORS.primary} />
      ) : (
        <Ionicons name="download-outline" size={18} color={COLORS.primary} />
      )}
      <Text style={styles.quickExportText}>
        {isExporting ? 'Generating...' : label}
      </Text>
    </TouchableOpacity>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Main Button Styles
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
  },
  buttonSecondary: {
    backgroundColor: COLORS.offWhite,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  buttonSmall: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  buttonLarge: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  buttonText: {
    fontWeight: '600',
  },
  buttonTextPrimary: {
    color: COLORS.white,
    fontSize: FONTS.sizes.base,
  },
  buttonTextSecondary: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.base,
  },
  buttonTextOutline: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.base,
  },
  buttonTextSmall: {
    fontSize: FONTS.sizes.sm,
  },
  buttonTextLarge: {
    fontSize: FONTS.sizes.lg,
  },

  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'flex-end',
    ...(Platform.OS === 'web' && {
      position: 'fixed' as 'absolute',
    }),
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  // Menu Styles
  menuContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.lg,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  menuTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  menuDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    marginBottom: SPACING.lg,
  },
  menuOptions: {
    gap: SPACING.md,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.offWhite,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.md,
  },
  menuOptionActive: {
    backgroundColor: COLORS.primaryLight,
  },
  menuOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  menuOptionContent: {
    flex: 1,
  },
  menuOptionTitle: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 2,
  },
  menuOptionDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
  },
  menuFooter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  menuFooterText: {
    flex: 1,
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    lineHeight: 16,
  },

  // Quick Export Button
  quickExportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.offWhite,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: SPACING.xs,
  },
  quickExportText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default ExportButton;
