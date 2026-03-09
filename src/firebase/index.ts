'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/**
 * Inicializa Firebase y sus servicios.
 * Se asegura de que initializeFirestore se llame solo una vez para evitar
 * errores de aserción interna del SDK.
 */
export function initializeFirebase() {
  if (!getApps().length) {
    const firebaseApp = initializeApp(firebaseConfig);
    // Usamos initializeFirestore para forzar long-polling una sola vez.
    // Esto es necesario en entornos de red específicos como Workstations.
    initializeFirestore(firebaseApp, {
      experimentalForceLongPolling: true,
    });
  }

  const app = getApp();
  return {
    firebaseApp: app,
    auth: getAuth(app),
    firestore: getFirestore(app),
    storage: getStorage(app),
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
