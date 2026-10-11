import { useLocalSearchParams } from "expo-router";
import { BookOpen, Check, Flower2, Leaf, MoonStar, Sunrise, Utensils, X } from "lucide-react-native";
import { useMemo } from "react";
import { Text, View } from "react-native";

import { Card } from "@/components/Card";
import { EkadashiDetail } from "@/components/EkadashiDetail";
import { FadeInView } from "@/components/motion";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { StackBack } from "@/components/StackBack";
import { getCalendar, traditionLabel } from "@/constants/calendars";
import { fonts, motion, palette, type } from "@/constants/theme";
import { getEkadashiById, queryFromSettings } from "@/lib/ekadashi";
import { formatLongDate } from "@/lib/format";
import { buildObservanceGuide, type GuideStep } from "@/lib/observance";
import { useSettings } from "@/store/settings";

const STEP_ICONS: Record<GuideStep["id"], typeof Sunrise> = {
  dashami: Leaf,
  ekadashi: Flower2,
  jagaran: MoonStar,
  parana: Sunrise,
};

export default function EkadashiGuideScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { settings } = useSettings();
  const query = useMemo(() => queryFromSettings(settings), [settings]);
  const item = useMemo(() => (id ? getEkadashiById(id, query) : undefined), [id, query]);
  const guide = useMemo(() => (item ? buildObservanceGuide(item, settings.tradition) : null), [item, settings.tradition]);
  const calendar = getCalendar(settings.calendarId);

  if (!item || !guide) {
    return (
      <Screen>
        <StackBack fallback="/(tabs)" />
        <Card>
          <Text style={{ fontFamily: fonts.sansSemi }} className="text-base text-white">
            This Ekadashi is not in the calendar for {calendar.name}.
          </Text>
          <Text className="mt-2 text-sm text-violet-300">Go back and pick a highlighted date.</Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <StackBack fallback="/(tabs)" />
      <FadeInView>
        <Text style={type.eyebrow} className="mb-1 text-[11px] text-saffron-300">
          {calendar.name} · {traditionLabel(settings.tradition)}
        </Text>
        <Text style={type.display} className="mb-4 text-[34px] text-white">
          Fasting guide
        </Text>
      </FadeInView>

      <FadeInView delay={motion.staggerMs}>
        <Card className="mb-4">
          <EkadashiDetail item={item} />
        </Card>
      </FadeInView>

      <FadeInView delay={motion.staggerMs * 2}>
        <Card className="mb-4">
          <SectionTitle icon={<BookOpen color={palette.saffronLight} size={18} />} title={`Why ${item.name} is kept`} />
          <Text className="text-sm leading-5 text-violet-100">{guide.intro}</Text>
          <Text className="mt-3 text-[11px] uppercase tracking-wide text-violet-400">Worship</Text>
          <Text style={{ fontFamily: fonts.sansSemi }} className="mt-0.5 text-sm text-saffron-200">
            {guide.special.deity}
          </Text>
          <View className="mt-3 gap-2">
            {guide.special.rituals.map((ritual) => (
              <Bullet key={ritual} text={ritual} />
            ))}
          </View>
          {guide.special.food ? (
            <View className="mt-3 flex-row items-start gap-2 rounded-2xl bg-saffron-500/10 px-3 py-2.5">
              <Utensils color={palette.saffronLight} size={14} style={{ marginTop: 2 }} />
              <Text className="flex-1 text-xs leading-4 text-saffron-100">{guide.special.food}</Text>
            </View>
          ) : null}
        </Card>
      </FadeInView>

      <Text style={type.title} className="mb-2 mt-1 text-lg text-white">
        Day by day
      </Text>
      {guide.steps.map((step, index) => {
        const Icon = STEP_ICONS[step.id];
        return (
          <FadeInView key={step.id} delay={motion.staggerMs * (3 + index)}>
            <Card className="mb-3">
              <View className="flex-row items-start gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-2xl bg-saffron-500/15">
                  <Icon color={palette.saffronLight} size={20} />
                </View>
                <View className="flex-1">
                  <Text style={{ fontFamily: fonts.sansBold }} className="text-base text-white">
                    {step.title}
                  </Text>
                  <Text className="mt-0.5 text-xs text-saffron-200">
                    {formatLongDate(step.date)}
                    {step.when ? ` · ${step.when}` : ""}
                  </Text>
                </View>
              </View>
              <View className="mt-3 gap-2">
                {step.points.map((point) => (
                  <Bullet key={point} text={point} />
                ))}
              </View>
            </Card>
          </FadeInView>
        );
      })}

      <FadeInView delay={motion.staggerMs * 7}>
        <Card className="mb-3">
          <SectionTitle icon={<Utensils color={palette.saffronLight} size={18} />} title="How strictly to fast" />
          <View className="gap-2.5">
            {guide.levels.map((level) => (
              <View key={level.id} className="rounded-2xl bg-white/5 px-3 py-2.5">
                <View className="flex-row items-baseline justify-between">
                  <Text style={{ fontFamily: fonts.sansSemi }} className="text-sm text-white">
                    {level.name}
                  </Text>
                  <Text className="text-[11px] text-saffron-200">{level.summary}</Text>
                </View>
                <Text className="mt-1 text-xs leading-4 text-violet-300">{level.detail}</Text>
              </View>
            ))}
          </View>
          <Text className="mt-3 text-xs leading-4 text-violet-400">{guide.relaxation}</Text>
        </Card>
      </FadeInView>

      <FadeInView delay={motion.staggerMs * 8}>
        <Card className="mb-3">
          <View className="flex-row gap-4">
            <View className="flex-1">
              <View className="mb-2 flex-row items-center gap-1.5">
                <Check color={palette.success} size={14} />
                <Text style={{ fontFamily: fonts.sansSemi }} className="text-xs uppercase tracking-wide text-violet-300">
                  Eat
                </Text>
              </View>
              {guide.allowed.map((food) => (
                <Text key={food} className="mb-1.5 text-xs leading-4 text-violet-100">
                  {food}
                </Text>
              ))}
            </View>
            <View className="w-px bg-white/10" />
            <View className="flex-1">
              <View className="mb-2 flex-row items-center gap-1.5">
                <X color="#fb7185" size={14} />
                <Text style={{ fontFamily: fonts.sansSemi }} className="text-xs uppercase tracking-wide text-violet-300">
                  Avoid
                </Text>
              </View>
              {guide.avoided.map((food) => (
                <Text key={food} className="mb-1.5 text-xs leading-4 text-violet-100">
                  {food}
                </Text>
              ))}
            </View>
          </View>
        </Card>
      </FadeInView>

      <FadeInView delay={motion.staggerMs * 9}>
        <Card className="mb-4">
          <SectionTitle icon={<MoonStar color={palette.saffronLight} size={18} />} title="About these dates" />
          <View className="gap-2">
            {guide.traditionNotes.map((note) => (
              <Text key={note} className="text-xs leading-4 text-violet-200">
                {note}
              </Text>
            ))}
          </View>
        </Card>
      </FadeInView>

      <Text className="px-2 text-center text-[11px] leading-4 text-violet-500">
        Practices differ between families, temples and sampradayas. Follow your own guru or household custom where it
        differs from this guide.
      </Text>
    </Screen>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View className="flex-row items-start gap-2">
      <View className="mt-[7px] h-1.5 w-1.5 rounded-full bg-saffron-400" />
      <Text className="flex-1 text-sm leading-5 text-violet-100">{text}</Text>
    </View>
  );
}
