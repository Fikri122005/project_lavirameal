import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Share,
  useWindowDimensions,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../../../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart } from 'react-native-chart-kit';
import QRCode from 'react-native-qrcode-svg';

const BLUE_PRIMARY = '#0B1E3F';
const BLUE_DARK = '#0F172A';
const GOLD = '#D4AF37';
const WHITE = '#FFFFFF';
const SUCCESS = '#10B981';
const DANGER = '#F43F5E';
const ACCENT = '#38BDF8';
const WARNING = '#F59E0B';

export default function HomeScreenSekolah({ navigation }) {
  const { width } = useWindowDimensions();
  const [stats, setStats] = useState({
    total_siswa: 0,
    saldo: 0,
    pengambilan_hari_ini: 0,
    status_distribusi: 'Menunggu',
    chart_data: { labels: ["Sen", "Sel", "Rab", "Kam", "Jum"], values: [0, 0, 0, 0, 0] },
    menus: [],
    dana_kaget: null
  });
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);
  
  // Modals
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDanaKagetModal, setShowDanaKagetModal] = useState(false);
  const [showRiwayatModal, setShowRiwayatModal] = useState(false);
  const [quickActionModal, setQuickActionModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [riwayat, setRiwayat] = useState([]);
  const [classList, setClassList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  
  // Transaction Flow
  const [amount, setAmount] = useState('');
  const [qrData, setQrData] = useState(null);
  
  // Dana Kaget Flow
  const [danaAmount, setDanaAmount] = useState('');
  const [danaQuota, setDanaQuota] = useState('');
  const [isCreatingDana, setIsCreatingDana] = useState(false);
  const [newDanaLink, setNewDanaLink] = useState(null);

  const fetchStats = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user_data');
      if (!storedUser) {
        setLoading(false);
        return;
      }
      const parsedUser = JSON.parse(storedUser);
      setUserData(parsedUser);
      
      const response = await apiClient.get(`sekolah/sekolah_get_stats.php?sekolah_id=${parsedUser.sekolah_id}`);
      if (response.data && response.data.status === 'success') {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRiwayat = async () => {
    if (!userData) return;
    try {
      const response = await apiClient.get(`sekolah/sekolah_get_riwayat.php?sekolah_id=${userData.sekolah_id}`);
      if (response.data && response.data.status === 'success') {
        const data = response.data.data;
        setRiwayat(data);
        
        // Check for unread
        if (data.length > 0) {
          const latestId = data[0].id.toString();
          const lastSeenId = await AsyncStorage.getItem('last_seen_log_id');
          if (latestId !== lastSeenId) {
            setHasUnread(true);
          } else {
            setHasUnread(false);
          }
        }
      }
    } catch (error) {
      console.error("Error riwayat:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchStats();
      // Also fetch riwayat to check unread status
      const checkUnread = async () => {
        const storedUser = await AsyncStorage.getItem('user_data');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const response = await apiClient.get(`sekolah/sekolah_get_riwayat.php?sekolah_id=${parsedUser.sekolah_id}`);
          if (response.data && response.data.status === 'success' && response.data.data.length > 0) {
            const latestId = response.data.data[0].id.toString();
            const lastSeenId = await AsyncStorage.getItem('last_seen_log_id');
            setHasUnread(latestId !== lastSeenId);
          }
        }
      };
      checkUnread();
      
      const interval = setInterval(() => {
        fetchStats();
        checkUnread();
      }, 15000);
      return () => clearInterval(interval);
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats().then(() => setRefreshing(false));
  };

  const handleRequestSaldo = async () => {
    if (!userData) return;
    if (!amount || parseInt(amount) < 10000) {
      Alert.alert("Error", "Minimal request adalah Rp 10.000");
      return;
    }
    
    try {
      await apiClient.post('sekolah/sekolah_log_activity.php', {
        sekolah_id: userData.sekolah_id,
        amount: parseInt(amount)
      });
      setQrData(`LAVIRA-TOPUP-${userData.sekolah_id}-${Date.now()}-${amount}`);
    } catch (error) {
      console.error("Log error:", error);
    }
  };

  const handleCreateDanaKaget = async () => {
    if (!userData) return;
    if (!danaAmount || !danaQuota) {
      Alert.alert("Error", "Mohon lengkapi nominal dan kuota");
      return;
    }
    
    setIsCreatingDana(true);
    try {
      const resp = await apiClient.post('sekolah/sekolah_create_dana_kaget.php', {
        sekolah_id: userData.sekolah_id,
        amount: parseInt(danaAmount),
        quota: parseInt(danaQuota)
      });
      
      if (resp.data.status === 'success') {
        setNewDanaLink(resp.data.data.share_link);
        fetchStats();
      }
    } catch (error) {
      Alert.alert("Gagal", "Gagal membuat Dana Kaget.");
    } finally {
      setIsCreatingDana(false);
    }
  };

  const handleApproveMenu = async (menuId, status) => {
    try {
      const resp = await apiClient.post('sekolah/sekolah_approve_menu.php', {
        menu_id: menuId,
        status: status
      });
      if (resp.data.status === 'success') {
        Alert.alert("Berhasil", "Status menu telah diperbarui.");
        fetchStats();
      }
    } catch (error) {
      Alert.alert("Error", "Gagal memperbarui status menu.");
    }
  };

  const handleShareLink = async (link) => {
    try {
      await Share.share({
        message: `Halo Siswa! Klaim Dana Kaget LAVIRA kamu di sini: ${link}`,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const fetchClasses = async () => {
    if (!userData) return;
    try {
      const response = await apiClient.get(`sekolah/sekolah_get_kelas.php?sekolah_id=${userData.sekolah_id}`);
      if (response.data && response.data.status === 'success') {
        setClassList(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const handleTransferDanaKelas = async () => {
    if (!userData || !selectedKelas || !transferAmount) {
      Alert.alert("Error", "Mohon pilih kelas dan isi nominal transfer");
      return;
    }

    setIsTransferring(true);
    try {
      const response = await apiClient.post('sekolah/sekolah_transfer_dana_kelas.php', {
        sekolah_id: userData.sekolah_id,
        kelas: selectedKelas,
        amount: parseInt(transferAmount)
      });

      if (response.data.status === 'success') {
        Alert.alert("Berhasil", response.data.message);
        setShowTransferModal(false);
        setTransferAmount('');
        setSelectedKelas('');
        fetchStats();
      }
    } catch (error) {
      Alert.alert("Gagal", error.response?.data?.message || "Gagal melakukan transfer dana kelas.");
    } finally {
      setIsTransferring(false);
    }
  };

  const formatIDR = (val) => `Rp ${parseInt(val).toLocaleString('id-ID')}`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[BLUE_PRIMARY]} />}
      >
        {/* HEADER */}
        <View style={styles.headerSection}>
          <Image
            source={require('../../../../assets/batik_cirebon.png')}
            style={[StyleSheet.absoluteFillObject, { opacity: 0.12, resizeMode: 'repeat' }]}
          />
          <SafeAreaView>
            <View style={styles.headerTop}>
              <View style={styles.userInfo}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>{userData?.nama?.charAt(0) || 'A'}</Text>
                </View>
                <View>
                  <Text style={styles.welcomeText}>DASHBOARD SEKOLAH</Text>
                  <Text style={styles.roleText}>{userData?.nama || 'Admin'}</Text>
                  <Text style={styles.schoolSubText}>{userData?.nama_sekolah || 'LAVIRA'}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.notificationBtn} 
                onPress={async () => {
                  if (riwayat.length > 0) {
                    await AsyncStorage.setItem('last_seen_log_id', riwayat[0].id.toString());
                    setHasUnread(false);
                  }
                  navigation.navigate('RiwayatSekolah');
                }}
              >
                <Feather name="bell" size={20} color="#fff" />
                {hasUnread && <View style={styles.ping} />}
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.contentBody}>
          {/* SALDO CARD */}
          <View style={styles.walletCard}>
            <View style={styles.walletHeader}>
              <View>
                <Text style={styles.walletLabel}>Saldo Operasional</Text>
                <Text style={styles.walletValue}>{formatIDR(stats.saldo)}</Text>
              </View>
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: stats.status_distribusi === 'Berlangsung' ? SUCCESS : GOLD }]} />
                <Text style={styles.statusText}>{stats.status_distribusi}</Text>
              </View>
            </View>
            
            <View style={styles.walletActions}>

              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: '#FDF2F8' }]}
                onPress={() => navigation.navigate('RiwayatSekolah')}
              >
                <Ionicons name="time-outline" size={20} color={DANGER} />
                <Text style={[styles.actionBtnText, { color: DANGER }]}>Riwayat</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* DANA KAGET ACTIVE INDICATOR */}


          {/* MAIN STATS */}
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: '#F0FDF4' }]}>
              <Text style={styles.statLabelSmall}>Siswa</Text>
              <Text style={styles.statValueLarge}>{stats.total_siswa}</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', minHeight: 110 }]}>
              <View style={[
                { paddingHorizontal: 15, paddingVertical: 6, borderRadius: 30, marginBottom: 8, elevation: 2, shadowOpacity: 0.1, shadowRadius: 4 },
                { backgroundColor: (new Date().getDay() >= 1 && new Date().getDay() <= 5) ? '#DCFCE7' : '#FEE2E2' }
              ]}>
                <Text style={{ fontSize: 10, fontWeight: '900', color: (new Date().getDay() >= 1 && new Date().getDay() <= 5) ? SUCCESS : DANGER, letterSpacing: 1.2 }}>
                  {(new Date().getDay() >= 1 && new Date().getDay() <= 5) ? '● AKTIF' : '● OFF'}
                </Text>
              </View>
              <Text style={[styles.statValueLarge, { fontSize: 26, marginVertical: 0 }]}>{stats.pengambilan_hari_ini}</Text>
              <Text style={{ fontSize: 8, color: '#94A3B8', fontWeight: 'bold', marginTop: 4, letterSpacing: 0.5 }}>HARI INI</Text>
            </View>
          </View>

          {/* CHART */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Monitoring Pengambilan</Text>
            <Text style={[styles.realtimeBadge, { color: (new Date().getDay() >= 1 && new Date().getDay() <= 5) ? SUCCESS : DANGER }]}>
              ● {(new Date().getDay() >= 1 && new Date().getDay() <= 5) ? 'Aktif' : 'Off'}
            </Text>
          </View>
          <View style={styles.chartWrapper}>
            <BarChart
              data={{
                labels: stats.chart_data.labels,
                datasets: [{ 
                  data: stats.chart_data.values,
                  colors: stats.chart_data.values.map((v) => {
                    const max = Math.max(...stats.chart_data.values);
                    const min = Math.min(...stats.chart_data.values);
                    
                    if (v === max && max !== min) return (opacity = 1) => `rgba(16, 185, 129, ${opacity})`; // Green
                    if (v === min) return (opacity = 1) => `rgba(244, 63, 94, ${opacity})`; // Red
                    return (opacity = 1) => `rgba(11, 30, 63, ${opacity})`; // Blue Primary
                  })
                }]
              }}
              width={width - 50}
              height={160}
              yAxisLabel=""
              chartConfig={{
                backgroundColor: WHITE,
                backgroundGradientFrom: WHITE,
                backgroundGradientTo: WHITE,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(11, 30, 63, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                fillShadowGradient: BLUE_PRIMARY,
                fillShadowGradientOpacity: 1,
                withCustomBarColorFromData: true,
              }}
              style={{ borderRadius: 16 }}
              showValuesOnTopOfBars
            />
          </View>


        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* REQUEST SALDO MODAL */}
      <Modal visible={showQRModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior="padding" style={styles.modalCentered}>
            <View style={styles.modalCard}>
              <View style={styles.modalCloseRow}>
                <TouchableOpacity onPress={() => { setShowQRModal(false); setQrData(null); setAmount(''); }}>
                  <Feather name="x" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>
              
              {!qrData ? (
                <>
                  <Text style={styles.modalHeaderTitle}>Minta Saldo Operasional</Text>
                  <Text style={styles.modalDesc}>Nominal akan dicatat dalam riwayat setelah kode QR dibuat.</Text>
                  <View style={styles.inputWrap}>
                    <Text style={styles.prefix}>Rp</Text>
                    <TextInput 
                      style={styles.tInput} 
                      placeholder="0" 
                      keyboardType="numeric" 
                      value={amount}
                      onChangeText={setAmount}
                    />
                  </View>
                  <TouchableOpacity style={styles.primaryBtn} onPress={handleRequestSaldo}>
                    <Text style={styles.primaryBtnText}>Generate Kode QR</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.qrTitle}>Tunjukkan ke Petugas SPPG</Text>
                  <View style={styles.qrBg}>
                    <QRCode value={qrData} size={180} color={BLUE_PRIMARY} />
                  </View>
                  <Text style={styles.qrAmount}>{formatIDR(amount)}</Text>
                  <Text style={styles.qrNote}>Riwayat segera diperbarui</Text>
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* DANA KAGET MODAL */}
      <Modal visible={showDanaKagetModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior="padding" style={styles.modalCentered}>
            <View style={styles.modalCard}>
              <View style={styles.modalCloseRow}>
                <Text style={styles.modalHeaderTitle}>Buat Dana Kaget</Text>
                <TouchableOpacity onPress={() => { setShowDanaKagetModal(false); setNewDanaLink(null); }}>
                  <Feather name="x" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>
              
              {!newDanaLink ? (
                <>
                  <Text style={styles.modalDesc}>Dana Kaget akan tersedia untuk semua siswa secara adil.</Text>
                  <Text style={styles.fieldLabel}>Nominal per Siswa</Text>
                  <View style={styles.inputWrap}>
                    <Text style={styles.prefix}>Rp</Text>
                    <TextInput 
                      style={styles.tInput} 
                      placeholder="Contoh: 10000" 
                      keyboardType="numeric" 
                      value={danaAmount}
                      onChangeText={setDanaAmount}
                    />
                  </View>

                  <Text style={styles.fieldLabel}>Kuota (Jumlah Siswa)</Text>
                  <View style={styles.inputWrap}>
                    <TextInput 
                      style={styles.tInput} 
                      placeholder="Contoh: 50" 
                      keyboardType="numeric" 
                      value={danaQuota}
                      onChangeText={setDanaQuota}
                    />
                  </View>

                  <TouchableOpacity 
                    style={[styles.primaryBtn, { backgroundColor: GOLD }]} 
                    onPress={handleCreateDanaKaget}
                    disabled={isCreatingDana}
                  >
                    {isCreatingDana ? <ActivityIndicator color={WHITE} /> : <Text style={styles.primaryBtnText}>Aktifkan Sekarang</Text>}
                  </TouchableOpacity>
                </>
              ) : (
                <View style={{ alignItems: 'center' }}>
                   <View style={styles.successIconWrap}>
                      <Ionicons name="checkmark-circle" size={60} color={SUCCESS} />
                   </View>
                   <Text style={[styles.modalHeaderTitle, { marginTop: 10 }]}>Berhasil Dibuat!</Text>
                   <Text style={[styles.modalDesc, { textAlign: 'center' }]}>Bagikan link di bawah ini agar siswa dapat mengklaim saldo.</Text>
                   
                   <View style={styles.linkContainer}>
                      <Text style={styles.linkText} numberOfLines={1}>{newDanaLink}</Text>
                   </View>
                   
                   <TouchableOpacity 
                    style={styles.shareBtn}
                    onPress={() => handleShareLink(newDanaLink)}
                   >
                     <Ionicons name="share-social" size={20} color={WHITE} />
                     <Text style={styles.shareBtnText}>Bagikan Link</Text>
                   </TouchableOpacity>
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* RIWAYAT MODAL */}
      <Modal visible={showRiwayatModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '80%' }]}>
            <View style={styles.modalCloseRow}>
              <Text style={styles.modalHeaderTitle}>Riwayat Aktivitas</Text>
              <TouchableOpacity onPress={() => setShowRiwayatModal(false)}>
                <Feather name="x" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
               {riwayat.length > 0 ? riwayat.map((item, idx) => (
                 <View key={idx} style={styles.historyItem}>
                    <View style={[styles.historyIcon, { backgroundColor: item.type === 'MINTA_SALDO' ? '#EEF2FF' : '#FFFBEB' }]}>
                       <Ionicons 
                         name={item.type === 'MINTA_SALDO' ? "wallet-outline" : "gift-outline"} 
                         size={20} 
                         color={item.type === 'MINTA_SALDO' ? BLUE_PRIMARY : GOLD} 
                       />
                    </View>
                    <View style={{ flex: 1 }}>
                       <Text style={styles.historyMessage}>{item.message}</Text>
                       <Text style={styles.historyDetail}>{item.detail}</Text>
                       <Text style={styles.historyTime}>{new Date(item.created_at).toLocaleString('id-ID')}</Text>
                    </View>
                 </View>
               )) : (
                 <View style={styles.emptyHistory}>
                   <Text style={styles.emptyText}>Belum ada riwayat aktivitas</Text>
                 </View>
               )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('HomeSekolah')}>
          <Ionicons name="grid" size={24} color={BLUE_PRIMARY} />
          <Text style={[styles.navLabel, { color: BLUE_PRIMARY, fontWeight: '800' }]}>Beranda</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ManajemenKelas')}>
          <Ionicons name="people-outline" size={24} color="#94A3B8" />
          <Text style={styles.navLabel}>Kelas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItemMain} onPress={() => setQuickActionModal(true)}>
           <View style={styles.navMainInner}><Ionicons name="swap-horizontal" size={28} color={WHITE} /></View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('LaporanSekolah')}>
          <Ionicons name="stats-chart-outline" size={24} color="#94A3B8" />
          <Text style={styles.navLabel}>Laporan</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profil')}>
          <Ionicons name="person-outline" size={24} color="#94A3B8" />
          <Text style={styles.navLabel}>Profil</Text>
        </TouchableOpacity>
      </View>

      {/* TRANSFER DANA KELAS MODAL */}
      <Modal visible={showTransferModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior="padding" style={styles.modalCentered}>
            <View style={styles.modalCard}>
              <View style={styles.modalCloseRow}>
                <Text style={styles.modalHeaderTitle}>Transfer Dana Kelas</Text>
                <TouchableOpacity onPress={() => { setShowTransferModal(false); setTransferAmount(''); setSelectedKelas(''); }}>
                  <Feather name="x" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDesc}>Saldo total yang Anda masukkan akan dibagi rata secara otomatis ke seluruh siswa di kelas yang dipilih.</Text>
              
              <Text style={styles.fieldLabel}>Pilih Kelas</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                {classList.map((item, idx) => (
                  <TouchableOpacity 
                    key={idx} 
                    style={[
                      styles.classSelector, 
                      selectedKelas === item.kelas && { backgroundColor: BLUE_PRIMARY, borderColor: BLUE_PRIMARY }
                    ]}
                    onPress={() => setSelectedKelas(item.kelas)}
                  >
                    <Text style={[styles.classSelectorText, selectedKelas === item.kelas && { color: WHITE }]}>
                      {item.kelas}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.fieldLabel}>Total Budget untuk Kelas</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.prefix}>Rp</Text>
                <TextInput 
                  style={styles.tInput} 
                  placeholder="Contoh: 35000" 
                  keyboardType="numeric" 
                  value={transferAmount}
                  onChangeText={setTransferAmount}
                />
              </View>

              <TouchableOpacity 
                style={[styles.primaryBtn, { backgroundColor: '#4f46e5' }]} 
                onPress={handleTransferDanaKelas}
                disabled={isTransferring}
              >
                {isTransferring ? <ActivityIndicator color={WHITE} /> : (
                  <>
                    <Text style={styles.primaryBtnText}>Transfer Sekarang</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
      {/* QUICK ACTION MODAL (Same as Profile) */}
      <Modal visible={quickActionModal} transparent animationType="fade">
         <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setQuickActionModal(false)}>
            <View style={styles.actionSheet}>
               <Text style={styles.sheetTitle}>Portal Administratif</Text>
               <View style={styles.sheetGrid}>
                  {[
                    { 
                      label: 'Transfer', 
                      icon: 'send-outline', 
                      color: '#4f46e5', 
                      press: () => { 
                        setQuickActionModal(false); 
                        fetchClasses(); 
                        setShowTransferModal(true); 
                      } 
                    },
                    { label: 'Guru', icon: 'school-outline', color: '#6366f1', press: () => { navigation.navigate('ManajemenGuru'); setQuickActionModal(false); } },
                    { label: 'Siswa', icon: 'people-outline', color: '#0ea5e9', press: () => { navigation.navigate('ManajemenKelas'); setQuickActionModal(false); } },
                    { label: 'Report', icon: 'stats-chart-outline', color: '#f59e0b', press: () => { navigation.navigate('LaporanSekolah'); setQuickActionModal(false); } },
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerSection: { backgroundColor: BLUE_PRIMARY, paddingHorizontal: 25, paddingTop: 50, paddingBottom: 60, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: WHITE },
  welcomeText: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '700', letterSpacing: 1 },
  roleText: { fontSize: 16, fontWeight: 'bold', color: WHITE },
  schoolSubText: { fontSize: 11, color: GOLD, fontWeight: '600', marginTop: 2 },
  notificationBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  ping: { position: 'absolute', top: 10, right: 10, width: 7, height: 7, borderRadius: 4, backgroundColor: DANGER, borderWidth: 1, borderColor: BLUE_PRIMARY },
  
  contentBody: { paddingHorizontal: 20, marginTop: -40 },
  
  walletCard: { backgroundColor: WHITE, borderRadius: 24, padding: 20, elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  walletHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  walletLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' },
  walletValue: { fontSize: 24, fontWeight: '800', color: BLUE_PRIMARY, marginTop: 4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 10, fontWeight: '700', color: '#64748B' },
  walletActions: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { flex: 1, height: 42, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 4 },
  actionBtnText: { fontSize: 11, fontWeight: '700', color: BLUE_PRIMARY, marginLeft: 6 },

  danaKagetBanner: { backgroundColor: '#FFFBEB', flexDirection: 'row', alignItems: 'center', marginTop: 15, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#FEF3C7', justifyContent: 'space-between' },
  danaKagetText: { fontSize: 11, fontWeight: '700', color: '#92400E', marginLeft: 8 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  statBox: { width: '48%', borderRadius: 20, padding: 16 },
  statLabelSmall: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  statValueLarge: { fontSize: 22, fontWeight: 'bold', color: BLUE_PRIMARY, marginVertical: 4 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25, marginBottom: 15 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: BLUE_DARK },
  realtimeBadge: { fontSize: 10, color: SUCCESS, fontWeight: '700' },
  subtitleCount: { fontSize: 11, color: WARNING, fontWeight: '700', backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },

  chartWrapper: { backgroundColor: WHITE, borderRadius: 24, padding: 12, elevation: 2 },
  
  menuScroll: { marginTop: 5 },
  menuCard: { width: 160, backgroundColor: WHITE, borderRadius: 18, marginRight: 12, padding: 10, elevation: 3, shadowOpacity: 0.05 },
  menuImg: { width: '100%', height: 100, borderRadius: 12, marginBottom: 8 },
  menuInfo: { paddingHorizontal: 2 },
  menuName: { fontSize: 12, fontWeight: '700', color: BLUE_DARK },
  kantinName: { fontSize: 10, color: '#94A3B8', marginTop: 1 },
  statusRowSmall: { flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 8 },
  statusMiniDot: { width: 4, height: 4, borderRadius: 2, marginRight: 4 },
  statusTextSmall: { fontSize: 9, fontWeight: '800' },
  approvalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  approveBtn: { backgroundColor: BLUE_PRIMARY, flex: 1, height: 28, borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  approveBtnText: { color: WHITE, fontSize: 10, fontWeight: 'bold' },
  rejectBtn: { width: 28, height: 28, borderRadius: 6, borderWidth: 1, borderColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },

  emptyMenu: { width: '100%', height: 120, justifyContent: 'center', alignItems: 'center', backgroundColor: WHITE, borderRadius: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1' },
  emptyText: { fontSize: 12, color: '#94A3B8', marginTop: 8 },

  // History Items
  historyItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  historyIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  historyMessage: { fontSize: 13, fontWeight: '700', color: BLUE_DARK },
  historyDetail: { fontSize: 12, color: '#64748B', marginTop: 3 },
  historyTime: { fontSize: 10, color: '#94A3B8', marginTop: 5 },
  emptyHistory: { alignItems: 'center', paddingVertical: 40 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(11, 30, 63, 0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCentered: { width: '100%' },
  modalCard: { backgroundColor: WHITE, borderRadius: 30, padding: 24, width: '100%' },
  modalCloseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalHeaderTitle: { fontSize: 18, fontWeight: '800', color: BLUE_PRIMARY },
  modalDesc: { fontSize: 13, color: '#64748B', lineHeight: 20, marginBottom: 20 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 8, marginTop: 10 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 14, paddingHorizontal: 15, height: 54, borderWidth: 1, borderColor: '#E2E8F0' },
  prefix: { fontSize: 16, fontWeight: 'bold', color: BLUE_PRIMARY, marginRight: 5 },
  tInput: { flex: 1, fontSize: 16, fontWeight: 'bold', color: BLUE_PRIMARY },
  primaryBtn: { backgroundColor: BLUE_PRIMARY, height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 25 },
  primaryBtnText: { color: WHITE, fontSize: 15, fontWeight: 'bold' },
  
  successIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center', alignSelf: 'center' },
  linkContainer: { backgroundColor: '#F1F5F9', padding: 15, borderRadius: 12, marginTop: 20, width: '100%' },
  linkText: { fontSize: 12, color: BLUE_PRIMARY, fontWeight: '600' },
  shareBtn: { backgroundColor: ACCENT, width: '100%', height: 54, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  shareBtnText: { color: WHITE, fontSize: 15, fontWeight: 'bold', marginLeft: 10 },

  classSelector: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWeight: 1, borderColor: '#E2E8F0', borderWidth: 1, marginRight: 10, backgroundColor: '#F8FAFC' },
  classSelectorText: { fontSize: 13, fontWeight: 'bold', color: '#64748B' },

  qrTitle: { fontSize: 16, fontWeight: '800', color: BLUE_PRIMARY, marginBottom: 15 },
  qrBg: { padding: 15, backgroundColor: WHITE, borderRadius: 20, elevation: 10 },
  qrAmount: { fontSize: 28, fontWeight: '900', color: BLUE_PRIMARY, marginTop: 20 },
  qrNote: { fontSize: 11, color: '#94A3B8', marginTop: 5 },

  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, backgroundColor: WHITE, flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 30, borderTopLeftRadius: 35, borderTopRightRadius: 35, elevation: 40, alignItems: 'center' },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navLabel: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', marginTop: 4 },
  navItemMain: { marginTop: -50 },
  navMainInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: BLUE_PRIMARY, justifyContent: 'center', alignItems: 'center', borderWidth: 6, borderColor: WHITE, elevation: 15 },

  // Action Sheet Styles
  overlay: { flex: 1, backgroundColor: 'rgba(11, 30, 63, 0.4)', justifyContent: 'flex-end' },
  actionSheet: { backgroundColor: WHITE, borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, paddingBottom: 50 },
  sheetTitle: { fontSize: 13, fontWeight: '900', color: '#94a3b8', textAlign: 'center', marginBottom: 25, textTransform: 'uppercase', letterSpacing: 1.5 },
  sheetGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  sheetItem: { width: '22%', alignItems: 'center', marginBottom: 5 },
  sheetIconBox: { width: 54, height: 54, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  sheetLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748b' }
});
