import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Image,
  Alert
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

const BLUE_PRIMARY = '#1C2C5B';
const BLUE_DARK = '#1C2C5B';
const WHITE = '#FFFFFF';

export default function VerifikasiKantinScreen({ route, navigation }) {
  // Parsing parameters
  const { kantinData } = route.params || {};

  // For dummy purposes, if status is 'Aktif', all checks are considered done
  const isAlreadyActive = kantinData?.status === 'Aktif';

  const [checkDapur, setCheckDapur] = useState(isAlreadyActive);
  const [checkBahan, setCheckBahan] = useState(isAlreadyActive);
  const [checkPengolahan, setCheckPengolahan] = useState(isAlreadyActive);

  const handleVerifikasi = () => {
    if (!checkDapur || !checkBahan || !checkPengolahan) {
      Alert.alert(
        "Verifikasi Belum Lengkap",
        "Pastikan Ahli Gizi telah mengecek dan mencentang semua kriteria (Dapur, Bahan, Pengolahan) sebelum menandatangani persetujuan."
      );
      return;
    }

    // Simulate API Call for Digital Signing
    Alert.alert(
      "Verifikasi Disetujui",
      `Digital Signing berhasil. Kantin "${kantinData.nama_kantin}" kini berstatus AKTIF dan resmi diizinkan melayani makan siang gratis.`,
      [
        { text: "OK", onPress: () => navigation.goBack() }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BLUE_DARK} translucent />

      {/* Header Motif Batik */}
      <View style={styles.headerSection}>
        <Image
          source={require('../../../../assets/batik_cirebon.png')}
          style={[StyleSheet.absoluteFillObject, { opacity: 0.15, resizeMode: 'cover', transform: [{ scale: 2 }] }]}
        />
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={WHITE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verifikasi Lapangan</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.kantinInfoContainer}>
          <View style={[styles.iconContainer, { backgroundColor: isAlreadyActive ? '#D1FAE5' : WHITE }]}>
            <Ionicons name={isAlreadyActive ? "checkmark-circle" : "storefront"} size={32} color={isAlreadyActive ? "#059669" : BLUE_PRIMARY} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.kantinName}>{kantinData?.nama_kantin || "Nama Kantin"}</Text>
            <Text style={styles.sekolahName}>{kantinData?.sekolah || "Sekolah"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.formCard}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionTitle}>Inspeksi Layak Sehat (Ahli Gizi)</Text>
          <Text style={styles.sectionSubtitle}>
            Berikan persetujuan jika standar gizi dan keamanan telah memenuhi kriteria.
          </Text>

          {/* CHECKLIST: Kebersihan Dapur */}
          <TouchableOpacity
            style={[styles.checklistItem, checkDapur && styles.checklistItemActive]}
            activeOpacity={0.8}
            onPress={() => !isAlreadyActive && setCheckDapur(!checkDapur)}
          >
            <Ionicons
              name={checkDapur ? "checkbox" : "square-outline"}
              size={26}
              color={checkDapur ? BLUE_PRIMARY : "#94A3B8"}
            />
            <View style={styles.checklistTextContainer}>
              <Text style={styles.checklistTitle}>1. Kebersihan Dapur Valid</Text>
              <Text style={styles.checklistDesc}>
                Lingkungan dapur bebas hama, sanitasi air mengalir baik, dan peralatan masak steril.
              </Text>
            </View>
          </TouchableOpacity>

          {/* CHECKLIST: Kualitas Bahan Baku */}
          <TouchableOpacity
            style={[styles.checklistItem, checkBahan && styles.checklistItemActive]}
            activeOpacity={0.8}
            onPress={() => !isAlreadyActive && setCheckBahan(!checkBahan)}
          >
            <Ionicons
              name={checkBahan ? "checkbox" : "square-outline"}
              size={26}
              color={checkBahan ? BLUE_PRIMARY : "#94A3B8"}
            />
            <View style={styles.checklistTextContainer}>
              <Text style={styles.checklistTitle}>2. Kualitas Bahan Baku</Text>
              <Text style={styles.checklistDesc}>
                Sumber bahan baku segar, penyimpanan rantai dingin (kulkas/freezer) suhu sesuai standar.
              </Text>
            </View>
          </TouchableOpacity>

          {/* CHECKLIST: Cara Pengolahan */}
          <TouchableOpacity
            style={[styles.checklistItem, checkPengolahan && styles.checklistItemActive]}
            activeOpacity={0.8}
            onPress={() => !isAlreadyActive && setCheckPengolahan(!checkPengolahan)}
          >
            <Ionicons
              name={checkPengolahan ? "checkbox" : "square-outline"}
              size={26}
              color={checkPengolahan ? BLUE_PRIMARY : "#94A3B8"}
            />
            <View style={styles.checklistTextContainer}>
              <Text style={styles.checklistTitle}>3. Cara Pengolahan (SOP)</Text>
              <Text style={styles.checklistDesc}>
                Juru masak memahami standar takaran gizi MBG, tidak memakai pengawet terlarang, MSG dibatasi.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Digital Signature Warning */}
          <View style={styles.warningContainer}>
            <Feather name="shield" size={20} color="#D97706" style={{ marginTop: 2 }} />
            <Text style={styles.warningText}>
              Dengan menekan "Verifikasi Kelayakan", Anda secara resmi menyetujui bahwa kantin ini tersertifikasi sehat (Digital Signing).
            </Text>
          </View>

          {/* Action Button */}
          {!isAlreadyActive ? (
            <TouchableOpacity
              style={[styles.mainButton, (!checkDapur || !checkBahan || !checkPengolahan) && { backgroundColor: '#94A3B8', shadowOpacity: 0 }]}
              onPress={handleVerifikasi}
            >
              <Text style={styles.mainButtonText}>Verifikasi Kelayakan</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.mainButton, { backgroundColor: '#059669', shadowColor: '#059669' }]}>
              <Text style={styles.mainButtonText}>Kantin Sudah Terverifikasi</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLUE_PRIMARY,
  },
  headerSection: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: BLUE_PRIMARY,
    position: 'relative',
    overflow: 'hidden',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: WHITE,
  },
  kantinInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: 25,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  kantinName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: WHITE,
    marginBottom: 4,
  },
  sekolahName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  formCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: -20,
    elevation: 10,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 20,
    marginTop: 4,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: WHITE,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  checklistItemActive: {
    borderColor: BLUE_PRIMARY,
    backgroundColor: '#F0F4F8',
  },
  checklistTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  checklistTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  checklistDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 24,
  },
  warningText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: '#B45309',
    lineHeight: 20,
    fontWeight: '500',
  },
  mainButton: {
    backgroundColor: BLUE_PRIMARY,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BLUE_PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  mainButtonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
