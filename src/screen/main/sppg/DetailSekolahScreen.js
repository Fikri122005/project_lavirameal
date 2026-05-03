import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ScrollView,
  Alert,
  Image,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const BLUE_PRIMARY = '#1C2C5B';
const BLUE_ACCENT = '#3b82f6';
const WHITE = '#FFFFFF';
const SOFT_BG = '#F1F5F9';

export default function DetailSekolahScreen({ route, navigation }) {
  const { width } = useWindowDimensions();
  const { sekolah } = route.params || {};
  const schoolData = sekolah; 
  
  // Mock students if not provided
  const studentCount = schoolData?.siswa || 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* PREMIUM REALISTIC HEADER HERO */}
      <View style={styles.header}>
        <View style={styles.headerBg}>
          <Image 
            source={require('../../../../assets/batik_cirebon.png')} 
            style={styles.batikOverlay} 
            resizeMode="repeat"
          />
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.topRow}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={24} color={WHITE} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Manajemen Institusi</Text>
              <View style={{ width: 44 }} />
            </View>

            <View style={styles.identityCard}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name="office-building" size={32} color={BLUE_PRIMARY} />
              </View>
              <View style={styles.identityInfo}>
                <Text style={styles.schoolName}>
                  {schoolData?.nama_sekolah || "Institusi Pendidikan"}
                </Text>
                <View style={styles.locRow}>
                   <Ionicons name="shield-checkmark" size={14} color="#10b981" />
                   <Text style={styles.schoolAddress}>
                     NPSN: {schoolData?.npsn || '2023xxxx'} • TERVERIFIKASI
                   </Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </View>

      {/* STATS OVERVIEW */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
           <Text style={styles.statLabel}>Total Siswa</Text>
           <View style={styles.valRow}>
              <Text style={styles.statVal}>{studentCount}</Text>
              <Text style={styles.statUnit}>Siswa</Text>
           </View>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
           <Text style={styles.statLabel}>Status Akun</Text>
           <View style={[styles.statusBadge, { backgroundColor: schoolData?.status === 'Aktif' ? '#ecfdf5' : '#fff7ed' }]}>
              <View style={[styles.statusDot, { backgroundColor: schoolData?.status === 'Aktif' ? '#10b981' : '#f59e0b' }]} />
              <Text style={[styles.statusTxt, { color: schoolData?.status === 'Aktif' ? '#047857' : '#92400e' }]}>{schoolData?.status?.toUpperCase() || 'PROBATION'}</Text>
           </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
         {/* FINANCIAL SUMMARY */}
         <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ringkasan Operasional</Text>
            <View style={styles.financeCard}>
               <View style={styles.financeRow}>
                  <View style={styles.finInfo}>
                     <Text style={styles.finLabel}>Total Anggaran Diterima</Text>
                     <Text style={styles.finVal}>Rp {(schoolData?.saldo || 0).toLocaleString('id-ID')}</Text>
                  </View>
                  <TouchableOpacity style={styles.finAction} onPress={() => Alert.alert("Audit Dana", "Laporan penggunaan dana sekolah sedang disinkronkan.")}>
                     <Ionicons name="stats-chart" size={18} color={BLUE_ACCENT} />
                  </TouchableOpacity>
               </View>
               <View style={styles.progressBox}>
                  <View style={styles.pLabelRow}>
                     <Text style={styles.pLabel}>Realisasi Gizi MBG</Text>
                     <Text style={styles.pVal}>85%</Text>
                  </View>
                  <View style={styles.pBarBg}><View style={[styles.pBarFill, { width: '85%' }]} /></View>
               </View>
            </View>
         </View>

         <View style={styles.section}>
            <View style={styles.sectionHeader}>
               <Text style={styles.sectionTitle}>Rangkuman Data Murid</Text>
               <View style={styles.countBadge}><Text style={styles.countTxt}>{studentCount}</Text></View>
            </View>
            
            <View style={styles.infoList}>
               <View style={styles.infoEntry}>
                  <Text style={styles.infoEntryLabel}>Total Rombel</Text>
                  <Text style={styles.infoEntryVal}>12 Kelas</Text>
               </View>
               <View style={styles.infoEntry}>
                  <Text style={styles.infoEntryLabel}>Sudah Aktivasi MBG</Text>
                  <Text style={styles.infoEntryVal}>{studentCount} Siswa</Text>
               </View>
               <View style={styles.infoEntry}>
                  <Text style={styles.infoEntryLabel}>Terakhir Sinkronasi</Text>
                  <Text style={styles.infoEntryVal}>Baru saja</Text>
               </View>
            </View>
         </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SOFT_BG },
  header: { height: 320, borderBottomLeftRadius: 60, borderBottomRightRadius: 60, overflow: 'hidden', elevation: 25 },
  headerBg: { flex: 1, backgroundColor: BLUE_PRIMARY, paddingHorizontal: 25 },
  batikOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.08, resizeMode: 'repeat' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 45, marginBottom: 25 },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  headerTitle: { color: WHITE, fontSize: 16, fontWeight: '900', letterSpacing: -0.5 },
  identityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.08)', padding: 18, borderRadius: 30, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)' },
  iconBox: { width: 64, height: 64, borderRadius: 20, backgroundColor: WHITE, justifyContent: 'center', alignItems: 'center', marginRight: 18, elevation: 5 },
  identityInfo: { flex: 1 },
  schoolName: { fontSize: 20, fontWeight: '900', color: WHITE, marginBottom: 8, letterSpacing: -0.5 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  schoolAddress: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 'bold' },
  statsContainer: { flexDirection: 'row', backgroundColor: WHITE, marginHorizontal: 25, marginTop: -35, borderRadius: 30, paddingVertical: 22, elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15 },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: '#f1f5f9', height: '60%', alignSelf: 'center' },
  statLabel: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
  valRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  statVal: { fontSize: 22, fontWeight: '900', color: BLUE_PRIMARY },
  statUnit: { fontSize: 10, fontWeight: '900', color: '#cbd5e1' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusTxt: { fontSize: 12, fontWeight: '900' },
  section: { marginTop: 35, paddingHorizontal: 25 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  sectionTitle: { fontSize: 17, fontWeight: '900', color: '#1e293b', marginBottom: 15 },
  countBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  countTxt: { fontSize: 12, fontWeight: 'bold', color: BLUE_ACCENT },
  financeCard: { backgroundColor: WHITE, borderRadius: 30, padding: 25, elevation: 3 },
  financeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  finLabel: { fontSize: 11, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 5 },
  finVal: { fontSize: 22, fontWeight: '900', color: BLUE_PRIMARY },
  finAction: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#f0f9ff', justifyContent: 'center', alignItems: 'center' },
  progressBox: { marginTop: 5 },
  pLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  pLabel: { fontSize: 12, color: '#64748b', fontWeight: 'bold' },
  pVal: { fontSize: 12, fontWeight: '900', color: BLUE_PRIMARY },
  pBarBg: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  pBarFill: { height: '100%', backgroundColor: BLUE_ACCENT, borderRadius: 4 },
  infoList: { backgroundColor: WHITE, borderRadius: 30, padding: 25, gap: 18, elevation: 2 },
  infoEntry: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoEntryLabel: { fontSize: 13, fontWeight: 'bold', color: '#94a3b8' },
  infoEntryVal: { fontSize: 13, fontWeight: '900', color: '#475569' },
  mainActionBtn: { backgroundColor: BLUE_PRIMARY, height: 64, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 25, elevation: 8, shadowColor: BLUE_PRIMARY, shadowOpacity: 0.3, shadowRadius: 15 },
  mainActionTxt: { color: WHITE, fontSize: 15, fontWeight: '900', marginRight: 10 },
});
