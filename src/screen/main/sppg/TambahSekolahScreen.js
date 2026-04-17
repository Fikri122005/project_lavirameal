import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import apiClient from '../../../api/client';

const BLUE_PRIMARY = '#1C2C5B';
const BLUE_DARK = '#1C2C5B';
const WHITE = '#FFFFFF';

export default function TambahSekolahScreen({ navigation }) {
  const [namaSekolah, setNamaSekolah] = useState('');
  const [npsn, setNpsn] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');
  const [alamat, setAlamat] = useState('');
  const [loading, setLoading] = useState(false);

  // States for API UI
  const [schoolsData, setSchoolsData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoadingApi, setIsLoadingApi] = useState(true);
  const [isErrorApi, setIsErrorApi] = useState(false);

  const fetchSchools = async () => {
    setIsLoadingApi(true);
    setIsErrorApi(false);
    try {
      const response = await apiClient.get('/sppg_api_sekolah_klari.php');
      if (response.data && response.data.status === 'success') {
        setSchoolsData(response.data.data);
      } else {
        setIsErrorApi(true);
      }
    } catch (error) {
      console.error("Gagal get APi sekolah:", error);
      setIsErrorApi(true);
    } finally {
      setIsLoadingApi(false);
    }
  };

  // Fetch API Data Sekolah
  useEffect(() => {
    fetchSchools();
  }, []);

  const selectSchool = (item) => {
    setNamaSekolah(item.nama);
    setNpsn(item.npsn);
    setAlamat(item.alamat);
    setModalVisible(false);
  };

  const handleRegister = async () => {
    if (!namaSekolah || !npsn || !email || !password || !konfirmasiPassword || !alamat) {
      Alert.alert("Perhatian", "Harap isi semua kolom pendaftaran.");
      return;
    }

    if (password !== konfirmasiPassword) {
      Alert.alert("Perhatian", "Kata sandi dan konfirmasi tidak sama!");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/sppg_add_sekolah.php', {
        namaSekolah,
        npsn,
        email,
        password,
        alamat
      });

      if (response.data && response.data.status === 'success') {
        Alert.alert("Sukses", response.data.message);
        navigation.goBack(); // Kembali ke dashboard
      } else {
        Alert.alert("Gagal", response.data.message || "Terjadi kesalahan sistem.");
      }
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Tidak dapat terhubung ke server backend.';
      Alert.alert("Error Server", errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header Premium Area */}
      <View style={styles.headerSection}>
        <Image
          source={require('../../../../assets/batik_cirebon.png')}
          style={[StyleSheet.absoluteFillObject, { opacity: 0.08, resizeMode: 'repeat' }]}
        />
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={WHITE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manajemen Pengguna</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.headerSubtitle}>
          Daftarkan akun Admin untuk perwakilan Sekolah baru yang sudah menggunakan API sistem.
        </Text>
      </View>

      {/* Form Content */}
      <View style={styles.formCard}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Pilih Sekolah (Integrasi API Klari)</Text>
            <TouchableOpacity
              style={[styles.inputContainer, { backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#CBD5E1' }]}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
            >
              <View style={styles.apiBadge}><Ionicons name="cloud-download" size={12} color={WHITE} /></View>
              <Text style={[styles.input, { color: namaSekolah ? '#1E293B' : '#94A3B8', marginLeft: 6 }]}>
                {namaSekolah ? namaSekolah : "Sentuh untuk cari sekolah di API"}
              </Text>
              <Ionicons name="chevron-down-circle" size={24} color={BLUE_PRIMARY} />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>NPSN (Sesuai API)</Text>
            <View style={[styles.inputContainer, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="document-text-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="NPSN Terisi otomatis" placeholderTextColor="#94A3B8" value={npsn} onChangeText={setNpsn} keyboardType="numeric" editable={!namaSekolah} />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Alamat Lengkap (Sesuai API)</Text>
            <View style={[styles.inputContainer, { height: 100, alignItems: 'flex-start', paddingTop: 10, backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="map-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
              <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Alamat otomatis oleh API" placeholderTextColor="#94A3B8" value={alamat} onChangeText={setAlamat} multiline editable={!namaSekolah} />
            </View>
          </View>

          <View style={styles.divider} />
          <Text style={styles.sectionHeader}>Detail Akun Login (Admin Sekolah)</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Username Admin Sekolah</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Cth: admin_sekolah1" placeholderTextColor="#94A3B8" value={email} onChangeText={setEmail} autoCapitalize="none" />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Kata Sandi</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Min. 6 karakter" placeholderTextColor="#94A3B8" value={password} onChangeText={setPassword} secureTextEntry />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Konfirmasi Kata Sandi</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Ulangi kata sandi" placeholderTextColor="#94A3B8" value={konfirmasiPassword} onChangeText={setKonfirmasiPassword} secureTextEntry />
            </View>
          </View>

          {loading ? (
            <TouchableOpacity style={styles.mainButton} disabled>
              <ActivityIndicator size="small" color={WHITE} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.mainButton} onPress={handleRegister} activeOpacity={0.8}>
              <Ionicons name="add-circle" size={24} color={WHITE} style={{ marginRight: 8 }} />
              <Text style={styles.mainButtonText}>Tambah Akun Admin Sekolah</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>

      {/* Modal Dropdown API */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sekolah di Kec. Klari</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Feather name="x" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Data diambil dari Endpoint API Integrasi</Text>

            {isLoadingApi ? (
              <ActivityIndicator size="large" color={BLUE_PRIMARY} style={{ marginTop: 40 }} />
            ) : isErrorApi ? (
              <TouchableOpacity onPress={fetchSchools} style={{ alignItems: 'center', marginTop: 30 }}>
                <Ionicons name="refresh-circle" size={40} color="#EF4444" />
                <Text style={{ marginTop: 10, color: '#EF4444', fontWeight: 'bold' }}>Gagal memuat API! Ketuk untuk muat ulang</Text>
              </TouchableOpacity>
            ) : schoolsData.length === 0 ? (
              <Text style={{ textAlign: 'center', marginTop: 30, color: '#64748B' }}>Belum ada data sekolah di area ini.</Text>
            ) : (
              <FlatList
                data={schoolsData}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.schoolItem} onPress={() => selectSchool(item)}>
                    <View style={styles.schoolIconBg}>
                      <Ionicons name="school" size={20} color={BLUE_PRIMARY} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.schoolNameText}>{item.nama}</Text>
                      <Text style={styles.schoolNpsnText}>NPSN: {item.npsn}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                  </TouchableOpacity>
                )}
                contentContainerStyle={{ paddingBottom: 30 }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLUE_PRIMARY,
  },
  headerSection: {
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: WHITE,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  formCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    marginTop: -20,
    elevation: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 }
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 36,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 58,
    backgroundColor: WHITE,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  apiBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BLUE_PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BLUE_DARK,
    marginBottom: 20,
  },
  mainButton: {
    backgroundColor: BLUE_PRIMARY,
    height: 60,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  mainButtonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
    fontWeight: '500'
  },
  schoolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  schoolIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  schoolNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  schoolNpsnText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500'
  },
});
