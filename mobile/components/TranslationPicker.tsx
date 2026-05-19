import React from 'react';
import { View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export interface Translation {
  code: string;
  name: string;
  year?: string;
}

export const TRANSLATIONS: Translation[] = [
  { code: 'kjv', name: 'King James Version', year: '1611' },
  { code: 'web', name: 'World English Bible' },
  { code: 'asv', name: 'American Standard Version', year: '1901' },
  { code: 'bbe', name: 'Bible in Basic English' },
  { code: 'darby', name: 'Darby Translation' },
  { code: 'dra', name: 'Douay-Rheims American' },
  { code: 'ylt', name: "Young's Literal Translation" },
  { code: 'oeb-cw', name: 'Open English Bible (Commonwealth)' },
  { code: 'oeb-us', name: 'Open English Bible (US)' },
  { code: 'webbe', name: 'World English Bible (British)' },
  { code: 'clementine', name: 'Clementine Vulgate (Latin)' },
  { code: 'almeida', name: 'João Ferreira de Almeida (Portuguese)' },
  { code: 'rccv', name: 'Romanian Corrected Cornilescu Version' },
  { code: 'cuv', name: 'Chinese Union Version' },
  { code: 'bkr', name: 'Bible Kralická (Czech)' },
  { code: 'cherokee', name: 'Cherokee New Testament' },
];

/**
 * Get human-readable translation name from code
 */
export function getTranslationName(code: string): string {
  const translation = TRANSLATIONS.find(t => t.code === code);
  if (translation) {
    return translation.year
      ? `${translation.name} (${translation.year})`
      : translation.name;
  }
  return code.toUpperCase();
}

interface TranslationPickerProps {
  selectedTranslation: string;
  onTranslationChange: (code: string) => void;
  label?: string;
}

export default function TranslationPicker({
  selectedTranslation,
  onTranslationChange,
  label,
}: TranslationPickerProps) {
  return (
    <View className="mb-4">
      {label && <Text className="text-sm font-semibold text-[#333] mb-2">{label}</Text>}
      <View className="border border-[#ddd] rounded-lg bg-white overflow-hidden">
        <Picker
          selectedValue={selectedTranslation}
          onValueChange={onTranslationChange}
          style={{ height: 50 }}
        >
          {TRANSLATIONS.map(t => (
            <Picker.Item
              key={t.code}
              label={t.year ? `${t.name} (${t.year})` : t.name}
              value={t.code}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
}
