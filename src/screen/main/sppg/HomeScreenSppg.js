import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Animated,
  Alert,
  TextInput,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import apiClient from '../../../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Safe Import for Chart
let LineChart;
try {
  LineChart = require('react-native-chart-kit').LineChart;
} catch (e) {
  console.log("Chart Kit not available");
}

const BLUE_PRIMARY = '#1C2C5B';
const BLUE_ACCENT = '#3b82f6';
const WHITE = '#FFFFFF';
const SOFT_BG = '#FFFFFF';

export default function HomeScreenSppg({ navigation }) {
  const { width } = useWindowDimensions();
  const [stats, setStats] = useState({
    total_sekolah: 0,
    total_siswa: 0,
    kehadiran_hari_ini: '0%',
    grafik_konsumsi: [35, 45, 40, 55, 50, 65, 70]
  });
  const [balance, setBalance] = useState(75250000);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState('Admin Otoritas');
  const [requests, setRequests] = useState([]);
  const [activeRequest, setActiveRequest] = useState(null);
  const [transHistory, setTransHistory] = useState([]);
  const [activeTransType, setActiveTransType] = useState(null); // 'send', 'topup', 'scan'
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [quickActionModal, setQuickActionModal] = useState(false);
  const [transAmount, setTransAmount] = useState('');

  const [pendingKantinCount, setPendingKantinCount] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchStats = useCallback(async () => {
    try {
      const userDataStr = await AsyncStorage.getItem('user_data');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        setUserName(userData.nama || 'Admin SPPG');
        
        // Cek apakah sppg_id tersedia untuk menghindari request ?sppg_id=null
        if (!userData.sppg_id) {
          console.warn("SPPG ID is missing for user:", userData.nama);
          return;
        }

        const response = await apiClient.get(`sppg/sppg_get_stats.php?sppg_id=${userData.sppg_id}`).catch((err) => {
          console.error("API Stats Error:", err);
          return null;
        });

        if (response && response.data && response.data.status === 'success') {
          const d = response.data.data;

          // DEEP CLEANING: Ensure all values are valid numbers to prevent SVG NaN crash
          // Grafik dari backend sekarang berbentuk array objek [{label, value, date}]
          const rawData = Array.isArray(d.grafik_konsumsi) ? d.grafik_konsumsi.map(item => item.value) : [35, 45, 40, 55, 50, 65, 70];
          const cleanData = rawData.map(v => {
            const n = Number(v);
            return isNaN(n) || v === null ? 0 : n;
          });

          // Ensure length is exactly 7 for chart stability
          const finalData = cleanData.length === 7 ? cleanData : [35, 45, 40, 55, 50, 65, 70];

          setStats({
            total_sekolah: d.total_sekolah || 0,
            total_siswa: d.total_siswa || 0,
            kehadiran_hari_ini: (d.kehadiran_hari_ini || 0) + " Porsi",
            grafik_konsumsi: finalData
          });

          // Set Balance from API
          if (d.saldo !== undefined) {
            setBalance(d.saldo);
          }

          // Ambil daftar sekolah langsung dari data stats (sppg_get_stats.php sudah mengembalikan daftar_sekolah)
          if (d.daftar_sekolah && Array.isArray(d.daftar_sekolah)) {
            setSchools(d.daftar_sekolah.map(s => ({
              id: s.id,
              nama_sekolah: s.nama,
              npsn: s.npsn || '-',
              siswa: s.jumlah_siswa || 0,
              status: 'Aktif'
            })));
          }

          // Riwayat Transaksi dari API
          if (d.riwayat_transaksi && Array.isArray(d.riwayat_transaksi)) {
            setTransHistory(d.riwayat_transaksi.map(t => ({
              id: t.id,
              type: t.type === 'Transfer' ? 'Kirim' : t.type,
              ref: t.ref,
              amount: parseInt(t.amount) || 0,
              date: t.date,
              status: t.status === 'Berhasil' ? 'Success' : t.status
            })));
          }
        }
      }
    } catch (error) { console.error(error); }
  }, []);

  const fetchPendingKantin = useCallback(async () => {
    try {
      const response = await apiClient.get('sppg/get_pending_kantin.php');
      if (response.data.status === 'success') {
        setPendingKantinCount(response.data.data.length);
      }
    } catch (error) {
      console.error("Fetch pending error:", error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchPendingKantin();
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    AsyncStorage.getItem('@profile_image').then(img => img && setProfileImage(img));
  }, [fetchStats, fetchPendingKantin]);

  const handleExecuteTransaction = async () => {
    const amount = Number(transAmount);
    if (activeTransType === 'send' && !selectedSchool) {
      Alert.alert("Sekolah Belum Dipilih", "Silakan pilih sekolah tujuan pengiriman.");
      return;
    }
    if (amount <= 0) {
      Alert.alert("Nominal Tidak Valid", "Masukkan nominal yang valid.");
      return;
    }

    try {
      const userDataStr = await AsyncStorage.getItem('user_data');
      if (!userDataStr) return;
      const userData = JSON.parse(userDataStr);

      if (activeTransType === 'send') {
        const payload = {
          sppg_id: userData.sppg_id,
          sekolah_id: selectedSchool.id,
          nominal: amount
        };

        const response = await apiClient.post('sppg/sppg_transfer_dana.php', payload);
        if (response.data && response.data.status === 'success') {
          const newTrans = {
            id: response.data.trx_id,
            type: 'Kirim',
            ref: selectedSchool.nama_sekolah,
            amount: amount,
            date: 'Baru saja',
            status: 'Success'
          };
          setBalance(prev => prev - amount);
          setTransHistory(prev => [newTrans, ...prev]);
          setActiveTransType(null);
          setSelectedSchool(null);
          setTransAmount('');
          Alert.alert("Berhasil", `Dana sebesar Rp ${amount.toLocaleString('id-ID')} telah dikirim ke ${selectedSchool.nama_sekolah}.`);
        } else {
          Alert.alert("Gagal", response.data.message || "Gagal melakukan transfer.");
        }
      } else {
        // TOP UP LOGIC (Mock)
        const newTrans = {
          id: Date.now(),
          type: 'Top Up',
          ref: 'Manual Transfer',
          amount: amount,
          date: 'Baru saja',
          status: 'Success'
        };
        setBalance(prev => prev + amount);
        setTransHistory(prev => [newTrans, ...prev]);
        setActiveTransType(null);
        setTransAmount('');
        Alert.alert("Berhasil", `Top Up Rp ${amount.toLocaleString('id-ID')} telah diproses.`);
      }
    } catch (error) {
      Alert.alert("Error", "Koneksi ke server bermasalah.");
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={styles.headerSection}>
        <View style={styles.headerBg}>
          <Image 
            source={require('../../../../assets/batik_cirebon.png')} 
            style={[StyleSheet.absoluteFillObject, { opacity: 0.08, resizeMode: 'repeat' }]} 
          />
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.topNav}>
              <TouchableOpacity onPress={() => navigation.navigate('Profil')} style={styles.avatarContainer}>
                {profileImage ? <Image source={{ uri: profileImage }} style={styles.avatarImg} /> : <View style={styles.avatarFill}><Text style={styles.avatarInitial}>{userName.charAt(0)}</Text></View>}
              </TouchableOpacity>
              <View style={styles.branding}>
                <Text style={styles.brandMain}>LaviraMeal</Text>
                <Text style={styles.brandTag}>Otoritas Pusat V6.0 - TRUE SYNC</Text>
              </View>
              <TouchableOpacity 
                style={styles.notifCircle}
                onPress={() => navigation.navigate('PersetujuanRegistrasi')}
              >
                <Ionicons name="notifications-sharp" size={22} color={WHITE} />
                {pendingKantinCount > 0 && (
                  <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeText}>{pendingKantinCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.platinumCard}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>TOTAL ANGGARAN OPERASIONAL</Text>
                <TouchableOpacity onPress={() => setIsBalanceVisible(!isBalanceVisible)}>
                   <Ionicons name={isBalanceVisible ? "eye-outline" : "eye-off-outline"} size={20} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
              </View>
              <Text style={styles.cardBalance}>{isBalanceVisible ? `Rp ${balance.toLocaleString('id-ID')}` : 'Rp ••••••••'}</Text>
              <View style={styles.cardActions}>
                 <TouchableOpacity style={styles.actionBtn} onPress={() => setActiveTransType('topup')}>
                    <Ionicons name="add-circle" size={18} color={WHITE} />
                    <Text style={styles.actionBtnTxt}>Top Up</Text>
                 </TouchableOpacity>
                 <View style={{ width: 12 }} />
                 <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]} onPress={() => setActiveTransType('send')}>
                    <Ionicons name="paper-plane" size={16} color={WHITE} />
                    <Text style={styles.actionBtnTxt}>Kirim Dana</Text>
                 </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </View>

    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats().finally(() => setRefreshing(false)); }} />}
      contentContainerStyle={{ paddingBottom: 150 }}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* MBG FUNDING REQUESTS */}
        <View style={[styles.section, { marginTop: 15 }]}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Permohonan Anggaran MBG</Text>
              <Text style={styles.sectionSub}>Daftar pengajuan dana operasional dari sekolah.</Text>
            </View>
            <View style={styles.badgeCount}>
              <Text style={styles.badgeTxt}>{requests.filter(r => r.status === 'Pending').length}</Text>
            </View>
          </View>

          {requests.map((req, i) => (
            <TouchableOpacity
              key={i}
              style={styles.requestCard}
              onPress={() => req.status === 'Pending' && setActiveRequest(req)}
            >
              <View style={styles.reqLead}>
                <View style={[styles.reqIcon, { backgroundColor: req.status === 'Success' ? '#f0fdf4' : '#fff7ed' }]}>
                  <MaterialCommunityIcons name="bank-transfer" size={26} color={req.status === 'Success' ? '#10b981' : '#f59e0b'} />
                </View>
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={styles.reqName}>{req.sekolah}</Text>
                  <Text style={styles.reqPurpose}>{req.purpose}</Text>
                </View>
              </View>
              <View style={styles.reqMeta}>
                <Text style={styles.reqNominal}>Rp {req.nominal.toLocaleString('id-ID')}</Text>
                <View style={styles.statusRow}>
                  <View style={[styles.dot, { backgroundColor: req.status === 'Success' ? '#10b981' : '#f59e0b' }]} />
                  <Text style={[styles.statusLabel, { color: req.status === 'Success' ? '#10b981' : '#f59e0b' }]}>{req.status.toUpperCase()}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </ScrollView>

  {/* TRANSACTION INPUT MODAL (SEND / TOPUP) */ }
  <Modal visible={!!activeTransType && activeTransType !== 'scan'} transparent animationType="slide">
    <View style={styles.overlay}>
      <View style={styles.transSheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{activeTransType === 'topup' ? 'Input Nominal Top Up' : 'Kirim Dana ke Sekolah'}</Text>
          <TouchableOpacity onPress={() => { setActiveTransType(null); setSelectedSchool(null); }}><Feather name="x" size={24} color={BLUE_PRIMARY} /></TouchableOpacity>
        </View>

        {activeTransType === 'send' && (
          <View style={styles.schoolSelector}>
            <Text style={styles.selectorLabel}>Pilih Sekolah Tujuan:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.schScroll}>
              {schools.map(sch => (
                <TouchableOpacity
                  key={sch.id}
                  style={[styles.schChip, selectedSchool?.id === sch.id && styles.schChipActive]}
                  onPress={() => setSelectedSchool(sch)}
                >
                  <Ionicons name="school" size={14} color={selectedSchool?.id === sch.id ? WHITE : BLUE_PRIMARY} />
                  <Text style={[styles.schChipTxt, selectedSchool?.id === sch.id && styles.schChipTxtActive]}>{sch.nama_sekolah}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.amountInputBox}>
          <Text style={styles.rpLabel}>Rp</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0"
            keyboardType="numeric"
            value={transAmount}
            onChangeText={setTransAmount}
            autoFocus
          />
        </View>

        <View style={styles.quickAmounts}>
          {[1000000, 5000000, 10000000, 25000000].map(val => (
            <TouchableOpacity key={val} style={styles.quickItem} onPress={() => setTransAmount(val.toString())}>
              <Text style={styles.quickItemTxt}>+{(val / 1000000).toFixed(0)} Jt</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.executeBtn} onPress={handleExecuteTransaction}>
          <Text style={styles.executeBtnTxt}>Konfirmasi Transaksi</Text>
          <Ionicons name="shield-checkmark" size={20} color={WHITE} style={{ marginLeft: 10 }} />
        </TouchableOpacity>
      </View>
    </View>
  </Modal>

  {/* QUICK ACTION MODAL (PICKER) */ }
  <Modal visible={quickActionModal} transparent animationType="fade">
    <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setQuickActionModal(false)}>
      <View style={styles.actionSheet}>
        <Text style={styles.sheetTitle}>Lavira Pay</Text>
        <View style={styles.sheetGrid}>
          {[
            { label: 'Kirim Dana', icon: 'send', color: '#10b981', press: () => { setActiveTransType('send'); setQuickActionModal(false); } },
            { label: 'Scan QR', icon: 'qr-code', color: '#0ea5e9', press: () => { setActiveTransType('scan'); setQuickActionModal(false); Alert.alert("QR Scanner", "Scanner memerlukan izin kamera fisik."); } },
            { label: 'Top Up', icon: 'wallet', color: '#f59e0b', press: () => { setActiveTransType('topup'); setQuickActionModal(false); } },
            { label: 'Audit', icon: 'checkmark-circle', color: '#4f46e5', press: () => { navigation.navigate('AuditSekolahMenu'); setQuickActionModal(false); } },
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

  {/* APPROVE FUNDING MODAL */ }
  <Modal visible={!!activeRequest} transparent animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.approveCard}>
        <Ionicons name="shield-checkmark" size={60} color={BLUE_ACCENT} style={{ alignSelf: 'center' }} />
        <Text style={styles.approveTitle}>Otorisasi Penyaluran Dana</Text>
        <Text style={styles.approveDesc}>Anda akan menyetujui pengiriman dana sebesar <Text style={{ fontWeight: 'bold', color: BLUE_PRIMARY }}>Rp {activeRequest?.nominal.toLocaleString('id-ID')}</Text> ke {activeRequest?.sekolah}.</Text>

        <View style={styles.approveInfo}>
          <View style={styles.infoRow}><Text style={styles.infoLab}>Program:</Text><Text style={styles.infoVal}>Dana MBG Tahap II</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLab}>Tujuan:</Text><Text style={styles.infoVal}>{activeRequest?.sekolah}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLab}>Metode:</Text><Text style={styles.infoVal}>Direct Ops Transfer</Text></View>
        </View>

        <View style={styles.approveActions}>
          <TouchableOpacity style={styles.cancelAction} onPress={() => setActiveRequest(null)}>
            <Text style={styles.cancelActionTxt}>Kembali</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmAction} onPress={() => {
            setBalance(prev => prev - activeRequest.nominal);
            setRequests(prev => prev.map(r => r.id === activeRequest.id ? { ...r, status: 'Success' } : r));
            setActiveRequest(null);
            Alert.alert("Transfer Berhasil", "Dana MBG telah berhasil dikirimkan ke rekening sekolah.");
          }}>
            <Text style={styles.confirmActionTxt}>Otorisasi TF</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>

  {/* BOTTOM NAV */ }
  <View style={styles.bottomNav}>
    <TouchableOpacity style={styles.navItem}><Ionicons name="grid" size={24} color={BLUE_PRIMARY} /><Text style={[styles.navLabel, { color: BLUE_PRIMARY }]}>Beranda</Text></TouchableOpacity>
    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Sekolah')}><Ionicons name="business-outline" size={24} color="#94a3b8" /><Text style={styles.navLabel}>Sekolah</Text></TouchableOpacity>
    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Laporan')}><Ionicons name="stats-chart-outline" size={24} color="#94a3b8" /><Text style={styles.navLabel}>Laporan</Text></TouchableOpacity>
    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profil')}><Ionicons name="person-outline" size={24} color="#94a3b8" /><Text style={styles.navLabel}>Profil</Text></TouchableOpacity>
  </View>
    </View >
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SOFT_BG },
  headerSection: { height: 380, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, overflow: 'hidden', elevation: 25, zIndex: 1 },
  headerBg: { flex: 1, backgroundColor: '#1C2C5B', paddingHorizontal: 25 },
  batikOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.08, resizeMode: 'repeat' },
  topNav: { flexDirection: 'row', alignItems: 'center', marginTop: 45, marginBottom: 25 },
  avatarContainer: { width: 56, height: 56, borderRadius: 20, backgroundColor: WHITE, padding: 2, elevation: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  avatarImg: { width: '100%', height: '100%', borderRadius: 18 },
  avatarFill: { width: '100%', height: '100%', borderRadius: 18, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { color: BLUE_PRIMARY, fontWeight: '900', fontSize: 20 },
  branding: { flex: 1, marginLeft: 15 },
  brandMain: { color: WHITE, fontSize: 24, fontWeight: '900', letterSpacing: -0.8 },
  brandTag: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  notifCircle: { width: 50, height: 50, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', position: 'relative' },
  notifBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#ef4444', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4, borderWidth: 2, borderColor: '#1C2C5B' },
  notifBadgeText: { color: WHITE, fontSize: 10, fontWeight: 'bold' },
  platinumCard: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 35, padding: 25, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)', marginTop: 10 },
  cardInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  cardBalance: { color: WHITE, fontSize: 34, fontWeight: '900', letterSpacing: -1 },
  cardActions: { flexDirection: 'row', marginTop: 25 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: BLUE_ACCENT, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 16, elevation: 10 },
  actionBtnTxt: { color: WHITE, fontSize: 13, fontWeight: '900', marginLeft: 8 },
  statsStrip: { flexDirection: 'row', backgroundColor: WHITE, marginHorizontal: 25, borderRadius: 25, paddingVertical: 22, elevation: 20, zIndex: 10, marginTop: -45, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20 },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: '900', color: BLUE_PRIMARY },
  statLab: { fontSize: 10, color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', marginTop: 5 },
  statDiv: { width: 1, height: '40%', backgroundColor: '#f1f5f9', alignSelf: 'center' },
  section: { marginTop: 40, paddingHorizontal: 25 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1e293b' },
  sectionSub: { fontSize: 12, color: '#94a3b8', marginTop: 2, fontWeight: '500' },
  badgeCount: { backgroundColor: '#fee2e2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeTxt: { fontSize: 12, fontWeight: '900', color: '#ef4444' },
  chartContainer: { backgroundColor: WHITE, borderRadius: 30, padding: 15, elevation: 5 },
  requestCard: { backgroundColor: WHITE, borderRadius: 28, padding: 20, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  reqLead: { flexDirection: 'row', alignItems: 'center' },
  reqIcon: { width: 54, height: 54, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  reqName: { fontSize: 16, fontWeight: '900', color: '#1e293b' },
  reqPurpose: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  reqMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#f8fafc' },
  reqNominal: { fontSize: 15, fontWeight: '900', color: BLUE_PRIMARY },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusLabel: { fontSize: 10, fontWeight: '900' },
  overlay: { flex: 1, backgroundColor: 'rgba(11,30,63,0.85)', justifyContent: 'flex-end' },
  bankSheet: { backgroundColor: WHITE, borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, paddingBottom: 50 },
  sheetHandle: { width: 40, height: 5, backgroundColor: '#e2e8f0', borderRadius: 10, alignSelf: 'center', marginBottom: 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sheetTitle: { fontSize: 22, fontWeight: '900', color: BLUE_PRIMARY },
  sheetDesc: { fontSize: 14, color: '#64748b', marginBottom: 25, lineHeight: 20 },
  bankCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 22, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#f1f5f9' },
  bankLogo: { width: 50, height: 30 },
  bankName: { fontSize: 11, fontWeight: 'bold', color: '#94a3b8' },
  bankAcc: { fontSize: 18, fontWeight: '900', color: BLUE_PRIMARY, marginVertical: 2 },
  bankHolder: { fontSize: 10, color: '#64748b', fontWeight: 'bold' },
  confirmBtn: { backgroundColor: BLUE_PRIMARY, paddingVertical: 22, borderRadius: 20, alignItems: 'center', marginTop: 15, elevation: 10 },
  confirmBtnTxt: { color: WHITE, fontSize: 16, fontWeight: '900' },
  approveCard: { backgroundColor: WHITE, borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 35, paddingBottom: 50 },
  approveTitle: { fontSize: 22, fontWeight: '900', color: BLUE_PRIMARY, textAlign: 'center', marginTop: 20 },
  approveDesc: { fontSize: 15, color: '#64748b', textAlign: 'center', marginTop: 15, lineHeight: 22 },
  approveInfo: { backgroundColor: '#f8fafc', borderRadius: 25, padding: 25, marginVertical: 30 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  infoLab: { fontSize: 13, color: '#94a3b8', fontWeight: 'bold' },
  infoVal: { fontSize: 13, color: BLUE_PRIMARY, fontWeight: '900' },
  approveActions: { flexDirection: 'row', gap: 15 },
  cancelAction: { flex: 1, paddingVertical: 20, borderRadius: 18, backgroundColor: '#f1f5f9', alignItems: 'center' },
  cancelActionTxt: { fontSize: 15, fontWeight: 'bold', color: '#64748b' },
  confirmAction: { flex: 2, paddingVertical: 20, borderRadius: 18, backgroundColor: BLUE_ACCENT, alignItems: 'center', elevation: 8 },
  confirmActionTxt: { fontSize: 15, fontWeight: '900', color: WHITE },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, backgroundColor: WHITE, flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 30, borderTopLeftRadius: 35, borderTopRightRadius: 35, elevation: 40, alignItems: 'center' },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navLabel: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', marginTop: 4 },
  navItemMain: { marginTop: -50 },
  navMainInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: BLUE_PRIMARY, justifyContent: 'center', alignItems: 'center', borderWidth: 6, borderColor: SOFT_BG, elevation: 15 },
  historyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: WHITE, borderRadius: 22, padding: 18, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5 },
  historyIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  historyRef: { fontSize: 15, fontWeight: '900', color: '#1e293b' },
  historyDate: { fontSize: 11, color: '#94a3b8', marginTop: 2, fontWeight: 'bold' },
  historyAmount: { fontSize: 15, fontWeight: '900' },
  transSheet: { backgroundColor: WHITE, borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, paddingBottom: 50 },
  amountInputBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 35 },
  rpLabel: { fontSize: 24, fontWeight: '900', color: '#94a3b8', marginRight: 10 },
  amountInput: { fontSize: 48, fontWeight: '900', color: BLUE_PRIMARY, minWidth: 100, textAlign: 'center' },
  quickAmounts: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 35 },
  quickItem: { backgroundColor: '#f1f5f9', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12 },
  quickItemTxt: { fontSize: 13, fontWeight: '900', color: '#475569' },
  executeBtn: { backgroundColor: BLUE_PRIMARY, height: 64, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: BLUE_PRIMARY, shadowOpacity: 0.3, shadowRadius: 15 },
  executeBtnTxt: { color: WHITE, fontSize: 16, fontWeight: '900' },
  sheetGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 20 },
  sheetItem: { width: '45%', alignItems: 'center' },
  sheetIconBox: { width: 64, height: 64, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionSheet: { backgroundColor: WHITE, borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 35 },
  schoolSelector: { marginTop: 10, marginBottom: 5 },
  selectorLabel: { fontSize: 12, fontWeight: 'bold', color: '#64748b', marginBottom: 12 },
  schScroll: { flexDirection: 'row', marginBottom: 5 },
  schChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, marginRight: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  schChipActive: { backgroundColor: BLUE_PRIMARY, borderColor: BLUE_PRIMARY },
  schChipTxt: { fontSize: 13, fontWeight: 'bold', color: BLUE_PRIMARY, marginLeft: 8 },
  schChipTxtActive: { color: WHITE },
});