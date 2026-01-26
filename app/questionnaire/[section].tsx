import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import { Background } from "../../components/Background";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { RadioButton } from "../../components/RadioButton";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

/* ===============================
   API CONFIG (IMPORTANT)
================================ */
const API_URL = process.env.EXPO_PUBLIC_API_URL;

/* ===============================
   TYPES & DATA
================================ */
type SectionType = "numeric" | "yesno" | "mixed";

const SECTIONS = {
  1: {
    title: "SECTION 1 — BASIC RISK FACTORS",
    type: "mixed" as SectionType,
    fields: [
      { key: "name", label: "What is your name?" },
      { key: "age", label: "What is your age?" },
      { key: "sleep_hours", label: "How many hours of sleep do you get per night on average?" },
      { key: "exercise_days", label: "How many days per week do you exercise (at least 30 minutes)?" },
      { key: "family_dementia", label: "How many close family members had dementia?" },
      { key: "long_term_diseases", label: "How many long-term diseases do you have?" },
      { key: "medications_daily", label: "How many medications do you take daily?" },
      { key: "forgotten_times", label: "How many times in the last month have you forgotten tasks?" },
      { key: "falls_past_year", label: "How many falls in the past year?" },
    ],
  },
  2: {
    title: "SECTION 2 — LIFESTYLE & HEALTH RISKS",
    type: "yesno" as SectionType,
    fields: [
      { key: "smoke", label: "Do you smoke?" },
      { key: "drink", label: "Do you drink alcohol regularly?" },
      { key: "diabetes", label: "Do you have diabetes?" },
      { key: "high_bp", label: "Do you have high blood pressure?" },
      { key: "high_cholesterol", label: "Do you have high cholesterol?" },
      { key: "history_stroke", label: "Do you have a history of stroke?" },
    ],
  },
  3: {
    title: "SECTION 3 — COGNITIVE EARLY SIGNS",
    type: "yesno" as SectionType,
    fields: [
      { key: "forget_recent", label: "Do you often forget recent events?" },
      { key: "misplace_objects", label: "Do you misplace objects?" },
      { key: "confused_dates", label: "Do you get confused about dates?" },
      { key: "trouble_instructions", label: "Trouble following instructions?" },
      { key: "difficult_concentrate", label: "Difficulty concentrating?" },
      { key: "word_finding", label: "Difficulty finding words?" },
      { key: "get_lost", label: "Do you get lost in familiar places?" },
    ],
  },
  4: {
    title: "SECTION 4 — BEHAVIOURAL / MOOD CHANGES",
    type: "yesno" as SectionType,
    fields: [
      { key: "mood_changes", label: "Sudden mood changes?" },
      { key: "feel_irritable", label: "Feeling irritable or anxious?" },
      { key: "others_noticed_change", label: "Others noticed personality change?" },
    ],
  },
  5: {
    title: "SECTION 5 — DAILY FUNCTIONAL ABILITY",
    type: "yesno" as SectionType,
    fields: [
      { key: "need_help_daily", label: "Need help with daily tasks?" },
      { key: "forget_meals_meds", label: "Forget meals or medicines?" },
      { key: "struggle_money", label: "Struggle with money management?" },
    ],
  },
};

const globalAnswers: Record<string, any> = {};

/* ===============================
   COMPONENT
================================ */
export default function QuestionnaireScreen() {
  const { section } = useLocalSearchParams();
  const sectionNum = parseInt(section as string);
  const router = useRouter();
  const { t } = useLanguage();
  const { username, isAuthenticated } = useAuth();

  const currentSection = SECTIONS[sectionNum as keyof typeof SECTIONS];
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const progress = ((sectionNum - 1) / 4) * 100;

  useEffect(() => {
    const sectionAnswers: Record<string, any> = {};
    currentSection.fields.forEach(field => {
      if (globalAnswers[field.key] !== undefined) {
        sectionAnswers[field.key] = globalAnswers[field.key];
      }
    });
    setAnswers(sectionAnswers);
  }, [sectionNum]);

  const validateSection = () => {
    for (const field of currentSection.fields) {
      const answer = answers[field.key];

      if (field.key === "name") {
        if (!answer || !/^[A-Za-z\s]+$/.test(answer.trim())) {
          return "Please enter a valid name (alphabets only).";
        }
        continue;
      }

      if (currentSection.type !== "yesno" && (answer === undefined || answer === "")) {
        return `Please fill: ${field.label}`;
      }

      if (currentSection.type === "yesno" && answer === undefined) {
        return `Please answer: ${field.label}`;
      }
    }
    return null;
  };

  const handleNext = async () => {
    const error = validateSection();
    if (error) {
      Alert.alert("Invalid Input", error);
      return;
    }

    Object.assign(globalAnswers, answers);

    if (sectionNum < 5) {
      router.push(`/questionnaire/${sectionNum + 1}`);
      return;
    }

    if (!isAuthenticated || !username) {
      Alert.alert("Login required", "Please login before submitting.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        userId: username,
        email: `${username}@cognitosense.local`,
        name: globalAnswers.name,
        questionnaireResponse: globalAnswers,
      };

      const res = await fetch(`${API_URL}/api/questionnaire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("API request failed");

      router.replace("/result");
    } catch (err) {
      console.error("❌ Questionnaire submit failed:", err);
      Alert.alert("Error", "Failed to submit questionnaire.");
    } finally {
      setLoading(false);
    }
  };

  const updateAnswer = (key: string, value: any) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  return (
    <View style={styles.container}>
      <Background />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card>
          <Text style={styles.title}>{currentSection.title}</Text>

          {currentSection.type !== "yesno"
            ? currentSection.fields.map(field => (
                <Input
                  key={field.key}
                  label={field.label}
                  value={answers[field.key]?.toString() || ""}
                  onChangeText={val => updateAnswer(field.key, val)}
                  keyboardType={field.key === "name" ? "default" : "numeric"}
                />
              ))
            : currentSection.fields.map(field => (
                <RadioButton
                  key={field.key}
                  label={field.label}
                  value={answers[field.key]}
                  onChange={val => updateAnswer(field.key, val)}
                />
              ))}

          <Button
            title={sectionNum === 5 ? "Submit" : "Next"}
            onPress={handleNext}
            disabled={loading}
          />
        </Card>
      </ScrollView>
    </View>
  );
}

/* ===============================
   STYLES
================================ */
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
});
