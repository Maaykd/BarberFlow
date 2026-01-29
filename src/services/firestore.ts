import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export type BarberProfile = {
  userId: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
};

export function buildBookingUrl(slug: string) {
  return `https://slotcut.app/${slug}`;
}

export async function reserveSlugAndCreateBarber(params: {
  uid: string;
  name: string;
  slug: string;
}) {
  const { uid, name, slug } = params;

  const slugRef = doc(db, 'slugs', slug);      // garante unicidade global
  const barberRef = doc(db, 'barbers', uid);   // 1 barbeiro = 1 usuário (docId = uid)

  return runTransaction(db, async (tx) => {
    const slugSnap = await tx.get(slugRef);
    if (slugSnap.exists()) {
      throw new Error('Essa slug já está em uso. Escolha outra.');
    }

    const barberSnap = await tx.get(barberRef);

    const now = serverTimestamp();

    // Reserva a slug
    tx.set(slugRef, {
      barberId: uid,
      createdAt: now,
    });

    // Cria/atualiza perfil do barbeiro
    const profile: BarberProfile = {
      userId: uid,
      name,
      slug,
      isActive: true,
      createdAt: barberSnap.exists() ? barberSnap.data().createdAt ?? now : now,
      updatedAt: now,
    };

    tx.set(barberRef, profile, { merge: true });

    return {
      barberId: uid,
      slug,
      bookingUrl: buildBookingUrl(slug),
    };
  });
}
