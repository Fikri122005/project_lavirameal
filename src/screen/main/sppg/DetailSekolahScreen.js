import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

const BLUE_PRIMARY = '#1C2C5B';
const BLUE_DARK = '#1C2C5B';
const WHITE = '#FFFFFF';

export default function DetailSekolahScreen({ route, navigation }) {
  // Parsing parameters that were sent when the card was clicked
  const { schoolData } = route.params || {};

  // Placeholder students array (currently empty as discussed)
  const [students, setStudents] = useState([]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header section with Mega Mendung aesthetic */}
      <View style={styles.headerSection}>
        <Image
          source={require('../../../../assets/batik_cirebon.png')}
          style={[StyleSheet.absoluteFillObject, { opacity: 0.08, resizeMode: 'repeat' }]}
        />
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={WHITE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Data Sekolah</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.schoolCardInfo}>
          <View style={styles.iconContainer}>
            <Ionicons name="business" size={32} color={BLUE_PRIMARY} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.schoolName}>
              {schoolData?.nama_sekolah || schoolData?.nama || "Nama Sekolah Pendaftar"}
            </Text>
            <Text style={styles.schoolAddress} numberOfLines={2}>
              {schoolData?.alamat || "Alamat sekolah belum didata"}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Mini Row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Siswa Mendaftar</Text>
          <Text style={styles.statValue}>{students.length} Siswa</Text>
        </View>
        <View style={[styles.statBox, { borderLeftWidth: 1, borderColor: '#E2E8F0' }]}>
          <Text style={styles.statLabel}>Status Laporan</Text>
          <Text style={[styles.statValue, { color: '#059669' }]}>Aktif</Text>
        </View>
      </View>

      {/* Tab Area */}
      <View style={styles.tabHeader}>
        <Text style={styles.tabTitle}>Daftar Murid Terdaftar ({students.length})</Text>
      </View>

      {/* Content Space: where the students table would go */}
      <View style={styles.contentSection}>
        {students.length > 0 ? (
          <FlatList
            data={students}
            keyExtractor={(item, index) => index.toString()}
            renderItem={() => <View />}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-circle-outline" size={70} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Data Murid Masih Kosong</Text>
            <Text style={styles.emptySubtitle}>
              Data akan bertambah di sini secara instan sesaat setelah pihak "{schoolData?.nama_sekolah || 'Sekolah'}" melakukan registrasi murid-muridnya.
            </Text>
          </View>
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerSection: {
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 30,
    backgroundColor: BLUE_PRIMARY,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    position: 'relative',
    overflow: 'hidden',
    elevation: 5,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: WHITE,
  },
  schoolCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  schoolName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: WHITE,
    marginBottom: 6,
  },
  schoolAddress: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: WHITE,
    marginHorizontal: 24,
    marginTop: -20,
    borderRadius: 16,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 6,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  tabHeader: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 15,
  },
  tabTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: 24,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 50,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginTop: 15,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
});
