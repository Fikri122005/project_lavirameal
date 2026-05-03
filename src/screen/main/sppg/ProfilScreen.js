import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  ImageBackground,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../../api/client';

// Safe Import Expo Image Picker
let ImagePicker;
try {
  ImagePicker = require('expo-image-picker');
} catch (e) {
  console.log("Image Picker not available");
}

const BLUE_PRIMARY = '#1C2C5B';
const BLUE_ACCENT = '#3b82f6';
const WHITE = '#FFFFFF';
const SOFT_BG = '#FFFFFF';

export default function ProfilScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const [userData, setUserData] = useState({
    nama: 'User Lavira',
    email: '-',
    role: '',
    nama_lembaga: '-',
    nama_sekolah: '-',
    nip: '-',
    jabatan: '-'
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [quickActionModal, setQuickActionModal] = useState(false);
  
  // NEW: Change PIN State
  const [pinModal, setPinModal] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [showPins, setShowPins] = useState(false);

  useEffect(() => {
    loadUserData();
    AsyncStorage.getItem('@profile_image').then(img => img && setProfileImage(img));
  }, []);

  const loadUserData = async () => {
    try {
      const dataStr = await AsyncStorage.getItem('user_data');
      if (dataStr) {
        const parsed = JSON.parse(dataStr);
        setUserData({
            ...userData,
            ...parsed,
            // Fallback for school name vs agency name
            displayLembaga: parsed.role === 'siswa' ? (parsed.nama_sekolah || 'LAVIRA STUDENT') : (parsed.role === 'sekolah' ? parsed.nama_sekolah : (parsed.nama_lembaga || 'LaviraMeal Authority')),
            displayJabatan: parsed.role === 'siswa' ? `Siswa Kelas ${parsed.kelas || '-'}` : (parsed.role === 'sekolah' ? 'Administrator Sekolah' : (parsed.jabatan || 'Otoritas Wilayah'))
        });
      }
    } catch (e) { console.error(e); }
  };

  const pickImage = async () => {
    if (!ImagePicker) return;
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets) {
      setProfileImage(result.assets[0].uri);
      await AsyncStorage.setItem('@profile_image', result.assets[0].uri);
    }
  };

  const handleLogout = () => {
      Alert.alert(
         "Konfirmasi Keluar",
         "Apakah Anda yakin ingin keluar dari aplikasi LaviraMeal?",
         [
            { 
               text: "Batal", 
               style: "cancel" 
            },
            { 
               text: "Keluar", 
               style: "destructive",
               onPress: async () => {
                  try {
                     await AsyncStorage.removeItem('user_data');
                     // Clear other relevant storage if needed
                     await AsyncStorage.removeItem('@profile_image'); // Optional: keep or remove? User didn't specify, but usually want a clean slate.
                     navigation.replace('Login');
                  } catch (e) {
                     navigation.replace('Login');
                  }
               } 
            }
         ],
         { cancelable: true }
      );
   };

   const handleChangePin = async () => {
      if (!oldPin || !newPin || !confirmPin) {
        Alert.alert("Error", "Semua kolom wajib diisi");
        return;
      }
      if (newPin !== confirmPin) {
        Alert.alert("Error", "Konfirmasi sandi baru tidak cocok");
        return;
      }
  
      setIsChangingPin(true);
      try {
        const response = await apiClient.post('auth/change_password.php', {
          user_id: userData.id,
          old_password: oldPin,
          new_password: newPin
        });
  
        if (response.data.status === 'success') {
          Alert.alert("Berhasil", "Sandi Pengamanan telah diperbarui secara aman.");
          setPinModal(false);
          setOldPin('');
          setNewPin('');
          setConfirmPin('');
        }
      } catch (error) {
        Alert.alert("Gagal", error.response?.data?.message || "Terjadi kesalahan sistem");
      } finally {
        setIsChangingPin(false);
      }
    };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
         {/* HEADER DECORATIVE */}
         <View style={styles.headerSpacer}>
            <Image 
               source={require('../../../../assets/batik_cirebon.png')} 
               style={[StyleSheet.absoluteFillObject, { opacity: 0.05, resizeMode: 'repeat' }]} 
            />
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
               <Text style={styles.headerTitle}>Profile</Text>
               <Text style={styles.headerDate}>Sistem Layanan MBG - {userData.role === 'siswa' ? 'Kartu Siswa Digital' : (userData.role === 'sekolah' ? 'Otoritas Sekolah' : 'Otoritas Pusat')}</Text>
            </SafeAreaView>
         </View>

         {/* ULTRA-REALISTIC DIGITAL ID CARD */}
         <View style={styles.idCardContainer}>
            <View style={styles.idCardBg}>
               {/* Multi-layer Batik Overlay */}
               <Image 
                  source={require('../../../../assets/batik_cirebon.png')} 
                  style={[StyleSheet.absoluteFillObject, { opacity: 0.08, resizeMode: 'repeat' }]} 
               />
               
               {/* Holographic Chip & Agency */}
               <View style={styles.idHeader}>
                  <View>
                     <Text style={styles.idAgency}>{(userData.displayLembaga || '').toUpperCase()}</Text>
                                           <Text style={styles.idProgram}>LAVIRAMEAL | OFFICIAL {userData.role === 'siswa' ? 'STUDENT' : (userData.role === 'sekolah' ? 'SCHOOL' : 'SPPG')} ID CARD</Text>

                  </View>
                  <View style={styles.chipBox}>
                     <MaterialCommunityIcons name="chip" size={34} color="#fbbf24" style={{ opacity: 0.9 }} />
                  </View>
               </View>

               <View style={styles.idBody}>
                  <TouchableOpacity onPress={pickImage} style={styles.idPhotoContainer}>
                     <View style={styles.photoFrame}>
                        {profileImage ? <Image source={{ uri: profileImage }} style={styles.idPhoto} /> : <View style={styles.idPhotoPlaceholder}><Ionicons name="person" size={40} color="rgba(255,255,255,0.2)" /></View>}
                     </View>
                     <View style={styles.idVerified}>
                        <Ionicons name="shield-checkmark" size={12} color={WHITE} />
                     </View>
                  </TouchableOpacity>
                  
                  <View style={styles.idDetails}>
                     <Text style={styles.idName} numberOfLines={1}>{userData.nama.toUpperCase()}</Text>
                     <Text style={styles.idJob}>{userData.displayJabatan}</Text>
                     <View style={styles.idDivider} />
                     <View style={styles.nipRow}>
                        <Text style={styles.nipLabel}>UNIFIED ID</Text>
                        <Text style={styles.idNip}>{userData.nip}</Text>
                     </View>
                  </View>
               </View>

               {/* Stamp & Verification */}
               <View style={styles.idFooter}>
                  <View style={{ flex: 1 }} />
                  
                  <View style={styles.stampContainer}>


                  </View>
               </View>
            </View>
         </View>

         {/* MENU LIST CATEGORIZED */}
         <View style={styles.menuContainer}>
            <View style={styles.statusBanner}>
               <View style={styles.statusDot} />
               <Text style={styles.statusText}>Admin Terhubung: Server Karawang Utama</Text>
            </View>

            <Text style={styles.sectionTitle}>Sistem & Otoritas</Text>
            <View style={styles.menuCard}>
               {[
                 { label: 'Ubah PIN Pengamanan', icon: 'key-outline', color: '#4f46e5', action: () => setPinModal(true) },
                                   { label: userData.role === 'siswa' ? 'Pusat Bantuan Siswa' : (userData.role === 'sekolah' ? 'Pusat Bantuan Sekolah' : 'Pusat Bantuan SPPG'), icon: 'help-buoy-outline', color: '#10b981' },

                 { label: 'Ketentuan Layanan MBG', icon: 'document-lock-outline', color: '#f59e0b' }
               ].map((m, i) => (
                  <TouchableOpacity key={i} style={[styles.menuRow, i === 2 && { borderBottomWidth: 0 }]} onPress={m.action}>
                     <View style={[styles.menuIcon, { backgroundColor: m.color + '15' }]}><Ionicons name={m.icon} size={20} color={m.color} /></View>
                     <Text style={styles.menuLabel}>{m.label}</Text>
                     <Feather name="chevron-right" size={18} color="#cbd5e1" />
                  </TouchableOpacity>
               ))}
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Aksi Akun</Text>
            <View style={styles.menuCard}>
               <TouchableOpacity style={[styles.menuRow, { borderBottomWidth: 0 }]} onPress={handleLogout}>
                  <View style={[styles.menuIcon, { backgroundColor: '#fee2e2' }]}><Ionicons name="log-out-outline" size={20} color="#ef4444" /></View>
                  <Text style={[styles.menuLabel, { color: '#ef4444' }]}>Keluar Aplikasi</Text>
                  <Feather name="chevron-right" size={18} color="#fee2e2" />
               </TouchableOpacity>
            </View>
         </View>


      </ScrollView>

      {/* QUICK ACTION MODAL */}
      <Modal visible={quickActionModal} transparent animationType="fade">
         <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setQuickActionModal(false)}>
            <View style={styles.actionSheet}>
               <Text style={styles.sheetTitle}>Portal Administratif</Text>
               <View style={styles.sheetGrid}>
                  {[
                     { label: 'Transfer', icon: 'send-outline', color: '#4f46e5', press: () => setQuickActionModal(false) },
                                           { label: 'Scan', icon: 'scan-outline', color: '#0ea5e9', press: () => { navigation.navigate('QRScanner'); setQuickActionModal(false); } },

                     { 
                        label: 'Beranda', 
                        icon: 'home-outline', 
                        color: '#10b981', 
                        press: () => { 
                           navigation.navigate(userData.role === 'sekolah' ? 'HomeSekolah' : 'Home'); 
                           setQuickActionModal(false); 
                        } 
                     },
                     { 
                        label: 'Report', 
                        icon: 'stats-chart-outline', 
                        color: '#f59e0b', 
                        press: () => { 
                           navigation.navigate(userData.role === 'sekolah' ? 'LaporanSekolah' : 'Laporan'); 
                           setQuickActionModal(false); 
                        } 
                     },
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

      {/* UBAH PIN MODAL */}
      <Modal visible={pinModal} transparent animationType="slide">
        <View style={styles.overlay}>
           <View style={styles.pinSheet}>
              <View style={styles.sheetHeader}>
                 <Text style={styles.pinTitle}>Ubah PIN Pengamanan</Text>
                 <TouchableOpacity onPress={() => setPinModal(false)}>
                    <Ionicons name="close" size={24} color={BLUE_PRIMARY} />
                 </TouchableOpacity>
              </View>
              <Text style={styles.pinSubtitle}>Gunakan kombinasi yang kuat untuk melindungi hak akses administratif Anda.</Text>

              <View style={styles.pinForm}>
                  <View style={styles.pinInputGroup}>
                      <Text style={styles.pinInputLabel}>Sandi Lama</Text>
                      <View style={styles.pinInputWrap}>
                          <Ionicons name="lock-closed" size={18} color="#94a3b8" />
                          <TextInput 
                             style={styles.pinInput} 
                             placeholder="••••••••" 
                             secureTextEntry={!showPins}
                             value={oldPin}
                             onChangeText={setOldPin}
                          />
                          <TouchableOpacity onPress={() => setShowPins(!showPins)}>
                             <Ionicons name={showPins ? "eye-off" : "eye"} size={18} color="#94a3b8" />
                          </TouchableOpacity>
                      </View>
                  </View>

                  <View style={styles.pinInputGroup}>
                      <Text style={styles.pinInputLabel}>Sandi Baru</Text>
                      <View style={styles.pinInputWrap}>
                          <Ionicons name="shield-checkmark" size={18} color="#6366f1" />
                          <TextInput 
                             style={styles.pinInput} 
                             placeholder="Sandi Baru" 
                             secureTextEntry={!showPins}
                             value={newPin}
                             onChangeText={setNewPin}
                          />
                      </View>
                  </View>

                  <View style={styles.pinInputGroup}>
                      <Text style={styles.pinInputLabel}>Konfirmasi Sandi Baru</Text>
                      <View style={styles.pinInputWrap}>
                          <Ionicons name="shield-checkmark" size={18} color="#6366f1" />
                          <TextInput 
                             style={styles.pinInput} 
                             placeholder="Ulangi Sandi Baru" 
                             secureTextEntry={!showPins}
                             value={confirmPin}
                             onChangeText={setConfirmPin}
                          />
                      </View>
                  </View>

                  <TouchableOpacity 
                    style={[styles.pinSubmit, isChangingPin && { opacity: 0.7 }]} 
                    onPress={handleChangePin}
                    disabled={isChangingPin}
                  >
                     {isChangingPin ? <ActivityIndicator color={WHITE} /> : (
                        <>
                           <Text style={styles.pinSubmitTxt}>Perbarui Sandi Sekarang</Text>
                           <Ionicons name="arrow-forward" size={18} color={WHITE} />
                        </>
                     )}
                  </TouchableOpacity>
              </View>
           </View>
        </View>
      </Modal>


      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
         {userData.role === 'siswa' ? (
           <>
            <TouchableOpacity 
              style={styles.navItem} 
              onPress={() => navigation.navigate('HomeSiswa')}
            >
              <Ionicons name="grid-outline" size={24} color="#94a3b8" />
              <Text style={styles.navLabel}>Beranda</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.navItem} 
              onPress={() => navigation.navigate('RiwayatSiswa')}
            >
              <Ionicons name="receipt-outline" size={24} color="#94a3b8" />
              <Text style={styles.navLabel}>Riwayat</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem}>
              <Ionicons name="person" size={24} color={BLUE_PRIMARY} />
              <Text style={[styles.navLabel, { color: BLUE_PRIMARY }]}>Profil</Text>
            </TouchableOpacity>
           </>
         ) : (
           <>
            <TouchableOpacity 
              style={styles.navItem} 
              onPress={() => navigation.navigate(userData.role === 'sekolah' ? 'HomeSekolah' : 'Home')}
            >
              <Ionicons name="grid-outline" size={24} color="#94a3b8" />
              <Text style={styles.navLabel}>Beranda</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.navItem} 
              onPress={() => navigation.navigate(userData.role === 'sekolah' ? 'ManajemenKelas' : 'Sekolah')}
            >
              <Ionicons name={userData.role === 'sekolah' ? "people-outline" : "business-outline"} size={24} color="#94a3b8" />
              <Text style={styles.navLabel}>{userData.role === 'sekolah' ? 'Kelas' : 'Sekolah'}</Text>
            </TouchableOpacity>



            <TouchableOpacity 
              style={styles.navItem} 
              onPress={() => navigation.navigate(userData.role === 'sekolah' ? 'LaporanSekolah' : 'Laporan')}
            >
              <Ionicons name="stats-chart-outline" size={24} color="#94a3b8" />
              <Text style={styles.navLabel}>Laporan</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem}>
              <Ionicons name="person" size={24} color={BLUE_PRIMARY} />
              <Text style={[styles.navLabel, { color: BLUE_PRIMARY }]}>Profil</Text>
            </TouchableOpacity>
           </>
         )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SOFT_BG },
  headerSpacer: { height: 200, backgroundColor: BLUE_PRIMARY, justifyContent: 'center', alignItems: 'center', borderBottomLeftRadius: 50, borderBottomRightRadius: 50, overflow: 'hidden', elevation: 20 },
  headerTitle: { color: WHITE, fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  headerDate: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4, fontWeight: 'bold' },
  
  idCardContainer: { marginHorizontal: 25, marginTop: -40, height: 280, borderRadius: 35, overflow: 'hidden', elevation: 20, shadowColor: BLUE_PRIMARY, shadowOpacity: 0.3, shadowRadius: 20 },
  idCardBg: { flex: 1, backgroundColor: BLUE_PRIMARY, padding: 25 },
  idHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  idAgency: { color: WHITE, fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
  idProgram: { color: '#fbbf24', fontSize: 9, fontWeight: 'bold', marginTop: 4, letterSpacing: 1 },
  chipBox: { padding: 4, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)' },
  
  idBody: { flexDirection: 'row', marginTop: 25, alignItems: 'center' },
  idPhotoContainer: { position: 'relative' },
  photoFrame: { width: 70, height: 90, borderRadius: 12, borderWidth: 3, borderColor: 'rgba(255,255,255,0.15)', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)' },
  idPhoto: { width: '100%', height: '100%' },
  idPhotoPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  idVerified: { position: 'absolute', top: -5, right: -5, backgroundColor: BLUE_ACCENT, width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: BLUE_PRIMARY },
  
  idDetails: { flex: 1, marginLeft: 20 },
  idName: { color: WHITE, fontSize: 16, fontWeight: '900', letterSpacing: -0.5 },
  idJob: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '700', marginTop: 4 },
  idDivider: { width: 40, height: 3, backgroundColor: '#fbbf24', marginVertical: 12, borderRadius: 2 },
  nipRow: { marginTop: 2 },
  nipLabel: { color: '#64748b', fontSize: 7, fontWeight: '900', letterSpacing: 1.5 },
  idNip: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '900', letterSpacing: 0.5, marginTop: 2 },
  
  idFooter: { position: 'absolute', bottom: 20, left: 25, right: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  qrSection: { alignItems: 'center' },
  qrBox: { backgroundColor: WHITE, padding: 4, borderRadius: 10 },
  qrSerial: { color: 'rgba(255,255,255,0.3)', fontSize: 8, fontWeight: 'bold', marginTop: 6 },
  
  stampContainer: { alignItems: 'flex-end' },
  validityBox: { marginBottom: 8, alignItems: 'flex-end' },
  validTitle: { color: 'rgba(255,255,255,0.3)', fontSize: 7, fontWeight: 'bold' },
  validVal: { color: WHITE, fontSize: 9, fontWeight: '900' },
  officialStamp: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(251,191,36,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(251,191,36,0.2)' },
  stampTxt: { color: '#fbbf24', fontSize: 8, fontWeight: '900', marginLeft: 4 },

  menuContainer: { paddingHorizontal: 25, marginTop: 30 },
  statusBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', padding: 12, borderRadius: 15, marginBottom: 25, borderWidth: 1, borderColor: '#dcfce7' },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981', marginRight: 10 },
  statusText: { fontSize: 11, fontWeight: 'bold', color: '#166534' },
  
  sectionTitle: { fontSize: 12, fontWeight: '900', color: '#94a3b8', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1.5 },
  menuCard: { backgroundColor: WHITE, borderRadius: 30, paddingVertical: 10, paddingHorizontal: 5, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15 },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  menuIcon: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 18 },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: '#1e293b' },
  
  footer: { alignItems: 'center', marginTop: 35 },
  versionTxt: { fontSize: 11, fontWeight: '900', color: '#cbd5e1', letterSpacing: 0.5 },
  copyrightTxt: { fontSize: 10, color: '#e2e8f0', marginTop: 6, fontWeight: 'bold' },
  
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, backgroundColor: WHITE, flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 30, borderTopLeftRadius: 35, borderTopRightRadius: 35, elevation: 40, alignItems: 'center' },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navLabel: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', marginTop: 4 },
  floatingScanBtn: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    zIndex: 10,
  },
  navItemMain: { marginTop: -50 },
  navMainInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: BLUE_PRIMARY, justifyContent: 'center', alignItems: 'center', borderWidth: 6, borderColor: WHITE, elevation: 15 },

  // New PIN Modal Styles
  pinSheet: { backgroundColor: WHITE, borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, width: '100%' },
  pinTitle: { fontSize: 20, fontWeight: '900', color: BLUE_PRIMARY },
  pinSubtitle: { fontSize: 13, color: '#64748b', marginTop: 8, lineHeight: 18 },
  pinForm: { marginTop: 25 },
  pinInputGroup: { marginBottom: 18 },
  pinInputLabel: { fontSize: 11, fontWeight: 'bold', color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase' },
  pinInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 16, paddingHorizontal: 15, height: 55, borderWidth: 1, borderColor: '#f1f5f9' },
  pinInput: { flex: 1, marginLeft: 12, fontSize: 14, color: BLUE_PRIMARY, fontWeight: 'bold' },
  pinSubmit: { backgroundColor: BLUE_PRIMARY, height: 55, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15, gap: 10, elevation: 8, shadowColor: BLUE_PRIMARY, shadowOpacity: 0.3, shadowRadius: 10 },
  pinSubmitTxt: { color: WHITE, fontSize: 15, fontWeight: 'bold' },
});
