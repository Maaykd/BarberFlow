import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

function normalizeSlug(input: string) {
  const s = input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-') // espaços -> hífen
    .replace(/[^a-z0-9-]/g, '') // remove caracteres inválidos
    .replace(/-+/g, '-') // colapsa hífens
    .replace(/^-/, '') // não começa com hífen
    .replace(/-$/, ''); // não termina com hífen

  return s;
}

function validateSlug(slug: string) {
  if (slug.length < 3) return 'Mínimo 3 caracteres.';
  if (slug.length > 30) return 'Máximo 30 caracteres.';
  if (!/^[a-z0-9-]+$/.test(slug)) return 'Use apenas letras, números e hífen.';
  if (slug.startsWith('-') || slug.endsWith('-')) return 'Não pode começar/terminar com hífen.';
  if (slug.includes('--')) return 'Evite hífen duplo.';
  return null;
}

function validateName(name: string) {
  const n = name.trim();
  if (n.length < 2) return 'Digite seu nome (mínimo 2 caracteres).';
  if (n.length > 60) return 'Nome muito longo (máximo 60 caracteres).';
  return null;
}

export default function OnboardingScreen({ navigation }: Props) {
  const [nameInput, setNameInput] = useState('');
  const name = useMemo(() => nameInput.trim(), [nameInput]);
  const nameError = useMemo(() => (name ? validateName(name) : 'Digite seu nome.'), [name]);

  const [slugInput, setSlugInput] = useState('');
  const slug = useMemo(() => normalizeSlug(slugInput), [slugInput]);
  const slugError = useMemo(() => (slug ? validateSlug(slug) : 'Escolha uma slug.'), [slug]);

  const bookingUrl = useMemo(() => {
    if (!slug || slugError) return 'https://slotcut.app/…';
    return `https://slotcut.app/${slug}`;
  }, [slug, slugError]);

  const isDisabled = !!nameError || !!slugError;

  const handleContinue = () => {
    const errName = validateName(name);
    if (errName) {
      Alert.alert('Nome inválido', errName);
      return;
    }

    const errSlug = validateSlug(slug);
    if (errSlug) {
      Alert.alert('Slug inválida', errSlug);
      return;
    }

    navigation.navigate('Login', { slug, name });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SlotCut</Text>
      <Text style={styles.subtitle}>
        Gestão para barbeiros: agenda, serviços e clientes. Para seus clientes, um site de agendamento com link único.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Seu nome</Text>
        <TextInput
          value={nameInput}
          onChangeText={setNameInput}
          placeholder="Ex.: João"
          autoCapitalize="words"
          autoCorrect={false}
          style={styles.input}
        />

        {!!nameError && <Text style={styles.error}>{nameError}</Text>}

        <Text style={[styles.label, { marginTop: 14 }]}>Sua slug (link do cliente)</Text>
        <TextInput
          value={slugInput}
          onChangeText={setSlugInput}
          placeholder="Ex.: joao-barber"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />

        <Text style={styles.previewLabel}>Prévia do link</Text>
        <Text style={styles.preview}>{bookingUrl}</Text>

        {!!slugError && <Text style={styles.error}>{slugError}</Text>}

        <Pressable style={[styles.button, isDisabled && styles.buttonDisabled]} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continuar</Text>
        </Pressable>

        <Text style={styles.hint}>
          Dica: use seu nome + “barber”. A slug precisa ser única (ninguém pode repetir).
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#0B0B0F' },
  title: { color: '#FFFFFF', fontSize: 40, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: '#B8B8C7', fontSize: 15, lineHeight: 21, marginBottom: 18 },
  card: { backgroundColor: '#141421', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#23233A' },
  label: { color: '#FFFFFF', fontSize: 14, marginBottom: 8, fontWeight: '600' },
  input: {
    backgroundColor: '#0B0B0F',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2A2A44',
  },
  previewLabel: { color: '#B8B8C7', marginTop: 12, fontSize: 12 },
  preview: { color: '#FFFFFF', marginTop: 6, fontSize: 14 },
  error: { color: '#FF6B6B', marginTop: 10, fontSize: 13 },
  button: {
    marginTop: 14,
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: '#111827', fontWeight: '800', fontSize: 15 },
  hint: { color: '#B8B8C7', marginTop: 12, fontSize: 12, lineHeight: 16 },
});
