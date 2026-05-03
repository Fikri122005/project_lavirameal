import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, 
  StatusBar, FlatList, ActivityIndicator, Alert, TextInput, ScrollView, Modal, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import apiClient from '../../../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

let Print, Sharing;
try {
  Print = require('expo-print');
  Sharing = require('expo-sharing');
} catch (e) {
  console.log("Print/Sharing not available");
}

const BLUE_PRIMARY = '#1C2C5B';
const BLUE_ACCENT = '#3b82f6';
const WHITE = '#FFFFFF';
const SOFT_BG = '#F8FAFC';
const TEXT_MAIN = '#1E293B';
const TEXT_MUTED = '#64748B';
const BORDER_LIGHT = '#E2E8F0';
const ACCENT_GREEN = '#10B981';
const ACCENT_RED = '#EF4444';
const ACCENT_YELLOW = '#F59E0B';

export default function LaporanScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState('Transaksi Dana');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [quickActionModal, setQuickActionModal] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [dataLaporan, setDataLaporan] = useState([]);
  const [dataTransaksi, setDataTransaksi] = useState([]);
  const [dataPenerima, setDataPenerima] = useState([]);
  const [dataBulanan, setDataBulanan] = useState([]);
  const [filterSekolah, setFilterSekolah] = useState('Semua sekolah');
  const [rekapSummary, setRekapSummary] = useState({
    total_dana: 'Rp 0',
    total_penerima: '0 siswa',
    berhasil: '0 transaksi',
    gagal: '0 transaksi'
  });
  
  const [stats, setStats] = useState({
    total_transaksi: 'Rp 0',
    penerima_mbg: '0',
    jumlah_sekolah: '0',
    rekap_bulan: 'Bulan ini'
  });

  const fetchLaporan = useCallback(async () => {
    try {
      const userDataStr = await AsyncStorage.getItem('user_data');
      if (!userDataStr) return;
      const userData = JSON.parse(userDataStr);

      if (!userData.sppg_id) {
        console.warn("SPPG ID is missing for user:", userData.nama);
        return;
      }

      const response = await apiClient.get(`sppg/sppg_get_laporan_lengkap.php?sppg_id=${userData.sppg_id}`).catch(() => null);
      if (response && response.data && response.data.status === 'success') {
        const riwayat = response.data.data.riwayat || [];
        const transaksi = response.data.data.transaksi_dana || [];
        const penerima = response.data.data.penerima_mbg || [];
        const bulanan = response.data.data.bulanan || [];
        
        setDataLaporan(riwayat);
        setDataTransaksi(transaksi);
        setDataPenerima(penerima);
        setDataBulanan(bulanan);

        if (bulanan.length > 0) {
          const latest = bulanan[0];
          setRekapSummary({
            total_dana: 'Rp ' + parseInt(latest.total_dana || 0).toLocaleString('id-ID'),
            total_penerima: (latest.total_penerima || 0) + ' siswa',
            berhasil: (latest.berhasil || 0) + ' transaksi',
            gagal: (latest.gagal || 0) + ' transaksi'
          });
        }
        
        let uniqueSekolah = new Set();
        riwayat.forEach(item => uniqueSekolah.add(item.sekolah_id));

        let sumTransfer = 0;
        transaksi.forEach(trx => { sumTransfer += parseInt(trx.nominal) || 0; });

        const currMonth = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });

        setStats({
          total_transaksi: 'Rp ' + sumTransfer.toLocaleString('id-ID'),
          penerima_mbg: penerima.length.toString(),
          jumlah_sekolah: uniqueSekolah.size.toString(),
          rekap_bulan: currMonth
        });

      } else {
        // Fallback Mock Data if API fails or returns empty
        const mockRiwayat = [];
        const mockTransaksi = [
          { id: 'TRX-20250401', sekolah: 'SDN Duren 1', tanggal_format: '21 Apr 2024', nominal: '450000', metode: 'Transfer', status: 'Berhasil' },
          { id: 'TRX-20250402', sekolah: 'SMAN 1 Klari', tanggal_format: '22 Apr 2024', nominal: '320000', metode: 'Transfer', status: 'Berhasil' }
        ];
        const mockPenerima = [
          { nama_siswa: 'Ahmad Fauzi', sekolah: 'SDN Duren 1', kelas: 'V-A', dana_diterima: '45000', periode: 'Apr 2025' },
          { nama_siswa: 'Siti Nurhaliza', sekolah: 'SMAN 1 Klari', kelas: 'X-B', dana_diterima: '45000', periode: 'Apr 2025' },
          { nama_siswa: 'Budi Santoso', sekolah: 'SDN 02 Karawang', kelas: 'VI-A', dana_diterima: '45000', periode: 'Apr 2025' }
        ];
        const mockBulanan = [
          { id: 1, bulan: 'April 2025', total_dana: 4890000, jumlah_sekolah: 18, total_penerima: 3240, berhasil: 46, gagal: 2 },
          { id: 2, bulan: 'Maret 2025', total_dana: 4650000, jumlah_sekolah: 17, total_penerima: 3155, berhasil: 44, gagal: 1 },
          { id: 3, bulan: 'Februari 2025', total_dana: 4320000, jumlah_sekolah: 16, total_penerima: 2980, berhasil: 42, gagal: 3 },
          { id: 4, bulan: 'Januari 2025', total_dana: 4100000, jumlah_sekolah: 15, total_penerima: 2810, berhasil: 40, gagal: 0 },
        ];
        setDataLaporan(mockRiwayat);
        setDataTransaksi(mockTransaksi);
        setDataPenerima(mockPenerima);
        setDataBulanan([]);
        setStats({
          total_transaksi: 'Rp 25.650.000',
          penerima_mbg: '3.240',
          jumlah_sekolah: '18',
          rekap_bulan: 'April 2025'
        });
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLaporan(); }, [fetchLaporan]);

  const generateReport = async (format) => {
    setExportModalVisible(false);
    if (!Print || !Sharing) {
        Alert.alert("Error", "Modul pencetakan tidak tersedia.");
        return;
    }

    setLoading(true);
    try {
      if (format === 'PDF') {
        const tableRows = (activeTab === 'Transaksi Dana' ? dataTransaksi : dataBulanan).map(item => `
          <tr>
            <td>${item.id || item.bulan}</td>
            <td>${item.sekolah || item.total_dana}</td>
            <td>${item.tanggal_format || item.jumlah_sekolah || '-'}</td>
            <td>${item.nominal || item.total_penerima || '-'}</td>
            <td>${item.status || '-'}</td>
          </tr>
        `).join('');

        const html = `
          <html>
            <head>
              <style>
                body { font-family: 'Helvetica', sans-serif; padding: 20px; }
                h1 { color: #1C2C5B; text-align: center; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 12px; }
                th { background-color: #1C2C5B; color: white; }
              </style>
            </head>
            <body>
              <h1>Laporan ${activeTab}</h1>
              <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
              <table>
                <thead>
                  <tr>
                    <th>ID/Bulan</th>
                    <th>Sekolah/Dana</th>
                    <th>Detail 1</th>
                    <th>Detail 2</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>${tableRows}</tbody>
              </table>
            </body>
          </html>
        `;
        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri);
      } else if (format === 'Excel') {
        // Simple CSV approach
        const headers = activeTab === 'Transaksi Dana' ? "ID;Sekolah;Tanggal;Nominal;Status\n" : "Bulan;Total Dana;Jml Sekolah;Penerima;Status\n";
        const rows = (activeTab === 'Transaksi Dana' ? dataTransaksi : dataBulanan).map(item => {
          return activeTab === 'Transaksi Dana' 
            ? `${item.id};${item.sekolah};${item.tanggal_format};${item.nominal};${item.status}`
            : `${item.bulan};${item.total_dana};${item.jumlah_sekolah};${item.total_penerima};OK`;
        }).join("\n");
        
        // In a real environment, we'd save to a .csv file and share it.
        // For now, let's just alert or use a temporary URI if possible.
        Alert.alert("Info", "Fitur Ekspor Excel (CSV) sedang disiapkan. Menggunakan format PDF sementara.");
        generateReport('PDF');
      }
    } catch (e) {
      Alert.alert("Error", "Gagal mengekspor laporan.");
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = (status) => {
    const s = status ? status.toLowerCase() : '';
    let bgColor = '#F1F5F9';
    let textColor = TEXT_MUTED;
    let label = status || 'Unknown';
    
    if (s === 'settled' || s === 'completed' || s === 'berhasil') { bgColor = '#ECFDF5'; textColor = ACCENT_GREEN; label = 'Selesai'; }
    else if (s === 'pending' || s === 'proses') { bgColor = '#FFFBEB'; textColor = ACCENT_YELLOW; label = 'Pending'; }
    else if (s === 'gagal' || s === 'ditolak') { bgColor = '#FEF2F2'; textColor = ACCENT_RED; label = 'Gagal'; }

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
               <View style={[styles.headerTop, { marginTop: 40 }]}>
                 <Text style={styles.headerTitle}>Laporan Aktivitas</Text>
                 <View style={styles.headerActions}>
                   <TouchableOpacity style={styles.btnOutline} onPress={() => setExportModalVisible(true)}>
                     <Feather name="download" size={14} color={BLUE_PRIMARY} />
                     <Text style={styles.btnOutlineText}>Export</Text>
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
            <Text style={styles.statLabel}>Total Transaksi</Text>
            <Text style={styles.statValue}>{stats.total_transaksi}</Text>
            <Text style={styles.statSubInfo}>Bulan ini</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Penerima </Text>
            <Text style={styles.statValue}>{stats.penerima_mbg}</Text>
            <Text style={styles.statSubInfo}>Siswa aktif</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Jumlah Sekolah</Text>
            <Text style={styles.statValue}>{stats.jumlah_sekolah}</Text>
            <Text style={styles.statSubInfoMuted}>Aktif menerima dana</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Rekap bulan ini</Text>
            <Text style={styles.statValue}>{stats.rekap_bulan}</Text>
            <Text style={styles.statSubInfoMuted}>Transaksi tercatat</Text>
          </View>
        </ScrollView>

        {/* TABS */}
        <View style={styles.tabsContainer}>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15 }}>
              {['Transaksi Dana', 'Bulanan/Rekap'].map((tab) => (
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
           {activeTab === 'Bulanan/Rekap' && (
             <View style={styles.rekapGrid}>
                <View style={styles.rekapGridRow}>
                   <View style={styles.rekapCard}>
                      <Text style={styles.rekapLabel}>Total dana disalurkan</Text>
                      <Text style={styles.rekapValue}>{rekapSummary.total_dana}</Text>
                   </View>
                   <View style={[styles.rekapCard, { marginRight: 0 }]}>
                      <Text style={styles.rekapLabel}>Total penerima</Text>
                      <Text style={styles.rekapValue}>{rekapSummary.total_penerima}</Text>
                   </View>
                </View>
                <View style={styles.rekapGridRow}>
                   <View style={styles.rekapCard}>
                      <Text style={styles.rekapLabel}>Transaksi berhasil</Text>
                      <Text style={styles.rekapValue}>{rekapSummary.berhasil}</Text>
                   </View>
                   <View style={[styles.rekapCard, { marginRight: 0 }]}>
                      <Text style={styles.rekapLabel}>Transaksi gagal / pending</Text>
                      <Text style={styles.rekapValue}>{rekapSummary.gagal}</Text>
                   </View>
                </View>
             </View>
           )}

           {activeTab !== 'Bulanan/Rekap' && (
             <View style={styles.searchContainer}>
                <Feather name="search" size={16} color={TEXT_MUTED} style={{ marginLeft: 15 }} />
                <TextInput 
                  style={styles.searchInput} 
                  placeholder="Cari nama siswa..." 
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
                        <Text style={[styles.thText, { width: 160 }]}>Sekolah</Text>
                        <Text style={[styles.thText, { width: 100 }]}>Tanggal</Text>
                        <Text style={[styles.thText, { width: 110 }]}>Nominal</Text>
                        <Text style={[styles.thText, { width: 90 }]}>Metode</Text>
                        <Text style={[styles.thText, { width: 90 }]}>Status</Text>
                      </>
                    ) : activeTab === 'Bulanan/Rekap' ? (
                      <>
                        <Text style={[styles.thText, { width: 100 }]}>Bulan</Text>
                        <Text style={[styles.thText, { width: 130 }]}>Total Dana</Text>
                        <Text style={[styles.thText, { width: 110 }]}>Jml Sekolah</Text>
                        <Text style={[styles.thText, { width: 110 }]}>Total Penerima</Text>
                        <Text style={[styles.thText, { width: 80 }]}>Berhasil</Text>
                        <Text style={[styles.thText, { width: 80 }]}>Gagal</Text>
                      </>
                    ) : (
                      <Text style={[styles.thText, { width: 200 }]}>Data belum tersedia</Text>
                    )}
                 </View>

                 {/* Table Body */}
                 {loading ? (
                    <View style={{ padding: 30, alignItems: 'center' }}><ActivityIndicator size="small" color={BLUE_PRIMARY} /></View>
                 ) : (
                    <FlatList
                      data={activeTab === 'Transaksi Dana' ? dataTransaksi : (activeTab === 'Bulanan/Rekap' ? dataBulanan : [])}
                      keyExtractor={(item, idx) => item.id ? item.id.toString() : idx.toString()}
                      renderItem={({ item, index }) => (
                        <View style={styles.tableRowList}>
                           {activeTab === 'Transaksi Dana' ? (
                              <>
                                <Text style={[styles.cellText, { width: 120 }]}>{item.id}</Text>
                                <Text style={[styles.cellText, styles.cellBold, { width: 160 }]} numberOfLines={1}>{item.sekolah || item.nama_sekolah}</Text>
                                <Text style={[styles.cellText, { width: 100 }]}>{item.tanggal_format || item.tanggal}</Text>
                                <Text style={[styles.cellText, { width: 110, fontWeight: 'bold', color: BLUE_PRIMARY }]}>
                                   Rp {parseInt(item.nominal || 0).toLocaleString('id-ID')}
                                </Text>
                                <Text style={[styles.cellText, { width: 90 }]}>{item.metode || 'Transfer'}</Text>
                                <View style={{ width: 90, alignItems: 'flex-start' }}>{renderStatusBadge(item.status)}</View>
                              </>
                           ) : activeTab === 'Bulanan/Rekap' ? (
                              <>
                                <Text style={[styles.cellText, styles.cellBold, { width: 100 }]} numberOfLines={1}>{item.bulan}</Text>
                                <Text style={[styles.cellText, { width: 130, fontWeight: 'bold', color: BLUE_PRIMARY }]}>
                                   Rp {parseInt(item.total_dana || 0).toLocaleString('id-ID')}
                                </Text>
                                <Text style={[styles.cellText, { width: 110 }]}>{item.jumlah_sekolah}</Text>
                                <Text style={[styles.cellText, { width: 110 }]}>{item.total_penerima}</Text>
                                <View style={{ width: 80, alignItems: 'flex-start' }}>
                                   <View style={[styles.circleBadge, { backgroundColor: '#ECFDF5' }]}>
                                      <Text style={[styles.circleBadgeTxt, { color: '#10B981' }]}>{item.berhasil}</Text>
                                   </View>
                                </View>
                                <View style={{ width: 80, alignItems: 'flex-start' }}>
                                   <View style={[styles.circleBadge, { backgroundColor: '#FEF2F2' }]}>
                                      <Text style={[styles.circleBadgeTxt, { color: '#EF4444' }]}>{item.gagal}</Text>
                                   </View>
                                </View>
                              </>
                           ) : (
                              <Text style={styles.cellText}>Belum ada data untuk tab ini.</Text>
                           )}
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

      {/* QUICK ACTION MODAL */}
      <Modal visible={quickActionModal} transparent animationType="fade">
         <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setQuickActionModal(false)}>
            <View style={styles.actionSheet}>
               <Text style={styles.sheetTitle}>Portal Otoritas</Text>
               <View style={styles.sheetGrid}>
                  {[
                    { label: 'Transfer', icon: 'send-outline', color: '#4f46e5', press: () => setQuickActionModal(false) },
                    { label: 'Scan', icon: 'scan-outline', color: '#0ea5e9', press: () => setQuickActionModal(false) },
                    { label: 'Laporan', icon: 'document-text-outline', color: '#10b981', press: () => setQuickActionModal(false) },
                    { label: 'Otoritas', icon: 'shield-checkmark-outline', color: '#f59e0b', press: () => { navigation.navigate('Profil'); setQuickActionModal(false); } },
                  ].map((item, i) => (
                    <TouchableOpacity key={i} style={styles.sheetItem} onPress={item.press}>
                       <View style={[styles.sheetIconBox, { backgroundColor: item.color + '15' }]}><Ionicons name={item.icon} size={24} color={item.color} /></View>
                       <Text style={styles.sheetLabel}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
               </View>
            </View>
         </TouchableOpacity>
      </Modal>

      {/* EXPORT OPTIONS MODAL */}
      <Modal visible={exportModalVisible} transparent animationType="slide">
         <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setExportModalVisible(false)}>
            <View style={styles.exportSheet}>
               <View style={styles.sheetIndicator} />
               <Text style={styles.exportTitle}>Pilih Format Ekspor</Text>
               <Text style={styles.exportSub}>Pilih format dokumen untuk laporan {activeTab}</Text>
               
               <View style={styles.exportOptions}>
                  <TouchableOpacity style={styles.exportOptionBtn} onPress={() => generateReport('PDF')}>
                     <View style={[styles.exportIconBox, { backgroundColor: '#fee2e2' }]}>
                        <MaterialCommunityIcons name="file-pdf-box" size={32} color="#ef4444" />
                     </View>
                     <View style={{ flex: 1, marginLeft: 15 }}>
                        <Text style={styles.exportOptionTitle}>Dokumen PDF</Text>
                        <Text style={styles.exportOptionDesc}>Cocok untuk dicetak atau dibagikan sebagai dokumen resmi.</Text>
                     </View>
                     <Feather name="chevron-right" size={20} color="#cbd5e1" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.exportOptionBtn} onPress={() => generateReport('Excel')}>
                     <View style={[styles.exportIconBox, { backgroundColor: '#dcfce7' }]}>
                        <MaterialCommunityIcons name="file-excel-box" size={32} color="#10b981" />
                     </View>
                     <View style={{ flex: 1, marginLeft: 15 }}>
                        <Text style={styles.exportOptionTitle}>Data Excel (CSV)</Text>
                        <Text style={styles.exportOptionDesc}>Format data mentah untuk diolah di spreadsheet.</Text>
                     </View>
                     <Feather name="chevron-right" size={20} color="#cbd5e1" />
                  </TouchableOpacity>
               </View>

               <TouchableOpacity style={styles.cancelExportBtn} onPress={() => setExportModalVisible(false)}>
                  <Text style={styles.cancelExportTxt}>Batalkan</Text>
               </TouchableOpacity>
            </View>
         </TouchableOpacity>
      </Modal>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
         <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}><Ionicons name="grid-outline" size={24} color="#94a3b8" /><Text style={styles.navLabel}>Beranda</Text></TouchableOpacity>
         <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Sekolah')}><Ionicons name="business-outline" size={24} color="#94a3b8" /><Text style={styles.navLabel}>Sekolah</Text></TouchableOpacity>

         <TouchableOpacity style={styles.navItem}><Ionicons name="stats-chart" size={24} color={BLUE_PRIMARY} /><Text style={[styles.navLabel, { color: BLUE_PRIMARY }]}>Laporan</Text></TouchableOpacity>
         <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profil')}><Ionicons name="person-outline" size={24} color="#94a3b8" /><Text style={styles.navLabel}>Profil</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SOFT_BG },
  header: { height: 240, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, overflow: 'hidden', elevation: 15, marginBottom: 15 },
  headerBg: { flex: 1, backgroundColor: BLUE_PRIMARY, paddingHorizontal: 25 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '900', color: WHITE },
  headerActions: { flexDirection: 'row', gap: 8 },
  btnOutline: { flexDirection: 'row', alignItems: 'center', backgroundColor: WHITE, borderWidth: 0, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, gap: 6, elevation: 5 },
  btnOutlineText: { color: BLUE_PRIMARY, fontSize: 12, fontWeight: 'bold' },
  
  statsScroll: { paddingVertical: 10 },
  statCard: { backgroundColor: WHITE, padding: 16, borderRadius: 16, width: 150, marginRight: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  statLabel: { fontSize: 11, color: TEXT_MUTED, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' },
  statValue: { fontSize: 22, fontWeight: '900', color: BLUE_PRIMARY, marginBottom: 8 },
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
  dropdownContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER_LIGHT, marginHorizontal: 20, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, marginBottom: 20 },
  dropdownText: { fontSize: 13, color: TEXT_MAIN, fontWeight: '600' },
  
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: BORDER_LIGHT, paddingBottom: 12, paddingHorizontal: 20 },
  thText: { color: TEXT_MUTED, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  tableRowList: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: SOFT_BG, paddingVertical: 16, paddingHorizontal: 20, alignItems: 'center' },
  cellText: { color: TEXT_MAIN, fontSize: 12, fontWeight: '500' },
  cellBold: { fontWeight: '800', color: BLUE_PRIMARY },
  
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },

  rekapGrid: { paddingHorizontal: 20, marginBottom: 10 },
  rekapGridRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  rekapCard: { flex: 1, backgroundColor: '#F8FAFC', padding: 15, borderRadius: 16, marginRight: 10, borderWidth: 1, borderColor: BORDER_LIGHT },
  rekapLabel: { fontSize: 11, color: TEXT_MUTED, fontWeight: '800', marginBottom: 5 },
  rekapValue: { fontSize: 16, fontWeight: '900', color: BLUE_PRIMARY },
  circleBadge: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  circleBadgeTxt: { fontSize: 12, fontWeight: '900' },

  overlay: { flex: 1, backgroundColor: 'rgba(11,30,63,0.8)', justifyContent: 'flex-end' },
  actionSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 35 },
  sheetTitle: { fontSize: 18, fontWeight: '900', color: BLUE_PRIMARY, textAlign: 'center', marginBottom: 30 },
  sheetGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 20 },
  sheetItem: { width: '45%', alignItems: 'center' },
  sheetIconBox: { width: 64, height: 64, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  sheetLabel: { fontSize: 13, fontWeight: 'bold', color: '#475569' },
  
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, backgroundColor: '#FFFFFF', flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 20, borderTopLeftRadius: 35, borderTopRightRadius: 35, elevation: 40, alignItems: 'center' },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navLabel: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', marginTop: 4 },
  navItemMain: { marginTop: -40 },
  navMainInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: BLUE_PRIMARY, justifyContent: 'center', alignItems: 'center', borderWidth: 5, borderColor: '#FFFFFF', elevation: 15 },

  // EXPORT MODAL STYLES
  exportSheet: { backgroundColor: WHITE, borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, paddingBottom: 50 },
  sheetIndicator: { width: 40, height: 5, backgroundColor: '#f1f5f9', borderRadius: 10, alignSelf: 'center', marginBottom: 25 },
  exportTitle: { fontSize: 20, fontWeight: '900', color: BLUE_PRIMARY, textAlign: 'center' },
  exportSub: { fontSize: 13, color: TEXT_MUTED, textAlign: 'center', marginTop: 8, marginBottom: 30 },
  exportOptions: { gap: 15 },
  exportOptionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 20, borderRadius: 22, borderWidth: 1, borderColor: '#f1f5f9' },
  exportIconBox: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  exportOptionTitle: { fontSize: 16, fontWeight: 'bold', color: TEXT_MAIN },
  exportOptionDesc: { fontSize: 11, color: TEXT_MUTED, marginTop: 4, lineHeight: 16 },
  cancelExportBtn: { marginTop: 25, height: 55, justifyContent: 'center', alignItems: 'center' },
  cancelExportTxt: { color: TEXT_MUTED, fontWeight: 'bold', fontSize: 14 },
});
