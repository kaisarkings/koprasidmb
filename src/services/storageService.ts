import { Student, Transaction, TopUp, AppSettings, ActivityLog, DashboardStats, TopSantriStat, DailySummaryReport } from '../types';
import { INITIAL_STUDENTS, INITIAL_TRANSACTIONS, INITIAL_TOPUPS, DEFAULT_SETTINGS, pesantrenLogo } from '../constants';
import { db, disableFirestoreNetwork, enableFirestoreNetwork } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
} from 'firebase/firestore';
import { getTimePeriod } from '../utils/formatters';

const STORAGE_KEYS = {
  STUDENTS: 'koperasi_santri_students_v3',
  TRANSACTIONS: 'koperasi_santri_transactions_v3',
  TOPUPS: 'koperasi_santri_topups_v3',
  SETTINGS: 'koperasi_santri_settings_v3',
  LOGS: 'koperasi_santri_logs_v3',
  PENDING_QUEUE: 'koperasi_santri_pending_queue_v3',
  DAILY_SUMMARIES: 'koperasi_santri_daily_summaries_v3',
};

const QUOTA_EXCEEDED_STORAGE_KEY = 'koperasi_firestore_quota_exceeded';

export interface QuotaStatus {
  exceeded: boolean;
  timestamp?: string;
  message?: string;
}

export const checkIsQuotaError = (e: any): boolean => {
  if (!e) return false;
  const msg = (e.message || e.toString() || '').toLowerCase();
  const code = (e.code || '').toLowerCase();
  return (
    code.includes('resource-exhausted') ||
    msg.includes('resource-exhausted') ||
    msg.includes('quota limit exceeded') ||
    msg.includes('quota exceeded')
  );
};

export const markFirestoreQuotaExceeded = (errMessage?: string) => {
  try {
    localStorage.setItem(
      QUOTA_EXCEEDED_STORAGE_KEY,
      JSON.stringify({
        timestamp: new Date().toISOString(),
        message: errMessage || 'Batas kuota harian gratis Firebase Firestore tercapai.',
      })
    );
  } catch (e) {
    /* ignore */
  }
  // Disable network to prevent background retry / backoff log spam
  disableFirestoreNetwork();
  triggerDataChangeEvent();
};

export const getFirestoreQuotaStatus = (): QuotaStatus => {
  try {
    const raw = localStorage.getItem(QUOTA_EXCEEDED_STORAGE_KEY);
    if (!raw) {
      // Default to quota exceeded mode to shield free tier database from backoff spam
      const defaultStatus = {
        exceeded: true,
        timestamp: new Date().toISOString(),
        message: 'Batas kuota harian gratis Firebase Firestore tercapai.',
      };
      localStorage.setItem(QUOTA_EXCEEDED_STORAGE_KEY, JSON.stringify(defaultStatus));
      disableFirestoreNetwork();
      return defaultStatus;
    }
    const parsed = JSON.parse(raw);
    const date = new Date(parsed.timestamp);
    const now = new Date();
    // Check if new UTC day - if so, allow retry
    if (
      date.getUTCDate() !== now.getUTCDate() ||
      date.getUTCMonth() !== now.getUTCMonth() ||
      date.getUTCFullYear() !== now.getUTCFullYear()
    ) {
      localStorage.removeItem(QUOTA_EXCEEDED_STORAGE_KEY);
      enableFirestoreNetwork();
      return { exceeded: false };
    }
    return { exceeded: true, timestamp: parsed.timestamp, message: parsed.message };
  } catch (e) {
    return { exceeded: true, timestamp: new Date().toISOString() };
  }
};

export const isFirestoreQuotaExceeded = (): boolean => {
  return getFirestoreQuotaStatus().exceeded;
};

export const clearFirestoreQuotaExceeded = async () => {
  localStorage.removeItem(QUOTA_EXCEEDED_STORAGE_KEY);
  await enableFirestoreNetwork();
  triggerDataChangeEvent();
};

// Auto-initialize local data if not present yet
const initializeLocalStorageDefaults = () => {
  if (typeof window === 'undefined') return;
  try {
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TOPUPS)) {
      localStorage.setItem(STORAGE_KEYS.TOPUPS, JSON.stringify(INITIAL_TOPUPS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    localStorage.setItem('koperasi_initialized', 'true');
  } catch (e) {
    /* ignore */
  }
};
initializeLocalStorageDefaults();

export interface PendingQueueItem {
  id: string;
  type: 'transaction' | 'topup' | 'student';
  title: string;
  amount?: number;
  data: any;
  created_at: string;
}

// Broadcast channel for local UI sync
const eventTarget = new EventTarget();
export const DATA_CHANGED_EVENT = 'koperasi_data_changed';
export const TRANSACTION_SUCCESS_EVENT = 'koperasi_transaction_success';
export const TOPUP_SUCCESS_EVENT = 'koperasi_topup_success';

export interface TransactionSuccessDetail {
  transaction: Transaction;
  studentName: string;
  studentNis: string;
  updatedBalance: number;
  amount: number;
  category: string;
}

export interface TopUpSuccessDetail {
  topup: TopUp;
  studentName: string;
  studentNis: string;
  updatedBalance: number;
  amount: number;
  paymentMethod: string;
}

export const triggerDataChangeEvent = () => {
  eventTarget.dispatchEvent(new Event(DATA_CHANGED_EVENT));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('storage'));
  }
};

export const subscribeToDataChange = (callback: () => void) => {
  eventTarget.addEventListener(DATA_CHANGED_EVENT, callback);
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', callback);
  }
  return () => {
    eventTarget.removeEventListener(DATA_CHANGED_EVENT, callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', callback);
    }
  };
};

let isSeedingInProgress = false;

export const storageService = {
  // SEED INITIAL DATA TO FIRESTORE (50 Santri, 50 Juta Saldo)
  async seedInitialDataToFirestore(): Promise<void> {
    if (isSeedingInProgress) return;
    isSeedingInProgress = true;
    try {
      // Ensure local cache has initial data
      localStorage.setItem('koperasi_initialized', 'true');
      if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.TOPUPS)) {
        localStorage.setItem(STORAGE_KEYS.TOPUPS, JSON.stringify(INITIAL_TOPUPS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      }

      // If quota is exceeded, do not attempt to write to Firestore
      if (isFirestoreQuotaExceeded()) {
        console.warn('Firestore quota exceeded. Skipping cloud seed, running from local storage.');
        return;
      }

      console.log('Menginisialisasi data 50 Santri & Saldo 50 Juta ke Firebase Firestore...');
      
      // Seed Students
      const batchSize = 25;
      for (let i = 0; i < INITIAL_STUDENTS.length; i += batchSize) {
        const batch = writeBatch(db);
        const chunk = INITIAL_STUDENTS.slice(i, i + batchSize);
        chunk.forEach((s) => {
          const ref = doc(db, 'students', s.id);
          batch.set(ref, s);
        });
        await batch.commit();
      }

      // Seed TopUps
      if (INITIAL_TOPUPS.length > 0) {
        const topupBatch = writeBatch(db);
        INITIAL_TOPUPS.forEach((t) => {
          const ref = doc(db, 'topups', t.id);
          topupBatch.set(ref, t);
        });
        await topupBatch.commit();
      }

      // Seed Transactions
      if (INITIAL_TRANSACTIONS.length > 0) {
        const trxBatch = writeBatch(db);
        INITIAL_TRANSACTIONS.forEach((tr) => {
          const ref = doc(db, 'transactions', tr.id);
          trxBatch.set(ref, tr);
        });
        await trxBatch.commit();
      }

      // Seed Settings
      await setDoc(doc(db, 'settings', 'app_config'), { key: 'app_config', value: DEFAULT_SETTINGS, updated_at: new Date().toISOString() });

      console.log('Seeding data awal Firebase berhasil!');
    } catch (e: any) {
      if (checkIsQuotaError(e)) {
        markFirestoreQuotaExceeded(e?.message);
        console.warn('Firestore quota exceeded during seeding. Switched to offline mode.');
      } else {
        console.error('Error seeding Firebase:', e);
      }
    } finally {
      isSeedingInProgress = false;
    }
  },

  // GET SETTINGS
  async getSettings(): Promise<AppSettings> {
    let settings: AppSettings = DEFAULT_SETTINGS;
    try {
      const local = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (local) {
        try { settings = JSON.parse(local); } catch (e) { /* ignore */ }
      }

      if (!isFirestoreQuotaExceeded()) {
        const docRef = doc(db, 'settings', 'app_config');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data()?.value) {
          settings = docSnap.data().value as AppSettings;
        }
      }
    } catch (e: any) {
      if (checkIsQuotaError(e)) {
        markFirestoreQuotaExceeded(e?.message);
      }
      console.warn('Firestore getSettings error, fallback to local:', e);
      const local = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (local) {
        try { settings = JSON.parse(local); } catch (e) { /* ignore */ }
      }
    }

    // Sanitize image URL if broken or deleted asset reference
    if (
      !settings.login_image_url ||
      settings.login_image_url.includes('1785109998520') ||
      settings.login_image_url.includes('https:') ||
      settings.login_image_url.includes('pesantren_logo')
    ) {
      settings.login_image_url = pesantrenLogo;
    }

    if (!settings.hero_slides || settings.hero_slides.length === 0) {
      settings.hero_slides = DEFAULT_SETTINGS.hero_slides;
    }

    if (settings.allow_debt === undefined) {
      settings.allow_debt = true;
    }
    if (settings.max_debt_limit === undefined) {
      settings.max_debt_limit = 50000;
    }
    if (!settings.min_balance_alert) {
      settings.min_balance_alert = 10000;
    }

    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));

    return settings;
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    if (!isFirestoreQuotaExceeded()) {
      try {
        await setDoc(doc(db, 'settings', 'app_config'), { key: 'app_config', value: settings, updated_at: new Date().toISOString() });
      } catch (e: any) {
        if (checkIsQuotaError(e)) {
          markFirestoreQuotaExceeded(e?.message);
        } else {
          console.error('Firestore saveSettings error:', e);
        }
      }
    }
    await this.logActivity('Admin Koperasi', 'Ubah Pengaturan', 'Mengubah konfigurasi identitas pesantren dan KOP laporan');
    triggerDataChangeEvent();
  },

  // GET STUDENTS
  async getStudents(): Promise<Student[]> {
    const local = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    let localStudents: Student[] = [];
    if (local) {
      try {
        localStudents = JSON.parse(local) || [];
      } catch (e) {
        /* ignore */
      }
    }

    // If quota is exceeded, serve directly from local storage
    if (isFirestoreQuotaExceeded()) {
      if (localStudents.length > 0) return localStudents;
      return INITIAL_STUDENTS;
    }

    try {
      const colRef = collection(db, 'students');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const students = snap.docs.map((doc) => doc.data() as Student);
        students.sort((a, b) => a.name.localeCompare(b.name));
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
        return students;
      } else {
        if (localStorage.getItem('koperasi_initialized') === 'true') {
          if (localStudents.length > 0) return localStudents;
          localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
          return [];
        }
        await this.seedInitialDataToFirestore();
        return INITIAL_STUDENTS;
      }
    } catch (e: any) {
      if (checkIsQuotaError(e)) {
        markFirestoreQuotaExceeded(e?.message);
      }
      console.warn('Firestore getStudents error, fallback to local:', e);
      if (localStudents.length > 0) return localStudents;
      return localStorage.getItem('koperasi_initialized') === 'true' ? [] : INITIAL_STUDENTS;
    }
  },

  async saveStudent(student: Omit<Student, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<Student> {
    const students = await this.getStudents();
    const now = new Date().toISOString();

    if (student.id) {
      // Update existing student
      const index = students.findIndex((s) => s.id === student.id);
      if (index !== -1) {
        const existingStudent = students[index];
        const updatedStudent: Student = {
          ...existingStudent,
          ...student,
          balance: typeof student.balance === 'number' ? student.balance : existingStudent.balance,
          updated_at: now,
        };
        students[index] = updatedStudent;
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));

        if (!isFirestoreQuotaExceeded()) {
          try {
            await setDoc(doc(db, 'students', updatedStudent.id), updatedStudent, { merge: true });
          } catch (e: any) {
            if (checkIsQuotaError(e)) {
              markFirestoreQuotaExceeded(e?.message);
            } else {
              console.error('Firestore saveStudent update error:', e);
            }
          }
        }

        await this.logActivity('Admin Koperasi', 'Mengubah Data Santri', `Mengubah profil ${updatedStudent.name} (${updatedStudent.nis})`);
        triggerDataChangeEvent();
        return updatedStudent;
      }
    }

    // Create New Student
    const initialDeposit = typeof student.balance === 'number' ? student.balance : 0;
    const newStudentId = student.id || 'snt-' + Date.now() + Math.random().toString(36).substring(2, 9);
    const newStudent: Student = {
      created_at: now,
      updated_at: now,
      ...student,
      id: newStudentId,
      balance: initialDeposit,
      qr_code_data: student.nis || `SNT-${Date.now().toString().slice(-6)}`,
    };

    students.unshift(newStudent);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));

    if (!isFirestoreQuotaExceeded()) {
      try {
        await setDoc(doc(db, 'students', newStudent.id), newStudent);
      } catch (e: any) {
        if (checkIsQuotaError(e)) {
          markFirestoreQuotaExceeded(e?.message);
        } else {
          console.error('Firestore saveStudent create error:', e);
        }
      }
    }

    // If there's an initial deposit balance, record a TopUp entry for audit trail
    if (initialDeposit > 0) {
      const initTopUp: TopUp = {
        id: 'top-init-' + Date.now(),
        topup_code: 'TOP-INIT-' + Date.now().toString().slice(-6),
        student_id: newStudent.id,
        student_name: newStudent.name,
        student_nis: newStudent.nis,
        amount: initialDeposit,
        notes: 'Setoran Saldo Awal Pendaftaran Santri',
        payment_method: 'Tunai',
        created_by: 'Admin Koperasi',
        created_at: now,
      };
      const topups = await this.getTopUps();
      topups.unshift(initTopUp);
      localStorage.setItem(STORAGE_KEYS.TOPUPS, JSON.stringify(topups));

      if (!isFirestoreQuotaExceeded()) {
        try {
          await setDoc(doc(db, 'topups', initTopUp.id), initTopUp);
        } catch (e: any) {
          if (checkIsQuotaError(e)) {
            markFirestoreQuotaExceeded(e?.message);
          } else {
            console.error('Firestore saveStudent topup error:', e);
          }
        }
      }
    }

    await this.logActivity('Admin Koperasi', 'Pendaftaran Santri', `Menambah santri baru ${newStudent.name} (${newStudent.nis}) dengan saldo awal Rp ${initialDeposit.toLocaleString('id-ID')}`);
    triggerDataChangeEvent();
    return newStudent;
  },

  async deleteStudent(studentId: string): Promise<void> {
    const students = await this.getStudents();
    const target = students.find((s) => s.id === studentId);
    const filtered = students.filter((s) => s.id !== studentId);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(filtered));

    if (!isFirestoreQuotaExceeded()) {
      try {
        await deleteDoc(doc(db, 'students', studentId));
      } catch (e: any) {
        if (checkIsQuotaError(e)) {
          markFirestoreQuotaExceeded(e?.message);
        } else {
          console.error('Firestore deleteStudent error:', e);
        }
      }
    }

    if (target) {
      await this.logActivity('Admin Koperasi', 'Hapus Santri', `Menghapus santri ${target.name} (${target.nis})`);
    }
    triggerDataChangeEvent();
  },

  // GET TOPUPS
  async getTopUps(): Promise<TopUp[]> {
    const local = localStorage.getItem(STORAGE_KEYS.TOPUPS);
    let localTopups: TopUp[] = [];
    if (local) {
      try {
        localTopups = JSON.parse(local) || [];
      } catch (e) {
        /* ignore */
      }
    }

    if (isFirestoreQuotaExceeded()) {
      return localTopups;
    }

    try {
      const colRef = collection(db, 'topups');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const topups = snap.docs.map((doc) => doc.data() as TopUp);
        topups.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        localStorage.setItem(STORAGE_KEYS.TOPUPS, JSON.stringify(topups));
        return topups;
      } else {
        localStorage.setItem(STORAGE_KEYS.TOPUPS, JSON.stringify([]));
        return [];
      }
    } catch (e: any) {
      if (checkIsQuotaError(e)) {
        markFirestoreQuotaExceeded(e?.message);
      }
      console.warn('Firestore getTopUps error, fallback to local:', e);
      return localTopups;
    }
  },

  async addTopUp(topupData: Omit<TopUp, 'id' | 'created_at'>): Promise<TopUp> {
    const students = await this.getStudents();
    const student = students.find((s) => s.id === topupData.student_id);

    if (!student) {
      throw new Error('Santri tidak ditemukan!');
    }

    const now = new Date().toISOString();
    const newTopUpId = 'top-' + Date.now() + Math.random().toString(36).substring(2, 9);
    const newTopUp: TopUp = {
      id: newTopUpId,
      created_at: now,
      student_name: student.name,
      student_nis: student.nis,
      ...topupData,
    };

    // Increase student balance
    student.balance += topupData.amount;
    student.updated_at = now;

    // Save student update locally
    const studentIndex = students.findIndex((s) => s.id === student.id);
    if (studentIndex !== -1) {
      students[studentIndex] = student;
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    }

    // Save TopUp locally
    const topups = await this.getTopUps();
    topups.unshift(newTopUp);
    localStorage.setItem(STORAGE_KEYS.TOPUPS, JSON.stringify(topups));

    // Save to Firestore if not quota exceeded
    if (!isFirestoreQuotaExceeded()) {
      try {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          throw new Error('Offline mode');
        }
        await setDoc(doc(db, 'topups', newTopUp.id), newTopUp);
        await updateDoc(doc(db, 'students', student.id), { balance: student.balance, updated_at: now });
      } catch (e: any) {
        if (checkIsQuotaError(e)) {
          markFirestoreQuotaExceeded(e?.message);
        }
        console.warn('Firestore addTopUp offline/error, queued for sync:', e);
        this.addToPendingQueue({
          id: newTopUp.id,
          type: 'topup',
          title: `Top-Up ${student.name} (Rp ${topupData.amount.toLocaleString('id-ID')})`,
          amount: topupData.amount,
          data: {
            topup: newTopUp,
            studentId: student.id,
            newBalance: student.balance,
          },
        });
      }
    } else {
      // Direct offline queue
      this.addToPendingQueue({
        id: newTopUp.id,
        type: 'topup',
        title: `Top-Up ${student.name} (Rp ${topupData.amount.toLocaleString('id-ID')})`,
        amount: topupData.amount,
        data: {
          topup: newTopUp,
          studentId: student.id,
          newBalance: student.balance,
        },
      });
    }

    await this.logActivity('Admin Koperasi', 'Isi Saldo', `Pengisian saldo Rp ${topupData.amount.toLocaleString('id-ID')} untuk ${student.name}`);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent<TopUpSuccessDetail>(TOPUP_SUCCESS_EVENT, {
          detail: {
            topup: newTopUp,
            studentName: student.name,
            studentNis: student.nis,
            updatedBalance: student.balance,
            amount: topupData.amount,
            paymentMethod: topupData.payment_method,
          },
        })
      );
    }
    triggerDataChangeEvent();
    return newTopUp;
  },

  // GET TRANSACTIONS
  async getTransactions(): Promise<Transaction[]> {
    const local = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    let localTrxs: Transaction[] = [];
    if (local) {
      try {
        localTrxs = JSON.parse(local) || [];
      } catch (e) {
        /* ignore */
      }
    }

    if (isFirestoreQuotaExceeded()) {
      return localTrxs;
    }

    try {
      const colRef = collection(db, 'transactions');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const trxs = snap.docs.map((doc) => doc.data() as Transaction);
        trxs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(trxs));
        return trxs;
      } else {
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
        return [];
      }
    } catch (e: any) {
      if (checkIsQuotaError(e)) {
        markFirestoreQuotaExceeded(e?.message);
      }
      console.warn('Firestore getTransactions error, fallback to local:', e);
      return localTrxs;
    }
  },

  async addTransaction(trxData: Omit<Transaction, 'id' | 'created_at' | 'time_period'>): Promise<Transaction> {
    const students = await this.getStudents();
    const student = students.find((s) => s.id === trxData.student_id);

    if (!student) {
      throw new Error('Santri tidak ditemukan!');
    }

    const settings = await this.getSettings();
    const allowDebt = settings.allow_debt !== false;
    const maxDebtLimit = settings.max_debt_limit || 50000;
    const isDebt = student.balance < trxData.amount;
    const newBalance = student.balance - trxData.amount;

    if (isDebt) {
      if (!allowDebt) {
        throw new Error(
          `Saldo santri ${student.name} tidak mencukupi! Saldo saat ini: Rp ${student.balance.toLocaleString('id-ID')}. Fitur kasbon / hutang dinonaktifkan.`
        );
      }

      if (newBalance < -maxDebtLimit) {
        throw new Error(
          `Batas kasbon/hutang maksimal terlampaui! Maksimal minus diperbolehkan: Rp ${maxDebtLimit.toLocaleString('id-ID')}. Sisa saldo akan menjadi: Rp ${newBalance.toLocaleString('id-ID')}.`
        );
      }
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const autoTimePeriod = getTimePeriod(now);
    const newTrxId = 'trx-' + Date.now() + Math.random().toString(36).substring(2, 9);

    const transactionNotes = isDebt
      ? `[KASBON / HUTANG] ${trxData.notes || `Jajan ${trxData.category}`}`
      : trxData.notes;

    const newTrx: Transaction = {
      id: newTrxId,
      created_at: nowIso,
      time_period: autoTimePeriod,
      student_name: student.name,
      student_nis: student.nis,
      student_class: student.class_name,
      ...trxData,
      notes: transactionNotes,
    };

    // Deduct student balance (can be negative)
    student.balance = newBalance;
    student.updated_at = nowIso;

    // Save student locally
    const studentIndex = students.findIndex((s) => s.id === student.id);
    if (studentIndex !== -1) {
      students[studentIndex] = student;
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    }

    // Save Transaction locally
    const transactions = await this.getTransactions();
    transactions.unshift(newTrx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

    // Save to Firestore if not quota exceeded
    if (!isFirestoreQuotaExceeded()) {
      try {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          throw new Error('Offline mode');
        }
        await setDoc(doc(db, 'transactions', newTrx.id), newTrx);
        await updateDoc(doc(db, 'students', student.id), { balance: student.balance, updated_at: nowIso });
      } catch (e: any) {
        if (checkIsQuotaError(e)) {
          markFirestoreQuotaExceeded(e?.message);
        }
        console.warn('Firestore addTransaction offline/error, queued for sync:', e);
        this.addToPendingQueue({
          id: newTrx.id,
          type: 'transaction',
          title: `Jajan ${student.name} (${trxData.category} - Rp ${trxData.amount.toLocaleString('id-ID')})`,
          amount: trxData.amount,
          data: {
            transaction: newTrx,
            studentId: student.id,
            newBalance: student.balance,
          },
        });
      }
    } else {
      // Direct offline queue
      this.addToPendingQueue({
        id: newTrx.id,
        type: 'transaction',
        title: `Jajan ${student.name} (${trxData.category} - Rp ${trxData.amount.toLocaleString('id-ID')})`,
        amount: trxData.amount,
        data: {
          transaction: newTrx,
          studentId: student.id,
          newBalance: student.balance,
        },
      });
    }

    await this.logActivity(
      'Admin Koperasi',
      'Transaksi Jajan',
      `Jajan ${trxData.category} Rp ${trxData.amount.toLocaleString('id-ID')} - ${student.name} (${autoTimePeriod.toUpperCase()})`
    );

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent<TransactionSuccessDetail>(TRANSACTION_SUCCESS_EVENT, {
          detail: {
            transaction: newTrx,
            studentName: student.name,
            studentNis: student.nis,
            updatedBalance: student.balance,
            amount: trxData.amount,
            category: trxData.category,
          },
        })
      );
    }

    triggerDataChangeEvent();
    return newTrx;
  },

  // LOG ACTIVITY
  async logActivity(userName: string, action: string, details: string): Promise<void> {
    const log: ActivityLog = {
      id: 'log-' + Date.now() + Math.random().toString(36).substring(2, 9),
      user_id: 'admin',
      user_name: userName,
      action,
      details,
      created_at: new Date().toISOString(),
    };
    const logs = await this.getLogs();
    logs.unshift(log);
    const sliced = logs.slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(sliced));

    if (!isFirestoreQuotaExceeded()) {
      try {
        await setDoc(doc(db, 'activity_logs', log.id), log);
      } catch (e: any) {
        if (checkIsQuotaError(e)) {
          markFirestoreQuotaExceeded(e?.message);
        } else {
          console.error('Firestore logActivity error:', e);
        }
      }
    }
  },

  async getLogs(): Promise<ActivityLog[]> {
    const local = localStorage.getItem(STORAGE_KEYS.LOGS);
    let localLogs: ActivityLog[] = [];
    if (local) {
      try {
        localLogs = JSON.parse(local);
      } catch (e) {
        /* ignore */
      }
    }

    if (isFirestoreQuotaExceeded()) {
      return localLogs;
    }

    try {
      const colRef = collection(db, 'activity_logs');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const logs = snap.docs.map((doc) => doc.data() as ActivityLog);
        logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs.slice(0, 100)));
        return logs;
      }
    } catch (e: any) {
      if (checkIsQuotaError(e)) {
        markFirestoreQuotaExceeded(e?.message);
      }
      console.warn('Firestore getLogs error:', e);
    }
    return localLogs;
  },

  // CALCULATE DASHBOARD STATS
  async getDashboardStats(): Promise<{ stats: DashboardStats; topSantri: TopSantriStat[] }> {
    const students = await this.getStudents();
    const transactions = await this.getTransactions();
    const topups = await this.getTopUps();

    const total_students = students.length;
    const active_students = students.filter((s) => s.status === 'aktif').length;
    const total_balance_all = students.reduce((sum, s) => sum + (s.balance || 0), 0);

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    
    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    // Start of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayTrxs = transactions.filter((t) => t.created_at.slice(0, 10) === todayStr);
    const todayTopUps = topups.filter((t) => t.created_at.slice(0, 10) === todayStr);

    const today_transactions_count = todayTrxs.length;
    const today_income = todayTopUps.reduce((sum, t) => sum + t.amount, 0);
    const today_expense = todayTrxs.reduce((sum, t) => sum + t.amount, 0);

    const yesterdayTrxs = transactions.filter((t) => t.created_at.slice(0, 10) === yesterdayStr);
    const yesterdayTopUps = topups.filter((t) => t.created_at.slice(0, 10) === yesterdayStr);

    const yesterday_expense = yesterdayTrxs.reduce((sum, t) => sum + t.amount, 0);
    const yesterday_income = yesterdayTopUps.reduce((sum, t) => sum + t.amount, 0);

    const this_month_expense = transactions
      .filter((t) => new Date(t.created_at) >= startOfMonth)
      .reduce((sum, t) => sum + t.amount, 0);

    const this_month_topup = topups
      .filter((t) => new Date(t.created_at) >= startOfMonth)
      .reduce((sum, t) => sum + t.amount, 0);

    // Top 10 Santri Jajan
    const santriMap = new Map<string, { total_spent: number; count: number }>();
    (transactions || []).forEach((t) => {
      const prev = santriMap.get(t.student_id) || { total_spent: 0, count: 0 };
      santriMap.set(t.student_id, {
        total_spent: prev.total_spent + t.amount,
        count: prev.count + 1,
      });
    });

    const topSantri: TopSantriStat[] = Array.from(santriMap.entries())
      .map(([studentId, data]) => {
        const student = students.find((s) => s.id === studentId);
        return {
          student_id: studentId,
          student_name: student?.name || 'Santri',
          nis: student?.nis || '-',
          class_name: student?.class_name || '-',
          dormitory: student?.dormitory || '-',
          avatar_url: student?.avatar_url,
          total_spent: data.total_spent,
          transaction_count: data.count,
          current_balance: student?.balance || 0,
        };
      })
      .sort((a, b) => b.total_spent - a.total_spent)
      .slice(0, 10);

    return {
      stats: {
        total_students,
        active_students,
        total_balance_all,
        today_transactions_count,
        today_income,
        today_expense,
        yesterday_income,
        yesterday_expense,
        this_month_expense,
        this_month_topup,
      },
      topSantri,
    };
  },

  // DELETE TRANSACTION & RESTORE BALANCE
  async deleteTransaction(transactionId: string): Promise<void> {
    const transactions = await this.getTransactions();
    const targetTrx = transactions.find((t) => t.id === transactionId);
    if (!targetTrx) return;

    const filtered = transactions.filter((t) => t.id !== transactionId);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filtered));

    // Restore student balance
    const students = await this.getStudents();
    const student = students.find((s) => s.id === targetTrx.student_id);
    if (student) {
      student.balance += targetTrx.amount;
      student.updated_at = new Date().toISOString();
      const idx = students.findIndex((s) => s.id === student.id);
      if (idx !== -1) {
        students[idx] = student;
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
      }
    }

    if (!isFirestoreQuotaExceeded()) {
      try {
        await deleteDoc(doc(db, 'transactions', transactionId));
        if (student) {
          await updateDoc(doc(db, 'students', student.id), { balance: student.balance, updated_at: student.updated_at });
        }
      } catch (e: any) {
        if (checkIsQuotaError(e)) {
          markFirestoreQuotaExceeded(e?.message);
        } else {
          console.error('Firestore deleteTransaction error:', e);
        }
      }
    }

    await this.logActivity(
      'Admin Koperasi',
      'Hapus Transaksi',
      `Menghapus transaksi ${targetTrx.transaction_code} (${targetTrx.category} Rp ${targetTrx.amount.toLocaleString('id-ID')})`
    );
    triggerDataChangeEvent();
  },

  // DELETE TOPUP & DEDUCT BALANCE
  async deleteTopUp(topupId: string): Promise<void> {
    const topups = await this.getTopUps();
    const targetTopUp = topups.find((tp) => tp.id === topupId);
    if (!targetTopUp) return;

    const filtered = topups.filter((tp) => tp.id !== topupId);
    localStorage.setItem(STORAGE_KEYS.TOPUPS, JSON.stringify(filtered));

    // Deduct student balance
    const students = await this.getStudents();
    const student = students.find((s) => s.id === targetTopUp.student_id);
    if (student) {
      student.balance = Math.max(0, student.balance - targetTopUp.amount);
      student.updated_at = new Date().toISOString();
      const idx = students.findIndex((s) => s.id === student.id);
      if (idx !== -1) {
        students[idx] = student;
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
      }
    }

    if (!isFirestoreQuotaExceeded()) {
      try {
        await deleteDoc(doc(db, 'topups', topupId));
        if (student) {
          await updateDoc(doc(db, 'students', student.id), { balance: student.balance, updated_at: student.updated_at });
        }
      } catch (e: any) {
        if (checkIsQuotaError(e)) {
          markFirestoreQuotaExceeded(e?.message);
        } else {
          console.error('Firestore deleteTopUp error:', e);
        }
      }
    }

    await this.logActivity(
      'Admin Koperasi',
      'Hapus Isi Saldo',
      `Menghapus top up ${targetTopUp.topup_code} (Rp ${targetTopUp.amount.toLocaleString('id-ID')})`
    );
    triggerDataChangeEvent();
  },

  // CLEAR ALL TRANSACTIONS & TOPUPS
  async clearAllTransactionsAndTopups(): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.TOPUPS, JSON.stringify([]));

    // Reset student balances to 0
    const students = await this.getStudents();
    const updatedStudents = students.map((s) => ({ ...s, balance: 0, updated_at: new Date().toISOString() }));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updatedStudents));

    if (!isFirestoreQuotaExceeded()) {
      try {
        // Clear Firestore collections
        const trxSnap = await getDocs(collection(db, 'transactions'));
        for (const d of trxSnap.docs) { await deleteDoc(d.ref); }

        const topupSnap = await getDocs(collection(db, 'topups'));
        for (const d of topupSnap.docs) { await deleteDoc(d.ref); }

        for (const s of updatedStudents) {
          await updateDoc(doc(db, 'students', s.id), { balance: 0, updated_at: s.updated_at });
        }
      } catch (e: any) {
        if (checkIsQuotaError(e)) {
          markFirestoreQuotaExceeded(e?.message);
        } else {
          console.error('Firestore clear transactions error:', e);
        }
      }
    }

    await this.logActivity('Admin Koperasi', 'Reset Data', 'Menghapus seluruh riwayat transaksi jajan & isi saldo santri');
    triggerDataChangeEvent();
  },

  // RESET ALL STUDENT BALANCES TO 0
  async resetAllStudentBalances(): Promise<void> {
    const students = await this.getStudents();
    const updatedStudents = students.map((s) => ({ ...s, balance: 0, updated_at: new Date().toISOString() }));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updatedStudents));

    if (!isFirestoreQuotaExceeded()) {
      try {
        for (const s of updatedStudents) {
          await updateDoc(doc(db, 'students', s.id), { balance: 0, updated_at: s.updated_at });
        }
      } catch (e: any) {
        if (checkIsQuotaError(e)) {
          markFirestoreQuotaExceeded(e?.message);
        } else {
          console.error('Firestore reset balances error:', e);
        }
      }
    }

    await this.logActivity('Admin Koperasi', 'Reset Saldo', 'Mereset saldo seluruh santri menjadi Rp 0');
    triggerDataChangeEvent();
  },

  // RESET DATABASE TO DEFAULT 50 SANTRI & 50 JUTA SALDO
  async resetToDefaultSeed(): Promise<void> {
    try {
      localStorage.setItem('koperasi_initialized', 'true');
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
      localStorage.setItem(STORAGE_KEYS.TOPUPS, JSON.stringify(INITIAL_TOPUPS));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));

      if (!isFirestoreQuotaExceeded()) {
        // Clear existing docs
        const studSnap = await getDocs(collection(db, 'students'));
        for (const d of studSnap.docs) { await deleteDoc(d.ref); }

        const trxSnap = await getDocs(collection(db, 'transactions'));
        for (const d of trxSnap.docs) { await deleteDoc(d.ref); }

        const topupSnap = await getDocs(collection(db, 'topups'));
        for (const d of topupSnap.docs) { await deleteDoc(d.ref); }

        // Re-seed
        await this.seedInitialDataToFirestore();
      }

      await this.logActivity('Admin Koperasi', 'Reset ke Seed 50 Santri', 'Mereset database ke 50 Santri dan Saldo Rp 50.000.000');
      triggerDataChangeEvent();
    } catch (e: any) {
      if (checkIsQuotaError(e)) {
        markFirestoreQuotaExceeded(e?.message);
      } else {
        console.error('Firestore resetToDefaultSeed error:', e);
      }
    }
  },

  // START FROM ZERO
  async clearAllDataAndStartFromZero(): Promise<void> {
    localStorage.setItem('koperasi_initialized', 'true');
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.TOPUPS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));

    if (!isFirestoreQuotaExceeded()) {
      try {
        const studSnap = await getDocs(collection(db, 'students'));
        for (const d of studSnap.docs) { await deleteDoc(d.ref); }

        const trxSnap = await getDocs(collection(db, 'transactions'));
        for (const d of trxSnap.docs) { await deleteDoc(d.ref); }

        const topupSnap = await getDocs(collection(db, 'topups'));
        for (const d of topupSnap.docs) { await deleteDoc(d.ref); }
      } catch (e: any) {
        if (checkIsQuotaError(e)) {
          markFirestoreQuotaExceeded(e?.message);
        } else {
          console.error('Firestore clear all error:', e);
        }
      }
    }

    await this.logActivity('Admin Koperasi', 'Reset Total', 'Mengosongkan seluruh data santri dan transaksi untuk memulai dari nol');
    triggerDataChangeEvent();
  },

  // RESTORE BACKUP DATA FROM JSON
  async restoreBackupData(backupData: {
    students?: Student[];
    transactions?: Transaction[];
    topups?: TopUp[];
    settings?: AppSettings;
  }): Promise<{ importedStudents: number; importedTransactions: number; importedTopups: number }> {
    localStorage.setItem('koperasi_initialized', 'true');

    // Clear current data first
    await this.clearAllDataAndStartFromZero();

    const students = Array.isArray(backupData.students) ? backupData.students : [];
    const transactions = Array.isArray(backupData.transactions) ? backupData.transactions : [];
    const topups = Array.isArray(backupData.topups) ? backupData.topups : [];

    // Save Students
    if (students.length > 0) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
      if (!isFirestoreQuotaExceeded()) {
        try {
          const batchSize = 25;
          for (let i = 0; i < students.length; i += batchSize) {
            const batch = writeBatch(db);
            const chunk = students.slice(i, i + batchSize);
            chunk.forEach((s) => {
              batch.set(doc(db, 'students', s.id), s);
            });
            await batch.commit();
          }
        } catch (e: any) {
          if (checkIsQuotaError(e)) {
            markFirestoreQuotaExceeded(e?.message);
          } else {
            console.error('Error importing students to Firestore:', e);
          }
        }
      }
    }

    // Save Transactions
    if (transactions.length > 0) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      if (!isFirestoreQuotaExceeded()) {
        try {
          const batchSize = 25;
          for (let i = 0; i < transactions.length; i += batchSize) {
            const batch = writeBatch(db);
            const chunk = transactions.slice(i, i + batchSize);
            chunk.forEach((t) => {
              batch.set(doc(db, 'transactions', t.id), t);
            });
            await batch.commit();
          }
        } catch (e: any) {
          if (checkIsQuotaError(e)) {
            markFirestoreQuotaExceeded(e?.message);
          } else {
            console.error('Error importing transactions to Firestore:', e);
          }
        }
      }
    }

    // Save Topups
    if (topups.length > 0) {
      localStorage.setItem(STORAGE_KEYS.TOPUPS, JSON.stringify(topups));
      if (!isFirestoreQuotaExceeded()) {
        try {
          const batchSize = 25;
          for (let i = 0; i < topups.length; i += batchSize) {
            const batch = writeBatch(db);
            const chunk = topups.slice(i, i + batchSize);
            chunk.forEach((tp) => {
              batch.set(doc(db, 'topups', tp.id), tp);
            });
            await batch.commit();
          }
        } catch (e: any) {
          if (checkIsQuotaError(e)) {
            markFirestoreQuotaExceeded(e?.message);
          } else {
            console.error('Error importing topups to Firestore:', e);
          }
        }
      }
    }

    // Save Settings if included
    if (backupData.settings) {
      await this.saveSettings(backupData.settings);
    }

    await this.logActivity(
      'Admin Koperasi',
      'Restore Data Backup',
      `Memulihkan data: ${students.length} Santri, ${transactions.length} Transaksi, ${topups.length} Topup`
    );
    triggerDataChangeEvent();

    return {
      importedStudents: students.length,
      importedTransactions: transactions.length,
      importedTopups: topups.length,
    };
  },

  // PENDING OFFLINE QUEUE METHODS
  getPendingQueue(): PendingQueueItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PENDING_QUEUE);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  },

  getPendingQueueCount(): number {
    return this.getPendingQueue().length;
  },

  addToPendingQueue(item: Omit<PendingQueueItem, 'created_at'>): void {
    const queue = this.getPendingQueue();
    if (!queue.some((q) => q.id === item.id)) {
      queue.push({
        ...item,
        created_at: new Date().toISOString(),
      });
      localStorage.setItem(STORAGE_KEYS.PENDING_QUEUE, JSON.stringify(queue));
      triggerDataChangeEvent();
    }
  },

  removeFromPendingQueue(id: string): void {
    const queue = this.getPendingQueue().filter((q) => q.id !== id);
    localStorage.setItem(STORAGE_KEYS.PENDING_QUEUE, JSON.stringify(queue));
    triggerDataChangeEvent();
  },

  clearPendingQueue(): void {
    localStorage.removeItem(STORAGE_KEYS.PENDING_QUEUE);
    triggerDataChangeEvent();
  },

  async syncPendingQueue(): Promise<{ synced: number; remaining: number }> {
    const queue = this.getPendingQueue();
    if (queue.length === 0) return { synced: 0, remaining: 0 };

    if (isFirestoreQuotaExceeded()) {
      return { synced: 0, remaining: queue.length };
    }

    let syncedCount = 0;
    const remainingItems: PendingQueueItem[] = [];

    for (const item of queue) {
      try {
        if (item.type === 'transaction') {
          const { transaction, studentId, newBalance } = item.data;
          await setDoc(doc(db, 'transactions', transaction.id), transaction);
          if (studentId && typeof newBalance === 'number') {
            await updateDoc(doc(db, 'students', studentId), {
              balance: newBalance,
              updated_at: new Date().toISOString(),
            });
          }
          syncedCount++;
        } else if (item.type === 'topup') {
          const { topup, studentId, newBalance } = item.data;
          await setDoc(doc(db, 'topups', topup.id), topup);
          if (studentId && typeof newBalance === 'number') {
            await updateDoc(doc(db, 'students', studentId), {
              balance: newBalance,
              updated_at: new Date().toISOString(),
            });
          }
          syncedCount++;
        } else if (item.type === 'student') {
          await setDoc(doc(db, 'students', item.data.id), item.data);
          syncedCount++;
        }
      } catch (err: any) {
        if (checkIsQuotaError(err)) {
          markFirestoreQuotaExceeded(err?.message);
          remainingItems.push(item);
          break; // Don't pound server when quota is hit
        }
        console.warn(`Failed to sync item ${item.id}:`, err);
        remainingItems.push(item);
      }
    }

    localStorage.setItem(STORAGE_KEYS.PENDING_QUEUE, JSON.stringify(remainingItems));
    triggerDataChangeEvent();

    return {
      synced: syncedCount,
      remaining: remainingItems.length,
    };
  },

  // DAILY SUMMARIES REPORTS METHODS
  async getDailySummaries(): Promise<DailySummaryReport[]> {
    const localRaw = localStorage.getItem(STORAGE_KEYS.DAILY_SUMMARIES);
    let localList: DailySummaryReport[] = [];
    if (localRaw) {
      try {
        localList = JSON.parse(localRaw);
      } catch (err) {
        /* ignore */
      }
    }

    if (isFirestoreQuotaExceeded()) {
      return localList;
    }

    try {
      const q = query(collection(db, 'daily_summaries'), orderBy('generated_at', 'desc'));
      const snap = await getDocs(q);
      const list: DailySummaryReport[] = [];
      snap.forEach((doc) => {
        list.push(doc.data() as DailySummaryReport);
      });

      if (list.length > 0) {
        localStorage.setItem(STORAGE_KEYS.DAILY_SUMMARIES, JSON.stringify(list));
        return list;
      }
    } catch (e: any) {
      if (checkIsQuotaError(e)) {
        markFirestoreQuotaExceeded(e?.message);
      }
      console.warn('Firestore getDailySummaries error, falling back to local cache:', e);
    }

    return localList;
  },

  async saveDailySummaryReport(report: DailySummaryReport): Promise<void> {
    const current = await this.getDailySummaries();
    const updated = [report, ...current.filter((r) => r.id !== report.id)];
    localStorage.setItem(STORAGE_KEYS.DAILY_SUMMARIES, JSON.stringify(updated));

    if (!isFirestoreQuotaExceeded()) {
      try {
        await setDoc(doc(db, 'daily_summaries', report.id), report);
      } catch (e: any) {
        if (checkIsQuotaError(e)) {
          markFirestoreQuotaExceeded(e?.message);
        }
        console.warn('Firestore saveDailySummaryReport failed/offline, cached locally:', e);
      }
    }

    triggerDataChangeEvent();
  },
};
