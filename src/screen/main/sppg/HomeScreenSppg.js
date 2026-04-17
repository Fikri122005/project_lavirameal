import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Modal,
  FlatList,
  Image,
  RefreshControl,
  Dimensions
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import apiClient from '../../../api/client';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';

const BLUE_PRIMARY = '#1C2C5B';
const BLUE_DARK = '#1C2C5B';
const WHITE = '#FFFFFF';

export default function HomeScreenSppg({ navigation }) {
  const [stats, setStats] = useState({
    total_sekolah: 0,
    total_siswa: 0,
    daftar_sekolah: [],
    kehadiran_hari_ini: 0,
    grafik_konsumsi: []
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState('Budi Santoso');

  // Load Image dan User Data saat aplikasi dibuka
  const loadProfileImage = async () => {
    try {
      const savedImage = await AsyncStorage.getItem('@profile_image');
      if (savedImage) setProfileImage(savedImage);

      const userDataStr = await AsyncStorage.getItem('user_data');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        if (userData.nama) setUserName(userData.nama);
      }
    } catch (error) {
      console.log("Error loading data:", error);
    }
  };

  // Fungsi Pilih Gambar
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);
      await AsyncStorage.setItem('@profile_image', uri);
    }
  };

  const [refreshing, setRefreshing] = useState(false);

  // Tarik ke bawah untuk refresh
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchStats().then(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    loadProfileImage();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchStats();

      // Realtime polling setiap 5 detik
      const interval = setInterval(() => {
        fetchStats();
      }, 5000);

      return () => clearInterval(interval);
    }, [])
  );

  const fetchStats = async () => {
    try {
      // PASTIKAN IP INI SESUAI DENGAN IP LAPTOP TERBARU KAMU (cek ipconfig)
      const response = await apiClient.get('/sppg_get_stats.php?sppg_id=1');
      if (response.data && response.data.status === 'success') {
        setStats({
          total_sekolah: response.data.data.total_sekolah || 0,
          total_siswa: response.data.data.total_siswa || 0,
          daftar_sekolah: response.data.data.daftar_sekolah || [],
          kehadiran_hari_ini: response.data.data.kehadiran_hari_ini || 0,
          grafik_konsumsi: response.data.data.grafik_konsumsi || []
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[BLUE_PRIMARY]}
          />
        }
      >

        <View style={styles.headerSection}>
          <Image
            source={require('../../../../assets/batik_cirebon.png')}
            style={[StyleSheet.absoluteFillObject, { opacity: 0.08, resizeMode: 'repeat' }]}
          />

          <View style={styles.headerTop}>
            <View style={styles.userInfo}>
              <TouchableOpacity onPress={pickImage} activeOpacity={0.8} style={{ position: 'relative', marginRight: 14 }}>
                <View style={styles.avatarContainer}>
                  {profileImage ? (
                    <Image source={{ uri: profileImage }} style={{ width: 48, height: 48, borderRadius: 24 }} />
                  ) : (
                    <Text style={styles.avatarText}>A</Text>
                  )}
                </View>
                <View style={styles.cameraIconBadge}>
                  <Feather name="camera" size={10} color={WHITE} />
                </View>
              </TouchableOpacity>
              <View>
                <Text style={styles.welcomeText}>Halo, {userName}</Text>
                <Text style={styles.roleText}>Admin Pusat — SPPG</Text>
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
          <Text style={styles.sectionTitle}>Dashboard Statistik</Text>
          {loading ? (
            <ActivityIndicator size="large" color={BLUE_PRIMARY} />
          ) : (
            <View style={styles.statsGrid}>
              <TouchableOpacity style={styles.statCard} onPress={() => setModalVisible(true)}>
                <View style={[styles.statIconContainer, { backgroundColor: '#CFF0F9' }]}>
                  <Ionicons name="school" size={24} color="#0369A1" />
                </View>
                <Text style={styles.statLabel}>Total Sekolah</Text>
                <Text style={[styles.statValue, { marginTop: 4 }]}>{String(stats.total_sekolah)}</Text>
              </TouchableOpacity>

              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: '#BBF7D0' }]}>
                  <Ionicons name="people" size={24} color="#16A34A" />
                </View>
                <Text style={styles.statLabel}>Jadwal Hari Ini</Text>
                <Text style={[styles.statValue, { marginTop: 4, fontSize: 18 }]}>Tidak Ada</Text>
              </View>

              <View style={[styles.statCard, { width: '100%', flexDirection: 'row', alignItems: 'center', paddingVertical: 20 }]}>
                <View style={[styles.statIconContainer, { backgroundColor: '#FDE68A', marginBottom: 0, marginRight: 16 }]}>
                  <Ionicons name="checkmark-circle" size={28} color="#EA580C" />
                </View>
                <View>
                  <Text style={styles.statValue}>{String(stats.kehadiran_hari_ini)}</Text>
                  <Text style={[styles.statLabel, { marginTop: 2 }]}>kehadiran hari ini</Text>
                </View>
              </View>

            </View>
          )}
        </View>

        {/* GRAFIK KONSUMSI HARIAN */}
        <View style={styles.sectionContainer}>
          <View style={styles.chartCardNew}>
            <View style={styles.chartHeaderRow}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.chartCardTitle}>Grafik Konsumsi Harian</Text>
                <Text style={styles.chartCardSubtitle}>Jumlah porsi yang berhasil dikonsumsi dalam 7 hari terakhir.</Text>
              </View>
              <TouchableOpacity style={styles.reloadBtn} onPress={fetchStats}>
                <Feather name="refresh-cw" size={14} color="#64748B" />
                <Text style={styles.reloadBtnText}>Reload</Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 20, alignItems: 'center', paddingRight: 15 }}>
              {(() => {
                const rawData = stats.grafik_konsumsi && stats.grafik_konsumsi.length > 0 
                  ? stats.grafik_konsumsi 
                  : [
                      { hari: '07 Apr', total: 0 },
                      { hari: '08 Apr', total: 0 },
                      { hari: '09 Apr', total: 0 },
                      { hari: '10 Apr', total: 0 },
                      { hari: '11 Apr', total: 0 },
                      { hari: '12 Apr', total: 0 },
                      { hari: '13 Apr', total: 0 }
                    ];

                const labels = rawData.map(d => d.hari || d.label || '');
                const dataPoints = rawData.map(d => parseInt(d.total || d.value || 0));
                const allZero = Math.max(...dataPoints) === 0;

                // Add a dummy point if all zero so the chart doesn't break and can scale to 1.0 properly.
                const validDataPoints = allZero ? [0,0,0,0,0,0,0] : dataPoints;

                return (
                  <LineChart
                    data={{
                      labels: labels,
                      datasets: [{
                        data: validDataPoints,
                        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                        strokeWidth: 2
                      },
                      ...(allZero ? [{ data: [1], withDots: false, color: () => 'transparent' }] : [])] // Invisible dataset to push Y-axis to 1.0 when all zero
                    }}
                    width={Dimensions.get('window').width - 40 - 32} 
                    height={220}
                    yAxisInterval={1}
                    segments={allZero ? 10 : 5}
                    fromZero={true}
                    chartConfig={{
                      backgroundColor: '#ffffff',
                      backgroundGradientFrom: '#ffffff',
                      backgroundGradientTo: '#ffffff',
                      decimalPlaces: allZero ? 1 : 0,
                      color: (opacity = 1) => `rgba(226, 232, 240, ${opacity})`, // Grid lines color
                      labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                      style: { borderRadius: 16 },
                      propsForDots: { r: "5", strokeWidth: "2", stroke: "#3B82F6", fill: "#ffffff" },
                      propsForBackgroundLines: { strokeDasharray: "", stroke: "#F1F5F9", strokeWidth: 1 }, 
                      propsForLabels: { fontSize: 10, fontWeight: '500' }
                    }}
                    bezier={false}
                    withOuterLines={false}
                    withVerticalLines={false} 
                    style={{ marginVertical: 8, borderRadius: 16, marginLeft: -10 }}
                  />
                );
              })()}
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* MODAL DAFTAR SEKOLAH */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sekolah Terdaftar</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Total: {stats.total_sekolah} Sekolah</Text>
            
            <FlatList
              data={stats.daftar_sekolah}
              keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
              renderItem={({ item }) => (
                <View style={styles.modalListItem}>
                  <View style={styles.modalIconBg}>
                    <Ionicons name="school" size={20} color={BLUE_PRIMARY} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalItemTitle}>{item.nama_sekolah || item.nama}</Text>
                    <Text style={styles.modalItemSubtitle}>{item.jumlah_siswa} Siswa Aktif</Text>
                  </View>
                </View>
              )}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Feather name="home" size={24} color={BLUE_PRIMARY} />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Sekolah')}>
          <Feather name="book" size={24} color="#94A3B8" />
          <Text style={styles.navLabel}>Sekolah</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Laporan')}>
          <Feather name="file-text" size={24} color="#94A3B8" />
          <Text style={styles.navLabel}>Laporan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Kantin')}>
          <Feather name="coffee" size={24} color="#94A3B8" />
          <Text style={styles.navLabel}>Kantin</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profil')}>
          <Feather name="user" size={24} color="#94A3B8" />
          <Text style={styles.navLabel}>Profil</Text>
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
    backgroundColor: '#fff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: BLUE_PRIMARY,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: WHITE,
  },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: BLUE_PRIMARY },
  welcomeText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  roleText: { fontSize: 14, color: 'rgba(255, 255, 255, 0.9)', marginTop: 2 },
  headerTitleContainer: { marginTop: 10, alignItems: 'center' },
  headerAppTitle: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 1.5 },
  headerAppSubtitle: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', marginTop: 4 },
  sectionContainer: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 16 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  statCard: { width: '48%', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2 },
  statIconContainer: { width: 48, height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 13, color: '#666' },
  chartCardNew: { backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 2, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  chartHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  chartCardTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  chartCardSubtitle: { fontSize: 12, color: '#64748B', lineHeight: 18 },
  reloadBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  reloadBtnText: { fontSize: 12, color: '#475569', marginLeft: 6, fontWeight: '600' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 16, paddingBottom: 40, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 10 },
  navItem: { alignItems: 'center', flex: 1 },
  navLabel: { fontSize: 11, color: '#94A3B8', marginTop: 4 },
  navLabelActive: { color: BLUE_PRIMARY, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 34, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  modalSubtitle: { fontSize: 14, color: '#64748B', marginBottom: 20 },
  modalListItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalIconBg: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  modalItemTitle: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  modalItemSubtitle: { fontSize: 13, color: '#64748B', marginTop: 4 },
});