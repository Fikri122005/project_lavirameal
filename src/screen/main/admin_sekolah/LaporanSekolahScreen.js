import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, 
  StatusBar, FlatList, ActivityIndicator, Alert, TextInput, ScrollView, Modal, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import apiClient from '../../../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const BLUE_PRIMARY = '#0B1E3F';
const BLUE_ACCENT = '#38BDF8';
const WHITE = '#FFFFFF';
const SOFT_BG = '#F8FAFC';
const TEXT_MAIN = '#1E293B';
const TEXT_MUTED = '#64748B';
const BORDER_LIGHT = '#E2E8F0';
const ACCENT_GREEN = '#10B981';
const ACCENT_RED = '#F43F5E';
const ACCENT_YELLOW = '#F59E0B';

export default function LaporanSekolahScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState('Transaksi Dana');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [quickActionModal, setQuickActionModal] = useState(false);
  

  const [dataTransaksi, setDataTransaksi] = useState([]);
  const [dataPenerimaKelas, setDataPenerimaKelas] = useState([]);
  const [dataBulanan, setDataBulanan] = useState([]);

  const [stats, setStats] = useState({
    total_dana_masuk: 'Rp 0',
    total_dana_keluar: 'Rp 0',
    total_penerima: '0',
    rekap_bulan: 'Bulan ini'
  });

  const fetchLaporan = useCallback(async () => {
    try {
      setLoading(true);
      const userDataStr = await AsyncStorage.getItem('user_data');
      if (!userDataStr) return;
      const userData = JSON.parse(userDataStr);

      const response = await apiClient.get(`sekolah/sekolah_get_laporan_lengkap.php?sekolah_id=${userData.sekolah_id}`);
      if (response.data && response.data.status === 'success') {
        const d = response.data.data;

        setDataTransaksi(d.transaksi_dana || []);
        setDataPenerimaKelas(d.penerima_kelas || []);
        setDataBulanan(d.bulanan || []);

        // Calculate stats for current month
        if (d.bulanan && d.bulanan.length > 0) {
          const latest = d.bulanan[0];
          setStats({
            total_dana_masuk: 'Rp ' + parseInt(latest.total_dana_masuk || 0).toLocaleString('id-ID'),
            total_dana_keluar: 'Rp ' + parseInt(latest.total_dana_keluar || 0).toLocaleString('id-ID'),
            total_penerima: (latest.total_penerima || 0).toString(),
            rekap_bulan: latest.bulan || 'Bulan ini'
          });
        }
      }
    } catch (error) {
      console.error("Error fetching laporan:", error);
      Alert.alert("Error", "Gagal mengambil data laporan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLaporan();
  }, [fetchLaporan]);

  const handleKirimRekap = (bulan) => {
    Alert.alert(
      "Kirim Rekap",
      `Kirim rekapitulasi bulan ${bulan} ke Admin SPPG?`,
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Kirim", 
          onPress: () => {
            Alert.alert("Berhasil", "Rekapitulasi telah dikirim ke Admin SPPG.");
          }
        }
      ]
    );
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      let tableContent = '';
      let title = `Laporan ${activeTab}`;

      if (activeTab === 'Transaksi Dana') {
        tableContent = `
          <tr>
            <th>ID</th><th>Tanggal</th><th>Nominal</th><th>Metode</th><th>Status</th>
          </tr>
          ${dataTransaksi.map(item => `
            <tr>
              <td>${item.id}</td>
              <td>${item.tanggal_format}</td>
              <td>Rp ${parseInt(item.nominal || 0).toLocaleString('id-ID')}</td>
              <td>${item.metode}</td>
              <td>${item.status}</td>
            </tr>
          `).join('')}
        `;
      } else if (activeTab === 'Penerima Dana') {
        tableContent = `
          <tr>
            <th>Kelas</th><th>Jml Siswa</th><th>Total Dana</th><th>Periode</th>
          </tr>
          ${dataPenerimaKelas.map(item => `
            <tr>
              <td>Kelas ${item.kelas}</td>
              <td>${item.jumlah_siswa}</td>
              <td>Rp ${parseInt(item.total_dana || 0).toLocaleString('id-ID')}</td>
              <td>${item.periode}</td>
            </tr>
          `).join('')}
        `;
      } else {
        tableContent = `
          <tr>
            <th>Bulan</th><th>Dana Masuk</th><th>Dana Keluar</th><th>Penerima</th>
          </tr>
          ${dataBulanan.map(item => `
            <tr>
              <td>${item.bulan}</td>
              <td>Rp ${parseInt(item.total_dana_masuk || 0).toLocaleString('id-ID')}</td>
              <td>Rp ${parseInt(item.total_dana_keluar || 0).toLocaleString('id-ID')}</td>
              <td>${item.total_penerima} Siswa</td>
            </tr>
          `).join('')}
        `;
      }

      const html = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica'; padding: 20px; }
              h1 { color: #0B1E3F; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 12px; }
              th { background-color: #0B1E3F; color: white; }
              tr:nth-child(even) { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
            <table>${tableContent}</table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert("Error", "Gagal mengunduh laporan.");
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = (status) => {
    const s = status ? status.toLowerCase() : '';
    let bgColor = '#F1F5F9';
    let textColor = TEXT_MUTED;
    let label = status || 'Unknown';
    
    if (s === 'completed' || s === 'berhasil' || s === 'selesai') { bgColor = '#ECFDF5'; textColor = ACCENT_GREEN; label = 'Selesai'; }
    else if (s === 'proses' || s === 'pending') { bgColor = '#FFFBEB'; textColor = ACCENT_YELLOW; label = 'Proses'; }
    else if (s === 'batal' || s === 'gagal') { bgColor = '#FEF2F2'; textColor = ACCENT_RED; label = 'Batal'; }

    return (
      <View style={[styles.badge, { backgroundColor: bgColor }]}>
        <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* HEADER SECTION */}
      <View style={styles.header}>
         <View style={styles.headerBg}>
            <Image 
               source={require('../../../../assets/batik_cirebon.png')} 
               style={[StyleSheet.absoluteFillObject, { opacity: 0.12, resizeMode: 'repeat' }]} 
            />
            <SafeAreaView style={{ flex: 1 }}>
               <View style={styles.headerTop}>
                  <View>
                    <Text style={styles.headerSubtitle}>LAPORAN SEKOLAH</Text>
                    <Text style={styles.headerTitle}>Manajemen Dana</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity style={styles.refreshBtn} onPress={handleDownload}>
                      <Feather name="download" size={20} color={WHITE} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.refreshBtn} onPress={fetchLaporan}>
                      <Feather name="refresh-cw" size={20} color={WHITE} />
                    </TouchableOpacity>
                  </View>
               </View>
            </SafeAreaView>
         </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* STATS ROW */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll} contentContainerStyle={{ paddingHorizontal: 20 }}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Dana Masuk</Text>
            <Text style={styles.statValue}>{stats.total_dana_masuk}</Text>
            <Text style={styles.statSubInfo}>Bulan ini</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Dana Keluar</Text>
            <Text style={[styles.statValue, { color: ACCENT_RED }]}>{stats.total_dana_keluar}</Text>
            <Text style={styles.statSubInfo}>Operasional</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Penerima</Text>
            <Text style={styles.statValue}>{stats.total_penerima}</Text>
            <Text style={styles.statSubInfoMuted}>Siswa tercover</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Periode</Text>
            <Text style={[styles.statValue, { fontSize: 16 }]}>{stats.rekap_bulan}</Text>
            <Text style={styles.statSubInfoMuted}>Rekap aktif</Text>
          </View>
        </ScrollView>

        {/* TABS */}
        <View style={styles.tabsContainer}>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15 }}>
              {['Transaksi Dana', 'Penerima Dana', 'Bulanan/Rekap'].map((tab) => (
                <TouchableOpacity 
                  key={tab} 
                  style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                </TouchableOpacity>
              ))}
           </ScrollView>
        </View>

        {/* MAIN CARD CONTENT */}
        <View style={styles.mainCard}>
           {activeTab !== 'Bulanan/Rekap' && (
             <View style={styles.searchContainer}>
                <Feather name="search" size={16} color={TEXT_MUTED} style={{ marginLeft: 15 }} />
                <TextInput 
                  style={styles.searchInput} 
                  placeholder="Cari data..." 
                  placeholderTextColor={TEXT_MUTED}
                  value={search}
                  onChangeText={setSearch}
                />
             </View>
           )}
           
           <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View>
                 {/* Table Header */}
                 <View style={styles.tableHeader}>
                    {activeTab === 'Transaksi Dana' ? (
                      <>
                        <Text style={[styles.thText, { width: 120 }]}>ID Transaksi</Text>
                        <Text style={[styles.thText, { width: 110 }]}>Tanggal</Text>
                        <Text style={[styles.thText, { width: 110 }]}>Nominal</Text>
                        <Text style={[styles.thText, { width: 90 }]}>Metode</Text>
                        <Text style={[styles.thText, { width: 90 }]}>Status</Text>
                      </>
                    ) : activeTab === 'Penerima Dana' ? (
                      <>
                        <Text style={[styles.thText, { width: 100 }]}>Kelas</Text>
                        <Text style={[styles.thText, { width: 100 }]}>Jml Siswa</Text>
                        <Text style={[styles.thText, { width: 130 }]}>Total Dana</Text>
                        <Text style={[styles.thText, { width: 120 }]}>Periode</Text>
                      </>
                    ) : activeTab === 'Bulanan/Rekap' ? (
                      <>
                        <Text style={[styles.thText, { width: 120 }]}>Bulan</Text>
                        <Text style={[styles.thText, { width: 120 }]}>Dana Masuk</Text>
                        <Text style={[styles.thText, { width: 120 }]}>Dana Keluar</Text>
                        <Text style={[styles.thText, { width: 90 }]}>Penerima</Text>
                        <Text style={[styles.thText, { width: 100 }]}>Aksi</Text>
                      </>
                    ) : null}
                 </View>

                 {/* Table Body */}
                 {loading ? (
                    <View style={{ padding: 30, width: width - 40, alignItems: 'center' }}><ActivityIndicator size="small" color={BLUE_PRIMARY} /></View>
                 ) : (
                    <FlatList
                      data={
                         activeTab === 'Transaksi Dana' ? dataTransaksi : 
                         activeTab === 'Penerima Dana' ? dataPenerimaKelas : 
                         dataBulanan
                      }
                      keyExtractor={(item, idx) => idx.toString()}
                       renderItem={({ item, index }) => (
                        <View style={styles.tableRowList}>
                           {activeTab === 'Transaksi Dana' ? (
                              <>
                                <Text style={[styles.cellText, { width: 120 }]}>{item.id}</Text>
                                <Text style={[styles.cellText, { width: 110 }]}>{item.tanggal_format}</Text>
                                <Text style={[styles.cellText, { width: 110, fontWeight: 'bold', color: BLUE_PRIMARY }]}>
                                   Rp {parseInt(item.nominal || 0).toLocaleString('id-ID')}
                                </Text>
                                <Text style={[styles.cellText, { width: 90 }]}>{item.metode}</Text>
                                <View style={{ width: 90, alignItems: 'flex-start' }}>{renderStatusBadge(item.status)}</View>
                              </>
                           ) : activeTab === 'Penerima Dana' ? (
                              <>
                                <Text style={[styles.cellText, styles.cellBold, { width: 100 }]}>Kelas {item.kelas}</Text>
                                <Text style={[styles.cellText, { width: 100 }]}>{item.jumlah_siswa} Siswa</Text>
                                <Text style={[styles.cellText, { width: 130, fontWeight: 'bold', color: BLUE_PRIMARY }]}>
                                   Rp {parseInt(item.total_dana || 0).toLocaleString('id-ID')}
                                </Text>
                                <Text style={[styles.cellText, { width: 120 }]}>{item.periode}</Text>
                              </>
                           ) : activeTab === 'Bulanan/Rekap' ? (
                              <>
                                <Text style={[styles.cellText, styles.cellBold, { width: 120 }]}>{item.bulan}</Text>
                                <Text style={[styles.cellText, { width: 120, fontWeight: 'bold', color: ACCENT_GREEN }]}>
                                   Rp {parseInt(item.total_dana_masuk || 0).toLocaleString('id-ID')}
                                </Text>
                                <Text style={[styles.cellText, { width: 120, fontWeight: 'bold', color: ACCENT_RED }]}>
                                   Rp {parseInt(item.total_dana_keluar || 0).toLocaleString('id-ID')}
                                </Text>
                                <Text style={[styles.cellText, { width: 90 }]}>{item.total_penerima} Siswa</Text>
                                <TouchableOpacity 
                                  style={styles.sendBtn}
                                  onPress={() => handleKirimRekap(item.bulan)}
                                >
                                  <Feather name="send" size={14} color={WHITE} />
                                  <Text style={styles.sendBtnText}>Kirim</Text>
                                </TouchableOpacity>
                              </>
                           ) : null}
                        </View>
                      )}
                      scrollEnabled={false}
                      ListEmptyComponent={() => <Text style={{ padding: 20, textAlign: 'center', color: TEXT_MUTED }}>Tidak ada data</Text>}
                    />
                 )}
              </View>
           </ScrollView>
        </View>
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
         <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('HomeSekolah')}><Ionicons name="grid-outline" size={24} color="#94a3b8" /><Text style={styles.navLabel}>Beranda</Text></TouchableOpacity>
         <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ManajemenKelas')}><Ionicons name="people-outline" size={24} color="#94a3b8" /><Text style={styles.navLabel}>Kelas</Text></TouchableOpacity>

         <TouchableOpacity style={styles.navItem}><Ionicons name="stats-chart" size={24} color={BLUE_PRIMARY} /><Text style={[styles.navLabel, { color: BLUE_PRIMARY }]}>Laporan</Text></TouchableOpacity>
         <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profil')}><Ionicons name="person-outline" size={24} color="#94a3b8" /><Text style={styles.navLabel}>Profil</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SOFT_BG },
  header: { height: 160, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden', elevation: 15, marginBottom: 15 },
  headerBg: { flex: 1, backgroundColor: BLUE_PRIMARY, paddingHorizontal: 25 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 50 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: WHITE },
  headerSubtitle: { fontSize: 10, color: BLUE_ACCENT, fontWeight: '800', letterSpacing: 1 },
  refreshBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  
  statsScroll: { paddingVertical: 10 },
  statCard: { backgroundColor: WHITE, padding: 16, borderRadius: 16, width: 150, marginRight: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  statLabel: { fontSize: 11, color: TEXT_MUTED, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: '900', color: BLUE_PRIMARY, marginBottom: 8 },
  statSubInfo: { fontSize: 10, color: ACCENT_GREEN, fontWeight: 'bold' },
  statSubInfoMuted: { fontSize: 10, color: TEXT_MUTED, fontWeight: '600' },

  tabsContainer: { borderBottomWidth: 1, borderBottomColor: BORDER_LIGHT, marginTop: 15 },
  tabBtn: { paddingVertical: 14, paddingHorizontal: 18, marginRight: 5 },
  tabBtnActive: { borderBottomWidth: 3, borderBottomColor: BLUE_PRIMARY },
  tabText: { fontSize: 13, color: TEXT_MUTED, fontWeight: '700' },
  tabTextActive: { color: BLUE_PRIMARY },

  mainCard: { backgroundColor: WHITE, margin: 20, borderRadius: 20, paddingVertical: 20, elevation: 5, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: SOFT_BG, marginHorizontal: 20, borderRadius: 12, paddingHorizontal: 5, marginBottom: 15 },
  searchInput: { flex: 1, color: TEXT_MAIN, padding: 12, fontSize: 13, fontWeight: '500' },
  
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: BORDER_LIGHT, paddingBottom: 12, paddingHorizontal: 20 },
  thText: { color: TEXT_MUTED, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  tableRowList: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: SOFT_BG, paddingVertical: 16, paddingHorizontal: 20, alignItems: 'center' },
  cellText: { color: TEXT_MAIN, fontSize: 12, fontWeight: '500' },
  cellBold: { fontWeight: '800', color: BLUE_PRIMARY },
  
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },

  sendBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: BLUE_PRIMARY, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 5 },
  sendBtnText: { color: WHITE, fontSize: 10, fontWeight: 'bold' },

  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, backgroundColor: WHITE, flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 30, borderTopLeftRadius: 35, borderTopRightRadius: 35, elevation: 40, alignItems: 'center' },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navLabel: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', marginTop: 4 },
  navItemMain: { marginTop: -50 },
  navMainInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: BLUE_PRIMARY, justifyContent: 'center', alignItems: 'center', borderWidth: 6, borderColor: WHITE, elevation: 15 },
});
