import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAA1MW8GaN_qFhJ5SEzHOdPKqwjPQDxay4",
  authDomain: "slotcut-bc77c.firebaseapp.com",
  projectId: "slotcut-bc77c",
  storageBucket: "slotcut-bc77c.firebasestorage.app",
  messagingSenderId: "998205290080",
  appId: "1:998205290080:web:b20d3dfb996a6b097ef505",
  measurementId: "G-ECYC5B7DNX",
};

export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
