import React from 'react'

export const DailyMenu = () => {
  return (
    <div>DailyMenu</div>
  )
}

<View>
                  <TouchableOpacity onPress={toggleDailyMenu}>
                    <View className="flex-row items-center gap-1.5 rounded-lg h-7" style={{backgroundColor: theme.surface}}>
                      <Ionicons name="calendar" size={20} color={theme.accent} />
                      <Text
                        className="text-m font-bold uppercase"
                        style={{ color: theme.accent, letterSpacing: 0.6 }}
                        >
                        Today · {DAY_NAMES[todayDay]}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <Animated.View style={{ overflow: "hidden", maxHeight: dailyMenuAnim }}>
                    <View>
                      {todayVerses.map(v => (
                        <TouchableOpacity
                          key={v.id}
                          className="flex-row items-center justify-between rounded-xl p-3.5 mb-2 mt-1 border"
                          style={{ backgroundColor: theme.accentSurface, borderColor: theme.accent + "22" }}
                          onPress={() => router.push(`/verse/${v.id}?autostart=1`)}
                        >
                          <View className="flex-1 mr-3">
                            <Text className="text-base font-bold mb-0.5" style={{ color: theme.text }}>{v.reference}</Text>
                            {!prefs.hideVerseText && (
                              <Text className="text-xs" style={{ color: theme.textTertiary, lineHeight: 17 }} numberOfLines={1}>{v.text}</Text>
                            )}
                          </View>
                          <View className="items-center gap-1">
                            <Text
                              className="text-[10px] font-semibold uppercase"
                              style={{ color: theme.accent, letterSpacing: 0.4 }}
                            >
                              {getScheduleLabel(v.schedule)}
                            </Text>
                            <Ionicons name="play-circle" size={28} color={theme.accent} />
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </Animated.View>
                    {(folders.length > 0 || savedVerses.length > 0) && (
                      <View className="h-px my-4" style={{ backgroundColor: theme.border }} />
                    )}
                  </View>
