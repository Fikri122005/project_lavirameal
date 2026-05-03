import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView
} from 'react-native';
import { Feather, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import apiClient from '../../../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BLUE_PRIMARY = '#0B1E3F';
const GOLD = '#D4AF37';
const WHITE = '#FFFFFF';

export default function ManajemenKelasScreen({ navigation }) {
  const [viewMode, setViewMode] = useState('tingkat'); // tingkat, kelas, siswa
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allData, setAllData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTingkat, setSelectedTingkat] = useState(null);
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [filteredKelas, setFilteredKelas] = useState([]);
  const [listSiswa, setListSiswa] = useState([]);
  const [quickActionModal, setQuickActionModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedKelasTransfer, setSelectedKelasTransfer] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  // NEW: Tambah Siswa Form State
  const [addSiswaModal, setAddSiswaModal] = useState(false);
  const [newSiswa, setNewSiswa] = useState({
    nis: '',
    nama: '',
    email: '',
    password: ''
  });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchKelas();
  }, []);

  const fetchKelas = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem('user_data');
      if (!userDataStr) return;
      const userData = JSON.parse(userDataStr);
      const sekolah_id = userData.sekolah_id;

      const response = await apiClient.get(`sekolah/sekolah_get_kelas.php?sekolah_id=${sekolah_id}`);
      if (response.data && response.data.status === 'success') {
        const rawData = response.data.data;
        setAllData(rawData);

        const grouped = rawData.reduce((acc, item) => {
          const tingkatMatch = item.kelas.match(/^\d+/);
          const t = tingkatMatch ? tingkatMatch[0] : 'Lainnya';

          if (!acc[t]) {
            acc[t] = {
              tingkat: t,
              jumlah_kelas: 0,
              total_siswa: 0,
              type: t <= 6 ? 'SD' : (t <= 9 ? 'SMP' : 'SMA')
            };
          }
          acc[t].jumlah_kelas += 1;
          acc[t].total_siswa += parseInt(item.jumlah_siswa);
          return acc;
        }, {});

        setCategories(Object.values(grouped).sort((a, b) => a.tingkat - b.tingkat));
      }
    } catch (error) {
      console.error("Error fetching kelas:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchKelas();
  };

  const handleSelectTingkat = (tingkat) => {
    setSelectedTingkat(tingkat);
    const matchKelas = allData.filter(item => item.kelas.startsWith(tingkat));
    setFilteredKelas(matchKelas);
    setViewMode('kelas');
  };

  const handleSelectKelas = async (namaKelas) => {
    setSelectedKelas(namaKelas);
    try {
      setLoading(true);
      const userDataStr = await AsyncStorage.getItem('user_data');
      if (!userDataStr) return;
      const userData = JSON.parse(userDataStr);
      const sekolah_id = userData.sekolah_id;

      const response = await apiClient.get(`sekolah/sekolah_get_siswa.php?sekolah_id=${sekolah_id}&kelas=${namaKelas}`);
      if (response.data && response.data.status === 'success') {
        setListSiswa(response.data.data);
        setViewMode('siswa');
      }
    } catch (error) {
      console.error("Error fetching siswa:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (viewMode === 'siswa') setViewMode('kelas');
    else if (viewMode === 'kelas') setViewMode('tingkat');
    else navigation.goBack();
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setLoading(true);
      const userDataStr = await AsyncStorage.getItem('user_data');
      const userData = JSON.parse(userDataStr);
      const sekolah_id = userData.sekolah_id;

      const formData = new FormData();
      formData.append('sekolah_id', sekolah_id);
      
      if (Platform.OS === 'web') {
        const rawFile = file.file || file.output?.item(0) || file;
        formData.append('file', rawFile);
      } else {
        formData.append('file', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'text/csv',
        });
      }

      const response = await apiClient.post(`sekolah/sekolah_import_siswa.php?sekolah_id=${sekolah_id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.status === 'success') {
        if (Platform.OS === 'web') alert('Berhasil: ' + response.data.message);
        else Alert.alert('Berhasil', response.data.message);
        fetchKelas(); 
      } else {
        if (Platform.OS === 'web') alert('Gagal: ' + response.data.message);
        else Alert.alert('Gagal', response.data.message);
      }
    } catch (error) {
      const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
      if (Platform.OS === 'web') alert('Error: ' + errorMsg);
      else Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const template = "nis,nama,kelas,jenis_kelamin,tanggal_lahir,nama_wali,no_telp_wali\n12345,Contoh Nama Siswa,10-IPA-1,L,2010-01-01,Nama Orang Tua,08123456789";
      const fileName = "template_siswa_lavira.csv";
      if (Platform.OS === 'web') {
        const blob = new Blob([template], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const fileUri = FileSystem.cacheDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, template, { encoding: FileSystem.EncodingType.UTF8 });
        if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(fileUri);
      }
    } catch (error) {
      if (Platform.OS === 'web') alert('Gagal mengunduh template');
      else Alert.alert('Error', 'Gagal membuat template.');
    }
  };

   const handleExportStudents = async () => {
    // ... existing logic ...
   };

   const handleAddSiswa = async () => {
      if (!newSiswa.nis || !newSiswa.nama) {
        Alert.alert("Error", "NIS dan Nama wajib diisi");
        return;
      }
      
      setIsAdding(true);
      try {
        const userDataStr = await AsyncStorage.getItem('user_data');
        const userData = JSON.parse(userDataStr);
        
        const response = await apiClient.post('sekolah/sekolah_add_siswa.php', {
          sekolah_id: userData.sekolah_id,
          nis: newSiswa.nis,
          nama: newSiswa.nama,
          email: newSiswa.email,
          kelas: selectedKelas, 
          password: newSiswa.password || 'siswa123'
        });

        if (response.data.status === 'success') {
          Alert.alert("Berhasil", response.data.message);
          setAddSiswaModal(false);
          setNewSiswa({ nis: '', nama: '', email: '', password: '' });
          handleSelectKelas(selectedKelas); // Refresh list
        } else {
          Alert.alert("Gagal", response.data.message);
        }
      } catch (error) {
        Alert.alert("Error", error.response?.data?.message || "Gagal menambah siswa");
      } finally {
        setIsAdding(false);
      }
   };

   const handleTransferDanaKelas = async () => {
      if (!selectedKelasTransfer || !transferAmount) {
        Alert.alert("Error", "Mohon pilih kelas dan isi nominal transfer");
        return;
      }
      
      setIsTransferring(true);
      try {
        const userDataStr = await AsyncStorage.getItem('user_data');
        const userData = JSON.parse(userDataStr);
        
        const response = await apiClient.post('sekolah/sekolah_transfer_dana_kelas.php', {
          sekolah_id: userData.sekolah_id,
          kelas: selectedKelasTransfer,
          amount: parseInt(transferAmount)
        });

        if (response.data.status === 'success') {
          Alert.alert("Berhasil", response.data.message);
          setShowTransferModal(false);
          setTransferAmount('');
          setSelectedKelasTransfer('');
          fetchKelas(); 
        }
      } catch (error) {
        Alert.alert("Gagal", error.response?.data?.message || "Gagal melakukan transfer dana kelas.");
      } finally {
        setIsTransferring(false);
      }
   };


  const renderTingkat = ({ item }) => {
    const isSD = item.type === 'SD';
    const isSMP = item.type === 'SMP';
    const iconColor = BLUE_PRIMARY;
    const iconName = isSD ? 'book' : (isSMP ? 'mortar-board' : 'university');

    return (
      <TouchableOpacity style={styles.premiumCard} onPress={() => handleSelectTingkat(item.tingkat)}>
        <View style={styles.cardHeaderArea}>
          <View style={[styles.iconCircle, { backgroundColor: '#E0E7FF' }]}>
            <FontAwesome5 name={iconName} size={20} color={iconColor} />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.tingkatText}>Kelas {item.tingkat}</Text>
            <Text style={styles.tingkatSub}>Kategori {item.type}</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#CBD5E1" />
        </View>
        <View style={styles.badgeRow}>
          <View style={styles.miniBadge}>
             <Feather name="layers" size={10} color="#64748B" style={{marginRight: 4}} />
             <Text style={styles.miniBadgeText}>{item.jumlah_kelas} Kelas</Text>
          </View>
          <View style={[styles.miniBadge, { backgroundColor: '#F0F9FF' }]}>
             <Feather name="users" size={10} color="#0284C7" style={{marginRight: 4}} />
             <Text style={[styles.miniBadgeText, { color: '#0284C7' }]}>{item.total_siswa} Siswa</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderKelas = ({ item }) => (
    <TouchableOpacity style={styles.classCard} onPress={() => handleSelectKelas(item.kelas)}>
      <View style={styles.rowBetween}>
        <View style={styles.rowCenter}>
          <View style={styles.dot} />
          <Text style={styles.classTitle}>Ruang {item.kelas}</Text>
        </View>
        <View style={styles.miniBadge}>
           <Text style={styles.miniBadgeText}>{item.jumlah_siswa} Siswa</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.footerText}>Klik untuk manajemen nama siswa</Text>
        <Feather name="arrow-right" size={14} color={BLUE_PRIMARY} />
      </View>
    </TouchableOpacity>
  );

  const renderSiswa = ({ item, index }) => (
    <View style={styles.studentRow}>
      <Text style={styles.indexText}>{String(index + 1).padStart(2, '0')}</Text>
      <View style={styles.avatarMini}>
        <Text style={styles.avatarLetter}>{item.nama.charAt(0)}</Text>
      </View>
      <View style={{ flex: 1, marginLeft: 16 }}>
        <Text style={styles.studentName}>{item.nama}</Text>
        <Text style={styles.studentNis}>NIS {item.nis} • <Text style={{ color: item.aktif ? '#16A34A' : '#EF4444' }}>{item.aktif ? 'Aktif' : 'Non-Aktif'}</Text></Text>
      </View>
    </View>
  );

  const renderHeaderActions = () => {
     if (viewMode === 'siswa') {
      return (
        <View style={{ flexDirection: 'row' }}>
           <TouchableOpacity style={[styles.backBtnLight, { marginRight: 8 }]} onPress={() => setAddSiswaModal(true)}>
             <Feather name="user-plus" size={20} color="#fff" />
           </TouchableOpacity>
           <TouchableOpacity style={styles.backBtnLight} onPress={handleExportStudents}>
             <Feather name="download" size={20} color="#fff" />
           </TouchableOpacity>
        </View>
      );
    }
    if (viewMode === 'tingkat') {
      return (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={[styles.backBtnLight, { marginRight: 8 }]} onPress={handleDownloadTemplate}>
            <Feather name="info" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.backBtnLight} onPress={handleImport}>
            <Feather name="upload" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      );
    }
    return <View style={{ width: 40 }} />;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* MINIMALIST HEADER */}
      <View style={styles.headerDashboard}>
        <Image
          source={require('../../../../assets/batik_cirebon.png')}
          style={[StyleSheet.absoluteFillObject, { opacity: 0.1, resizeMode: 'repeat' }]}
        />
        <View style={styles.headerTopMinimal}>
          <TouchableOpacity style={styles.backBtnLight} onPress={handleBack}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitleLight}>Manajemen Kelas</Text>
          {renderHeaderActions()}
        </View>

        {viewMode === 'tingkat' ? (
          <View style={styles.headerStats}>
            <View style={styles.statChip}>
              <Ionicons name="people" size={14} color="#fff" />
              <Text style={styles.statChipText}>{allData.reduce((acc, i) => acc + parseInt(i.jumlah_siswa), 0)} Siswa</Text>
            </View>
            <View style={styles.statChip}>
              <Ionicons name="apps" size={14} color="#fff" />
              <Text style={styles.statChipText}>{allData.length} Ruang</Text>
            </View>
          </View>
        ) : viewMode === 'kelas' ? (
          <View style={styles.headerStats}>
            <View style={styles.statChip}>
              <Ionicons name="layers" size={14} color="#fff" />
              <Text style={styles.statChipText}>{filteredKelas.length} Kelas di Tingkat {selectedTingkat}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.headerStats}>
            <View style={styles.statChip}>
              <Ionicons name="person" size={14} color="#fff" />
              <Text style={styles.statChipText}>{listSiswa.length} Siswa di {selectedKelas}</Text>
            </View>
            {listSiswa.length > 0 && listSiswa[0].nama_guru && (
              <View style={[styles.statChip, { backgroundColor: GOLD + '90' }]}>
                <Ionicons name="school" size={14} color="#fff" />
                <Text style={styles.statChipText}>Wali: {listSiswa[0].nama_guru}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <FlatList
        data={viewMode === 'tingkat' ? categories : viewMode === 'kelas' ? filteredKelas : listSiswa}
        keyExtractor={(item, index) => index.toString()}
        renderItem={viewMode === 'tingkat' ? renderTingkat : viewMode === 'kelas' ? renderKelas : renderSiswa}
        contentContainerStyle={[styles.listContent, viewMode === 'tingkat' && { marginTop: -20 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[BLUE_PRIMARY]} />
        }
        ListHeaderComponent={loading && !refreshing ? <ActivityIndicator size="large" color={BLUE_PRIMARY} style={{marginTop: 50}} /> : null}
        ListEmptyComponent={!loading && (
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="folder-open" size={60} color="#E2E8F0" />
            <Text style={styles.emptyText}>Data Tidak Ditemukan</Text>
          </View>
        )}
      />


      {/* CONSISTENT BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('HomeSekolah')}>
          <Ionicons name="grid-outline" size={24} color="#94A3B8" />
          <Text style={styles.navLabel}>Beranda</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ManajemenKelas')}>
          <Ionicons name="people" size={24} color={BLUE_PRIMARY} />
          <Text style={[styles.navLabel, { color: BLUE_PRIMARY, fontWeight: '800' }]}>Kelas</Text>
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

      {/* QUICK ACTION MODAL */}
      <Modal visible={quickActionModal} transparent animationType="fade">
         <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setQuickActionModal(false)}>
            <View style={styles.actionSheet}>
               <Text style={styles.sheetTitle}>Portal Administratif</Text>
               <View style={styles.sheetGrid}>
                  {[
                    { label: 'Transfer', icon: 'send-outline', color: '#4f46e5', press: () => { setQuickActionModal(false); setShowTransferModal(true); } },
                    { label: 'Guru', icon: 'school-outline', color: '#6366f1', press: () => { navigation.navigate('ManajemenGuru'); setQuickActionModal(false); } },
                    { label: 'Beranda', icon: 'home-outline', color: '#10b981', press: () => { navigation.navigate('HomeSekolah'); setQuickActionModal(false); } },
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

       {/* MODAL TAMBAH SISWA */}
       <Modal visible={addSiswaModal} transparent animationType="slide">
         <View style={styles.overlay}>
           <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
             <View style={styles.addModalContent}>
               <View style={styles.sheetHeader}>
                  <Text style={styles.pinTitle}>Tambah Siswa Baru</Text>
                  <TouchableOpacity onPress={() => setAddSiswaModal(false)}>
                     <Ionicons name="close" size={24} color={BLUE_PRIMARY} />
                  </TouchableOpacity>
               </View>
               <Text style={styles.pinSubtitle}>Menambahkan siswa ke kelas {selectedKelas}. Akun login akan dibuat otomatis.</Text>

               <ScrollView style={{ marginTop: 20 }}>
                  <View style={styles.pinInputGroup}>
                      <Text style={styles.pinInputLabel}>Nomor Induk Siswa (NIS)</Text>
                      <View style={styles.pinInputWrap}>
                          <Ionicons name="card-outline" size={18} color="#94a3b8" />
                          <TextInput 
                             style={styles.pinInput} 
                             placeholder="Contoh: 2024001" 
                             keyboardType="numeric"
                             value={newSiswa.nis}
                             onChangeText={(v) => setNewSiswa({...newSiswa, nis: v})}
                          />
                      </View>
                      <Text style={{ fontSize: 9, color: '#94a3b8', marginTop: 4 }}>* NIS akan digunakan sebagai Username login siswa.</Text>
                  </View>

                  <View style={styles.pinInputGroup}>
                      <Text style={styles.pinInputLabel}>Nama Lengkap Siswa</Text>
                      <View style={styles.pinInputWrap}>
                          <Ionicons name="person-outline" size={18} color="#94a3b8" />
                          <TextInput 
                             style={styles.pinInput} 
                             placeholder="Nama Lengkap" 
                             value={newSiswa.nama}
                             onChangeText={(v) => setNewSiswa({...newSiswa, nama: v})}
                          />
                      </View>
                  </View>

                  <View style={styles.pinInputGroup}>
                      <Text style={styles.pinInputLabel}>Alamat Email</Text>
                      <View style={styles.pinInputWrap}>
                          <Ionicons name="mail-outline" size={18} color="#94a3b8" />
                          <TextInput 
                             style={styles.pinInput} 
                             placeholder="email@pelajar.com" 
                             keyboardType="email-address"
                             autoCapitalize="none"
                             value={newSiswa.email}
                             onChangeText={(v) => setNewSiswa({...newSiswa, email: v})}
                          />
                      </View>
                      <Text style={{ fontSize: 9, color: '#94a3b8', marginTop: 4 }}>* Digunakan untuk pemulihan kata sandi (Forgot Password).</Text>
                  </View>

                  <View style={styles.pinInputGroup}>
                      <Text style={styles.pinInputLabel}>Password Login (Opsional)</Text>
                      <View style={styles.pinInputWrap}>
                          <Ionicons name="lock-closed-outline" size={18} color="#94a3b8" />
                          <TextInput 
                             style={styles.pinInput} 
                             placeholder="Default: siswa123" 
                             secureTextEntry
                             value={newSiswa.password}
                             onChangeText={(v) => setNewSiswa({...newSiswa, password: v})}
                          />
                      </View>
                  </View>

                  <TouchableOpacity 
                    style={[styles.pinSubmit, isAdding && { opacity: 0.7 }]} 
                    onPress={handleAddSiswa}
                    disabled={isAdding}
                  >
                     {isAdding ? <ActivityIndicator color={WHITE} /> : (
                        <>
                           <Text style={styles.pinSubmitTxt}>Simpan Data Siswa</Text>
                           <Ionicons name="save-outline" size={18} color={WHITE} />
                        </>
                     )}
                  </TouchableOpacity>
                  <View style={{ height: 40 }} />
               </ScrollView>
             </View>
           </KeyboardAvoidingView>
         </View>
       </Modal>

        {/* TRANSFER DANA KELAS MODAL */}
        <Modal visible={showTransferModal} transparent animationType="slide">
          <View style={styles.overlay}>
            <KeyboardAvoidingView behavior="padding" style={{ width: '100%' }}>
              <View style={styles.addModalContent}>
                <View style={styles.sheetHeader}>
                  <Text style={styles.pinTitle}>Transfer Dana Kelas</Text>
                  <TouchableOpacity onPress={() => { setShowTransferModal(false); setTransferAmount(''); setSelectedKelasTransfer(''); }}>
                    <Ionicons name="close" size={24} color={BLUE_PRIMARY} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.pinSubtitle}>Saldo total yang Anda masukkan akan dibagi rata secara otomatis ke seluruh siswa di kelas yang dipilih.</Text>
                
                <Text style={styles.pinInputLabel}>Pilih Kelas</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15, marginTop: 10 }}>
                  {allData.map((item, idx) => (
                    <TouchableOpacity 
                      key={idx} 
                      style={[
                        styles.classSelector, 
                        selectedKelasTransfer === item.kelas && { backgroundColor: BLUE_PRIMARY, borderColor: BLUE_PRIMARY }
                      ]}
                      onPress={() => setSelectedKelasTransfer(item.kelas)}
                    >
                      <Text style={[styles.classSelectorText, selectedKelasTransfer === item.kelas && { color: WHITE }]}>
                        {item.kelas}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={styles.pinInputGroup}>
                  <Text style={styles.pinInputLabel}>Total Budget untuk Kelas</Text>
                  <View style={styles.pinInputWrap}>
                    <Text style={{ fontWeight: 'bold', color: BLUE_PRIMARY, marginRight: 5 }}>Rp</Text>
                    <TextInput 
                      style={styles.pinInput} 
                      placeholder="Contoh: 35000" 
                      keyboardType="numeric" 
                      value={transferAmount}
                      onChangeText={setTransferAmount}
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.pinSubmit, { backgroundColor: '#4f46e5' }]} 
                  onPress={handleTransferDanaKelas}
                  disabled={isTransferring}
                >
                  {isTransferring ? <ActivityIndicator color={WHITE} /> : (
                    <>
                      <Text style={styles.pinSubmitTxt}>Transfer Sekarang</Text>
                      <Ionicons name="send-outline" size={18} color={WHITE} />
                    </>
                  )}
                </TouchableOpacity>
                <View style={{ height: 40 }} />
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  headerDashboard: {
    backgroundColor: BLUE_PRIMARY,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    elevation: 8,
  },
  headerTopMinimal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtnLight: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },
  headerTitleLight: { fontSize: 20, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  headerStats: { flexDirection: 'row', marginTop: 20, justifyContent: 'center' },
  statChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10 },
  statChipText: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
  listContent: { padding: 20, paddingBottom: 150 },
  premiumCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  cardHeaderArea: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 54, height: 54, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  tingkatText: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  tingkatSub: { fontSize: 11, color: '#94A3B8', marginTop: 2, fontWeight: '600', textTransform: 'uppercase' },
  badgeRow: { flexDirection: 'row', marginTop: 18, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 15 },
  miniBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, marginRight: 10, flexDirection: 'row', alignItems: 'center' },
  miniBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#64748B' },
  classCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, borderLeftWidth: 5, borderLeftColor: '#6CABDD', elevation: 3 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6CABDD', marginRight: 12 },
  classTitle: { fontSize: 17, fontWeight: 'bold', color: '#1E293B' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  footerText: { fontSize: 11, color: '#94A3B8' },
  studentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  indexText: { fontSize: 12, fontWeight: 'bold', color: '#CBD5E1', width: 25 },
  avatarMini: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { color: '#16A34A', fontWeight: 'bold', fontSize: 16 },
  studentName: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
  studentNis: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 20, fontSize: 15, color: '#94A3B8', fontWeight: '600' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, backgroundColor: '#fff', flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 30, borderTopLeftRadius: 35, borderTopRightRadius: 35, elevation: 40, alignItems: 'center' },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navLabel: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', marginTop: 4 },
  navItemMain: { marginTop: -50 },
  navMainInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: BLUE_PRIMARY, justifyContent: 'center', alignItems: 'center', borderWidth: 6, borderColor: '#fff', elevation: 15 },
  
  // Action Sheet Styles
  overlay: { flex: 1, backgroundColor: 'rgba(11, 30, 63, 0.4)', justifyContent: 'flex-end' },
  actionSheet: { backgroundColor: '#fff', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, paddingBottom: 50 },
  sheetTitle: { fontSize: 13, fontWeight: '900', color: '#94a3b8', textAlign: 'center', marginBottom: 25, textTransform: 'uppercase', letterSpacing: 1.5 },
  sheetGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  sheetItem: { width: '22%', alignItems: 'center', marginBottom: 5 },
  sheetIconBox: { width: 54, height: 54, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  sheetLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748b' },

  // Add Student Modal Styles
  addModalContent: { backgroundColor: WHITE, borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, maxHeight: '90%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pinTitle: { fontSize: 20, fontWeight: '900', color: BLUE_PRIMARY },
  pinSubtitle: { fontSize: 12, color: '#64748b', marginTop: 8, lineHeight: 18 },
  pinInputGroup: { marginBottom: 18 },
  pinInputLabel: { fontSize: 11, fontWeight: 'bold', color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase' },
  pinInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 16, paddingHorizontal: 15, height: 55, borderWidth: 1, borderColor: '#f1f5f9' },
  pinInput: { flex: 1, marginLeft: 12, fontSize: 14, color: BLUE_PRIMARY, fontWeight: 'bold' },
  pinSubmit: { backgroundColor: BLUE_PRIMARY, height: 55, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15, gap: 10, elevation: 8, shadowColor: BLUE_PRIMARY, shadowOpacity: 0.3, shadowRadius: 10 },
  pinSubmitTxt: { color: WHITE, fontSize: 15, fontWeight: 'bold' },

  classSelector: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWeight: 1, borderColor: '#E2E8F0', borderWidth: 1, marginRight: 10, backgroundColor: '#F8FAFC' },
  classSelectorText: { fontSize: 13, fontWeight: 'bold', color: '#64748B' },
});
