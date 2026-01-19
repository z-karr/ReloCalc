import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  prefix?: string;
  suffix?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  containerStyle,
  prefix,
  suffix,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        {prefix && <Text style={styles.prefix}>{prefix}</Text>}
        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : null,
            rightIcon ? styles.inputWithRightIcon : null,
          ].filter(Boolean)}
          placeholderTextColor={COLORS.mediumGray}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {suffix && <Text style={styles.suffix}>{suffix}</Text>}
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      {helper && !error && <Text style={styles.helper}>{helper}</Text>}
    </View>
  );
};

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  containerStyle?: ViewStyle;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  containerStyle,
}) => {
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.selectContainer}>
        {options.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.selectOption,
              option.value === value && styles.selectOptionActive,
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text
              style={[
                styles.selectOptionText,
                option.value === value && styles.selectOptionTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  formatValue?: (value: number) => string;
  icon?: keyof typeof Ionicons.glyphMap;
  valueColor?: string;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  formatValue,
  icon,
  valueColor,
}) => {
  const displayValue = formatValue ? formatValue(value) : value.toString();

  return (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderHeader}>
        <View style={styles.sliderLabelContainer}>
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={COLORS.primary}
              style={styles.sliderIcon}
            />
          )}
          <Text style={styles.label}>{label}</Text>
        </View>
        <Text style={[styles.sliderValue, valueColor && { color: valueColor }]}>
          {displayValue}
        </Text>
      </View>
      <View style={styles.sliderWrapper}>
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={value}
          onValueChange={onChange}
          minimumTrackTintColor={COLORS.primary}
          maximumTrackTintColor={COLORS.lightGray}
          thumbTintColor={COLORS.primary}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.base,
  },
  label: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.offWhite,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: SPACING.md,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  inputContainerError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    fontSize: FONTS.sizes.base,
    color: COLORS.charcoal,
    paddingVertical: SPACING.md,
  },
  inputWithLeftIcon: {
    paddingLeft: SPACING.sm,
  },
  inputWithRightIcon: {
    paddingRight: SPACING.sm,
  },
  leftIcon: {
    marginRight: SPACING.sm,
  },
  rightIcon: {
    marginLeft: SPACING.sm,
  },
  prefix: {
    fontSize: FONTS.sizes.base,
    color: COLORS.darkGray,
    marginRight: 4,
  },
  suffix: {
    fontSize: FONTS.sizes.base,
    color: COLORS.darkGray,
    marginLeft: 4,
  },
  error: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  helper: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    marginTop: SPACING.xs,
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  selectOption: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.offWhite,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  selectOptionText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  selectOptionTextActive: {
    color: COLORS.white,
  },
  sliderContainer: {
    marginBottom: SPACING.base,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sliderLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderIcon: {
    marginRight: SPACING.sm,
    marginTop: -3, // Slight adjustment to align with text baseline
  },
  sliderValue: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
  sliderWrapper: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  slider: {
    width: '100%',
    height: 50,
  },
});
