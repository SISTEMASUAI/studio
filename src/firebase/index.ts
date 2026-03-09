'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/**
 * Inicializa Firebase y sus servicios de forma robusta.
 * Garantiza que initializeFirestore se llame exactamente una vez.
 */
export function initializeFirebase() {
  const apps = getApps();
  let app;

  if (!apps.length) {
    app = initializeApp(firebaseConfig);
    // Forzamos long-polling para evitar problemas de conexión en entornos Workstation.
    // Esto previene el error "INTERNAL ASSERTION FAILED".
    initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } else {
    app = getApp();
  }

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
