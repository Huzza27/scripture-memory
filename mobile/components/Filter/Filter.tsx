import { useState } from 'react'
import { View, Text, TouchableOpacity} from 'react-native'
import FilterButton from './FilterButton'

interface FilterProps {
    onFilterChange?: (label: string) => void
}

const Filter = ({ onFilterChange }: FilterProps) => {

    const [highlightedProgressButton, setHighlightedProgressButton] = useState("")
    const [highlightedTranslationButton, setHighlightedTranslationButton] = useState("")
    const [filterToggle, setFilterToggle] = useState(false)
    const filterCategories = ["Category", "Translation", "Book", "Mastered"]
    const translations = ["NIV", "ESV", "ALL"]

  const handleFilterMenuToggle = () => {
    setFilterToggle(!filterToggle)
  }
  return (
    <View className='pt-6'>
        <View className='flex-row justify-between items-center pb-5'>
        <Text style={{ fontFamily: 'JetBrainsMono_500Medium', fontSize: 11, letterSpacing: 2 }}>
            PACKS
        </Text>
        <TouchableOpacity className='border rounded py-0.5 px-5' onPress={handleFilterMenuToggle}>
            <Text className='text-xs tracking-wider' style={{ fontFamily: 'JetBrainsMono_400Regular' }}>
                FILTER
            </Text>
        </TouchableOpacity>
        </View>
        {filterToggle && 
        <View className='bg-card rounded border mb-4' style={{ borderColor: 'rgba(44, 30, 15, 0.15)' }}>
            <View className='px-2 pt-3'>
            <Text className='text-xs' style={{ fontFamily: 'JetBrainsMono_500Medium', letterSpacing: 1.5 }}>
                PROGRESS
            </Text>
            <View className='flex-row'>
                 {filterCategories.map((cat) => (
                    <FilterButton key={cat} label={cat} highlighted={highlightedProgressButton === cat} onPress={(label) => {
                        setHighlightedProgressButton(label)
                        onFilterChange?.(label)
                    }}/>
                 ))}
            </View>

            <Text className='text-xs' style={{ fontFamily: 'JetBrainsMono_500Medium', letterSpacing: 1.5 }}>
                TRANSLATION
            </Text>
            <View className='flex-row'>
                 {translations.map((translation) => (
                    <FilterButton key={translation} label={translation} highlighted={highlightedTranslationButton === translation} onPress={setHighlightedTranslationButton}/>
                 ))}
            </View>
            </View>
        </View>
        }
    </View>
  )
}

export default Filter