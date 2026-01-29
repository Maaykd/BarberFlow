import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { reserveSlugAndCreateBarber } from '../../services/firestore';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
}

export default function LoginScreen({ navigation, route }: Props) {
  const { slug, name } = route.params;

  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const title = useMemo(() => (mode === 'login' ? 'Entrar' : 'Criar conta'), [mode]);

  const handleSubmit = async () => {
    const e = email.trim().toLowerCase();
    const p = password;

    if (!isValidEmail(e)) {
      Alert.alert('E-mail inválido', 'Digite um e-mail válido.');
      return;
    }
    if (p.length < 6) {
      Alert.alert('Senha fraca', 'Use no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, e, p);
        navigation.replace('Dashboard');
        return;
      }

      const cred = await createUserWithEmailAndPassword(auth, e, p);

      // Cria perfil e reserva a slug (única) no Firestore
      await reserveSlugAndCreateBarber({
        uid: cred.user.uid,
        name,
        slug,
      });

      navigation.replace('Dashboard');
    } catch (err: any) {
      // Mensagens amigáveis
      const msg = String(err?.message ?? err);

      if (msg.includes('email-already-in-use')) {
        Alert.alert('E-mail já cadastrado', 'Esse e-mail já tem conta. Troque para "Entrar".');
      } else if (msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        Alert.alert('Falha no login', 'E-mail ou senha incorretos.');
      } else if (msg.includes('Essa slug já está em uso')) {
        Alert.alert('Slug em uso', 'Essa slug já está em uso. Volte e escolha outra.');
      } else {
        Alert.alert('Erro', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <Text style={styles.subtitle}>
        Link do seu agendamento: <Text style={styles.mono}>https://slotcut.app/{slug}</Text>
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="voce@exemplo.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Senha</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="mínimo 6 caracteres"
          secureTextEntry
          style={styles.input}
        />

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Aguarde...' : title}</Text>
        </Pressable>

        <Pressable
          onPress={() => setMode((m) => (m === 'login' ? 'signup' : 'login'))}
          disabled={loading}
          style={styles.linkBtn}
        >
          <Text style={styles.linkText}>
            {mode === 'login' ? 'Não tem conta? Criar agora' : 'Já tem conta? Entrar'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#0B0B0F' },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', marginBottom: 10 },
  subtitle: { color: '#B8B8C7', fontSize: 14, lineHeight: 20, marginBottom: 14 },
  mono: { color: '#FFFFFF' },

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
  button: {
    marginTop: 16,
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#111827', fontWeight: '800', fontSize: 15 },

  linkBtn: { marginTop: 14, alignItems: 'center' },
  linkText: { color: '#B8B8C7', textDecorationLine: 'underline' },
});
