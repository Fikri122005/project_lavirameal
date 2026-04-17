import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Image, FlatList } from 'react-native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';

const BLUE_PRIMARY = '#1C2C5B';
const BLUE_DARK = '#1C2C5B';
const WHITE = '#FFFFFF';

// --- DUMMY DATA ---
const DUMMY_DISTRIBUSI = [
  { id: '1', sekolah: 'SDN 1 Klari', tanggal: '22 Mar 2026', siswa: 120, status: 'Sudah Terkirim' },
  { id: '2', sekolah: 'SMPN 2 Karawang', tanggal: '22 Mar 2026', siswa: 340, status: 'Sudah Terkirim' },
  { id: '3', sekolah: 'SDN 3 Karawang', tanggal: '22 Mar 2026', siswa: 215, status: 'Belum Terkirim' },
  { id: '4', sekolah: 'SMKN 1 Karawang', tanggal: '21 Mar 2026', siswa: 560, status: 'Sudah Terkirim' },
];

const DUMMY_TRANSAKSI = [
  { id: '1', kantin: 'Kantin Ibu Ani (SDN 1 Klari)', tagihan: 1800000, porsi: 120, status: 'Lunas' },
  { id: '2', kantin: 'Kantin Sehat Budi', tagihan: 5100000, porsi: 340, status: 'Pending' },
  { id: '3', kantin: 'Kantin Berkah', tagihan: 3225000, porsi: 215, status: 'Pending' },
];

const DUMMY_KELUHAN = [];

export default function LaporanScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Distribusi');

  // --- RENDERERS ---
  const formatRupiah = (num) => {
    return 'Rp ' + num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  };

  const renderDistribusi = ({ item }) => {
    const isSent = item.status === 'Sudah Terkirim';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}>
              <Feather name="box" size={20} color={BLUE_PRIMARY} />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.cardTitle}>{item.sekolah}</Text>
              <Text style={styles.cardDate}>{item.tanggal}</Text>
            </View>
          </View>
        </View>
        <View style={styles.cardDivider} />
        <View style={styles.cardFooter}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="people" size={16} color="#64748B" />
            <Text style={styles.countText}>{item.siswa} Porsi (Siswa)</Text>
          </View>
          <View style={[styles.badge, isSent ? styles.badgeSuccess : styles.badgeWarning]}>
            <Text style={[styles.badgeText, isSent ? styles.badgeTextSuccess : styles.badgeTextWarning]}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTransaksi = ({ item }) => {
    const isPaid = item.status === 'Lunas';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
              <MaterialIcons name="attach-money" size={22} color="#16A34A" />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.cardTitle}>{item.kantin}</Text>
              <Text style={styles.cardDate}>Total {item.porsi} Porsi Terjual</Text>
            </View>
          </View>
        </View>
        <View style={styles.cardDivider} />
        <View style={styles.cardFooter}>
          <Text style={styles.moneyText}>{formatRupiah(item.tagihan)}</Text>
          <View style={[styles.badge, isPaid ? styles.badgeSuccess : styles.badgeWarning]}>
            <Text style={[styles.badgeText, isPaid ? styles.badgeTextSuccess : styles.badgeTextWarning]}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderKeluhan = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
            <Feather name="message-square" size={20} color="#DC2626" />
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.cardTitle}>{item.sekolah}</Text>
            <Text style={styles.cardDate}>Dilaporkan pd {item.tanggal}</Text>
          </View>
        </View>
      </View>
      <View style={[styles.cardDivider, { marginBottom: 10 }]} />
      <View style={styles.keluhanBox}>
        <Text style={styles.keluhanText}>"{item.keluhan}"</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header Motif Batik */}
      <View style={styles.headerSection}>
        <Image
          source={require('../../../../assets/batik_cirebon.png')}
          style={[StyleSheet.absoluteFillObject, { opacity: 0.08, resizeMode: 'repeat' }]}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={styles.headerTitle}>Laporan Sistem</Text>
            <Text style={styles.headerSubtitle}>Rekapitulasi data Lavira terpusat</Text>
          </View>
        </View>

        {/* Tab Navigator */}
        <View style={styles.tabContainer}>
          {['Distribusi', 'Transaksi', 'Keluhan'].map((tab) => (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.8}
              style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.contentSection}>
        {activeTab === 'Distribusi' && (
          <FlatList
            data={DUMMY_DISTRIBUSI}
            keyExtractor={item => item.id}
            renderItem={renderDistribusi}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
        {activeTab === 'Transaksi' && (
          <FlatList
            data={DUMMY_TRANSAKSI}
            keyExtractor={item => item.id}
            renderItem={renderTransaksi}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
        {activeTab === 'Keluhan' && (
          <FlatList
            data={DUMMY_KELUHAN}
            keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
            renderItem={renderKeluhan}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={{ alignItems: 'center', marginTop: 60 }}>
                <Feather name="inbox" size={60} color="#CBD5E1" />
                <Text style={{ marginTop: 16, fontSize: 16, color: '#64748B', fontWeight: 'bold' }}>Belum Ada Keluhan</Text>
                <Text style={{ marginTop: 8, fontSize: 14, color: '#94A3B8', textAlign: 'center', marginHorizontal: 32 }}>Sistem belum menerima laporan masalah dari sekolah atau siswa.</Text>
              </View>
            )}
          />
        )}
      </View>

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
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <Feather name="file-text" size={24} color={BLUE_PRIMARY} />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Laporan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => navigation.navigate('Kantin')}>
          <Feather name="coffee" size={24} color="#94A3B8" />
          <Text style={styles.navLabel}>Kantin</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => navigation.navigate('Profil')}>
          <Feather name="user" size={24} color="#94A3B8" />
          <Text style={styles.navLabel}>Profil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
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
    elevation: 8,
    shadowColor: BLUE_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: WHITE,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 4,
    marginTop: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: WHITE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  tabTextActive: {
    color: BLUE_PRIMARY,
    fontWeight: 'bold',
  },
  contentSection: {
    flex: 1,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F8FAFC',
  },
  cardHeader: {
    marginBottom: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  cardDate: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginLeft: 6,
  },
  moneyText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  badgeSuccess: {
    backgroundColor: '#DCFCE7',
  },
  badgeWarning: {
    backgroundColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextSuccess: {
    color: '#16A34A',
  },
  badgeTextWarning: {
    color: '#D97706',
  },
  keluhanBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#DC2626',
  },
  keluhanText: {
    fontSize: 14,
    color: '#334155',
    fontStyle: 'italic',
    lineHeight: 20,
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
