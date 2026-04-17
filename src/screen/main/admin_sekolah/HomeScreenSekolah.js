import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../../../api/client';

const BLUE_PRIMARY = '#1C2C5B';
const BLUE_DARK = '#1C2C5B';
const WHITE = '#FFFFFF';

export default function HomeScreenSekolah({ navigation }) {
  const [stats, setStats] = useState({
    total_siswa: 0,
    jadwal_hari_ini: 0,
    status_distribusi: 'Loading...'
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/sekolah_get_stats.php');
      if (response.data && response.data.status === 'success') {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching admin sekolah stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchStats();
      const interval = setInterval(() => {
        fetchStats();
      }, 5000);
      return () => clearInterval(interval);
    }, [])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchStats().then(() => setRefreshing(false));
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[BLUE_PRIMARY]} />
        }
      >

        {/* HEADER */}
        <View style={styles.headerSection}>
          <Image
            source={require('../../../../assets/batik_cirebon.png')}
            style={[StyleSheet.absoluteFillObject, { opacity: 0.08, resizeMode: 'repeat' }]}
          />

          <View style={styles.headerTop}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>S</Text>
              </View>
              <View>
                <Text style={styles.welcomeText}>Halo, Kepala Sekolah</Text>
                <Text style={styles.roleText}>Admin Sekolah — LAVIRA</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.iconButton}>
              <Feather name="bell" size={22} color="#fff" />
              <View style={styles.badge} />
            </TouchableOpacity>
          </View>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerAppTitle}>LAVIRAMEAL</Text>
            <Text style={styles.headerAppSubtitle}>Makan Bergizi Gratis</Text>
          </View>
        </View>

        {/* STATISTIK GRID */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Dashboard Sekolah</Text>
          
          {loading ? (
             <ActivityIndicator size="large" color={BLUE_PRIMARY} style={{ marginVertical: 30 }}/>
          ) : (
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: '#E0F2FE' }]}>
                  <Ionicons name="people" size={24} color="#0284C7" />
                </View>
                <Text style={styles.statValue}>{String(stats.total_siswa)}</Text>
                <Text style={styles.statLabel}>Siswa Penerima</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="time" size={24} color="#16A34A" />
                </View>
                <Text style={styles.statValue}>{String(stats.jadwal_hari_ini)}</Text>
                <Text style={styles.statLabel}>Sesi Makan</Text>
              </View>

              <View style={[styles.statCard, { width: '100%', flexDirection: 'row', alignItems: 'center', paddingVertical: 20 }]}>
                <View style={[styles.statIconContainer, { backgroundColor: '#FEF3C7', marginBottom: 0, marginRight: 16 }]}>
                  <MaterialCommunityIcons name="truck-delivery" size={24} color="#D97706" />
                </View>
                <View>
                  <Text style={[styles.statValue, { fontSize: 18 }]}>{stats.status_distribusi || 'N/A'}</Text>
                  <Text style={[styles.statLabel, { marginTop: 2 }]}>Status Distribusi Hari Ini</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* INFORMASI TAMBAHAN */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Informasi Terkini</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoIconBox}>
              <Feather name="check-circle" size={24} color="#16A34A" />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.infoTitle}>Integrasi Lavira Tersambung</Text>
              <Text style={styles.infoDesc}>Data sekolah, presensi, dan keluhan anda kini dipantau langsung oleh pusat SPPG.</Text>
            </View>
          </View>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <Feather name="home" size={24} color={BLUE_PRIMARY} />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Home</Text>
        </TouchableOpacity>
        {/* Placeholder tab sekolah if needed */}
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <Feather name="check-square" size={24} color="#94A3B8" />
          <Text style={styles.navLabel}>Presensi</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => { /* Logout jika perlu */ navigation.replace('Login'); }}>
          <Feather name="log-out" size={24} color="#94A3B8" />
          <Text style={styles.navLabel}>Keluar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  headerSection: {
    backgroundColor: BLUE_PRIMARY,
    paddingTop: 56,
    paddingHorizontal: 24,
    height: 240,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: { fontSize: 22, fontWeight: 'bold', color: WHITE },
  welcomeText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 2 },
  roleText: { fontSize: 16, fontWeight: 'bold', color: WHITE, letterSpacing: 0.5 },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  badge: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1, borderColor: BLUE_PRIMARY },
  headerTitleContainer: { alignItems: 'flex-start' },
  headerAppTitle: { fontSize: 26, fontWeight: '900', color: WHITE, letterSpacing: 1 },
  headerAppSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  sectionContainer: { marginTop: -20, paddingHorizontal: 20, paddingTop: 40 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginBottom: 16, letterSpacing: 0.5 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', backgroundColor: WHITE, borderRadius: 20, padding: 16, marginBottom: 16, alignItems: 'flex-start', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
  statIconContainer: { width: 48, height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  infoCard: { backgroundColor: WHITE, borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  infoIconBox: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center' },
  infoTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  infoDesc: { fontSize: 13, color: '#64748B', lineHeight: 20 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 16, paddingBottom: 40, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 10 },
  navItem: { alignItems: 'center', flex: 1 },
  navLabel: { fontSize: 11, color: '#94A3B8', marginTop: 4, fontWeight: '500' },
  navLabelActive: { color: BLUE_PRIMARY, fontWeight: 'bold' }
});
