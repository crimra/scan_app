import { collection, addDoc, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { AttendanceRecord, User } from '../types';

export class AttendanceService {
  private static COLLECTION_NAME = 'attendance';

  static async recordAttendance(
    userId: string,
    type: 'check-in' | 'check-out',
    qrCodeData?: string,
    location?: { latitude: number; longitude: number }
  ): Promise<string> {
    try {
      const attendanceRecord = {
        userId,
        timestamp: Timestamp.now(),
        type,
        qrCodeData,
        location,
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), attendanceRecord);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du pointage:', error);
      throw error;
    }
  }

  static async getUserAttendanceHistory(userId: string): Promise<AttendanceRecord[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      })) as AttendanceRecord[];
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      throw error;
    }
  }

  static async getTodayAttendance(userId: string): Promise<AttendanceRecord[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        where('timestamp', '>=', Timestamp.fromDate(today)),
        where('timestamp', '<', Timestamp.fromDate(tomorrow)),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      })) as AttendanceRecord[];
    } catch (error) {
      console.error('Erreur lors de la récupération du pointage du jour:', error);
      throw error;
    }
  }
}