import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  BackHandler
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

const BLUE_PRIMARY = '#1C2C5B';
const BLUE_DARK = '#1C2C5B';
const WHITE = '#FFFFFF';

export default function ProfilScreen({ navigation }) {
  const [namaLengkap, setNamaLengkap] = useState('RAHMA');
  const [nipPegawai, setNipPegawai] = useState('');
  const [email, setEmail] = useState('rahmawatiauliya32@gmail.com');
  const [namaLembaga, setNamaLembaga] = useState('Koor. MBG Klari');
  const [kontakKantor, setKontakKantor] = useState('');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header Motif Batik */}
      <View style={styles.headerSection}>
        <Image
          source={require('../../../../assets/batik_cirebon.png')}
          style={[StyleSheet.absoluteFillObject, { opacity: 0.08, resizeMode: 'repeat' }]}
        />
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Pengaturan Profil</Text>
          <Text style={styles.headerSubtitle}>Perbarui profil Anda dan instansi SPPG yang Anda kelola.</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          <View style={styles.formContainer}>

            {/* BAGIAN 1: INFORMASI AKUN */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>INFORMASI AKUN</Text>
              <View style={styles.divider} />
            </View>

            {/* Field: Nama Lengkap */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Nama Lengkap Admin <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={namaLengkap}
                onChangeText={setNamaLengkap}
                placeholder="Masukkan nama lengkap"
              />
            </View>

            {/* Field: Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email (Login ID)</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Field: NIP Pegawai */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>NIP Pegawai</Text>
              <TextInput
                style={styles.input}
                value={nipPegawai}
                onChangeText={setNipPegawai}
                placeholder="Masukkan NIP Pegawai"
                keyboardType="numeric"
              />
            </View>


            {/* BAGIAN 2: INSTANSI SATUAN PELAKSANA */}
            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
              <Text style={styles.sectionTitle}>INSTANSI SATUAN PELAKSANA</Text>
              <View style={styles.divider} />
            </View>

            {/* Field: Nama Lembaga */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nama Lembaga (Kantor SPPG)</Text>
              <TextInput
                style={styles.input}
                value={namaLembaga}
                onChangeText={setNamaLembaga}
                placeholder="Contoh: Koor. MBG Klari"
              />
            </View>

            {/* Field: Kontak Kantor */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kontak / No Telepon Kantor</Text>
              <TextInput
                style={styles.input}
                value={kontakKantor}
                onChangeText={setKontakKantor}
                placeholder="Masukkan No Telepon"
                keyboardType="phone-pad"
              />
            </View>

            {/* Coverage Area Highlight Box */}
            <View style={styles.coverageBox}>
              <Text style={styles.coverageTitle}>COVERAGE AREA ADMIN</Text>
              <View style={styles.coverageChipsRow}>
                <View style={styles.coverageChip}>
                  <Feather name="map-pin" size={14} color={BLUE_PRIMARY} />
                  <Text style={styles.coverageChipText}>Klari</Text>
                </View>
                <View style={styles.coverageChip}>
                  <Feather name="briefcase" size={14} color={BLUE_PRIMARY} />
                  <Text style={styles.coverageChipText}>Seluruh Sekolah</Text>
                </View>
              </View>
            </View>

            {/* ACTION BUTTONS */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.btnLogout} onPress={() => Alert.alert('Keluar', 'Apakah Anda yakin ingin keluar dari aplikasi?', [{text: 'Batal', style: 'cancel'}, {text: 'Keluar', style: 'destructive', onPress: () => BackHandler.exitApp() }])}>
                <Text style={styles.btnLogoutText}>Keluar</Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity style={styles.btnCancel}>
                  <Text style={styles.btnCancelText}>Batal</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnSave}>
                  <Text style={styles.btnSaveText}>Simpan Perubahan</Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => navigation.navigate('Home')}>
          <Feather name="home" size={24} color="#94A3B8" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => navigation.navigate('Sekolah')}>
          <Feather name="book" size={24} color="#94A3B8" />
          <Text style={styles.navLabel}>Sekolah</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => navigation.navigate('Laporan')}>
          <Feather name="file-text" size={24} color="#94A3B8" />
          <Text style={styles.navLabel}>Laporan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => navigation.navigate('Kantin')}>
          <Feather name="coffee" size={24} color="#94A3B8" />
          <Text style={styles.navLabel}>Kantin</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <Feather name="user" size={24} color={BLUE_PRIMARY} />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Profil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  headerSection: {
    backgroundColor: BLUE_PRIMARY,
    paddingTop: 56,
    paddingHorizontal: 24,
    height: 240,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    position: 'relative',
    overflow: 'hidden',
    elevation: 5,
  },
  headerTop: {
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: WHITE,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 6,
    lineHeight: 20,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  formContainer: {
    backgroundColor: WHITE,
    borderRadius: 20,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 1,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  requiredAsterisk: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1E293B',
  },
  coverageBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
    marginBottom: 8,
  },
  coverageTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: BLUE_PRIMARY,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  coverageChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coverageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  coverageChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: BLUE_PRIMARY,
    marginLeft: 6,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 20,
  },
  btnCancel: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  btnCancelText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 14,
  },
  btnLogout: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnLogoutText: {
    color: WHITE,
    fontWeight: '700',
    fontSize: 14,
  },
  btnSave: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnSaveText: {
    color: WHITE,
    fontWeight: 'bold',
    fontSize: 14,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 40,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '500',
  },
  navLabelActive: {
    color: BLUE_PRIMARY,
    fontWeight: 'bold',
  },
});
