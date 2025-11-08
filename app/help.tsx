import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

const FAQ_ITEMS = [
  {
    id: '1',
    question: 'Como adicionar filmes à minha lista?',
    answer: 'Na página de detalhes do filme, clique no botão "Minha Lista". O conteúdo será adicionado e você poderá acessá-lo na aba "Minha Lista".',
  },
  {
    id: '2',
    question: 'Como continuar assistindo de onde parei?',
    answer: 'O app salva automaticamente seu progresso. Acesse a seção "Continuar Assistindo" na tela inicial para retomar de onde parou.',
  },
  {
    id: '3',
    question: 'Como buscar por conteúdo?',
    answer: 'Use a aba "Buscar" no menu inferior. Digite o título ou palavra-chave para encontrar filmes e séries.',
  },
  {
    id: '4',
    question: 'O que aparece em "Novidades"?',
    answer: 'A aba Novidades mostra todo conteúdo adicionado nos últimos 2 dias.',
  },
  {
    id: '5',
    question: 'Como mudar minha foto de perfil?',
    answer: 'Acesse a aba "Perfil", toque na foto atual e selecione uma das opções disponíveis.',
  },
];

export default function HelpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Ajuda</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
            
            {FAQ_ITEMS.map((item) => (
              <View key={item.id} style={styles.faqItem}>
                <View style={styles.questionContainer}>
                  <Ionicons name="help-circle" size={20} color={colors.primary} />
                  <Text style={styles.question}>{item.question}</Text>
                </View>
                <Text style={styles.answer}>{item.answer}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contato</Text>
            
            <TouchableOpacity style={styles.contactItem}>
              <Ionicons name="mail-outline" size={24} color={colors.textPrimary} />
              <View style={styles.contactContent}>
                <Text style={styles.contactTitle}>E-mail</Text>
                <Text style={styles.contactText}>suporte@flixbr.com</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem}>
              <Ionicons name="chatbubbles-outline" size={24} color={colors.textPrimary} />
              <View style={styles.contactContent}>
                <Text style={styles.contactTitle}>Chat ao Vivo</Text>
                <Text style={styles.contactText}>Disponível 24/7</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações</Text>
            <Text style={styles.infoText}>Versão: 1.0.0</Text>
            <Text style={styles.infoText}>Build: Fase 1 - Interface Local</Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.base,
  },
  faqItem: {
    backgroundColor: colors.surface,
    padding: spacing.base,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  question: {
    fontSize: typography.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  answer: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: typography.sm * 1.5,
    marginLeft: 28,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  contactContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  contactTitle: {
    fontSize: typography.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  contactText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  infoText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
});
