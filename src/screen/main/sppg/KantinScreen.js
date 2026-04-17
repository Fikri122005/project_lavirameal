import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Image,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import apiClient from '../../../api/client';

const BLUE_PRIMARY = '#1C2C5B';
const BLUE_DARK = '#1C2C5B';
const WHITE = '#FFFFFF';

export default function KantinScreen({ navigation }) {
  const [kantinList, setKantinList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKantin();
  }, []);

  const fetchKantin = async () => {
    try {
      const response = await apiClient.get('/sppg_get_kantin.php?sppg_id=1');
      if (response.data && response.data.status === 'success') {
        setKantinList(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching kantin:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredKantin = kantinList.filter(k =>
    k.nama_kantin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.sekolah.toLowerCase().includes(searchQuery.toLowerCase())
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

        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Verifikasi Kantin</Text>
            <Text style={styles.headerSubtitle}>Pantau kelayakan dan approve di tempat</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama kantin atau sekolah..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Compact Table Layout For Mobile (One Line Row Width) */}
      <View style={styles.contentSection}>
        <View style={styles.tableWrapper}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>NAMA KANTIN / PEMILIK</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>ASAL SEKOLAH</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>NO. WHATSAPP</Text>
            <Text style={[styles.headerCell, { flex: 0.8 }]}>STATUS</Text>
            <Text style={[styles.headerCell, { flex: 0.8, textAlign: 'center' }]}>TINJAUAN AKSI</Text>
          </View>

          {/* Table Body */}
          {loading ? (
            <View style={styles.centerLoading}>
              <ActivityIndicator size="large" color={BLUE_PRIMARY} />
            </View>
          ) : filteredKantin.length > 0 ? (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {filteredKantin.map((item, index) => (
                <View key={item.id ? item.id.toString() : index.toString()} style={styles.tableRow}>
                  <View style={[styles.tableCell, { flex: 1.5 }]}>
                    <Text style={styles.cellTitleText} numberOfLines={2}>{item.nama_kantin}</Text>
                    <Text style={styles.cellSubText} numberOfLines={1}>{item.pengelola}</Text>
                  </View>
                  <View style={[styles.tableCell, { flex: 1 }]}>
                    <Text style={styles.cellText} numberOfLines={2}>{item.sekolah}</Text>
                  </View>
                  <View style={[styles.tableCell, { flex: 1 }]}>
                    <Text style={styles.cellText} numberOfLines={1}>{item.kontak || '-'}</Text>
                  </View>
                  <View style={[styles.tableCell, { flex: 0.8 }]}>
                    <View style={[styles.statusBadge, { backgroundColor: item.status === 'Aktif' ? '#e0f2fe' : (item.status === 'Ditolak' ? '#fee2e2' : '#fef9c3') }]}>
                      <Text style={[styles.statusText, { color: item.status === 'Aktif' ? '#0369a1' : (item.status === 'Ditolak' ? '#dc2626' : '#ca8a04') }]} numberOfLines={1}>
                        {item.status}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.tableCell, { flex: 0.8, alignItems: 'center' }]}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => navigation.navigate('VerifikasiKantin', { kantinData: item })}
                    >
                      <Text style={styles.actionBtnText} numberOfLines={1}>Tinjau</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyRowText}>Belum ada kantin yang mendaftar.</Text>
            </View>
          )}
        </View>
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
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => navigation.navigate('Laporan')}>
          <Feather name="file-text" size={24} color="#94A3B8" />
          <Text style={styles.navLabel}>Laporan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <Feather name="coffee" size={24} color={BLUE_PRIMARY} />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Kantin</Text>
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
    backgroundColor: '#F8F9FA',
  },
  headerSection: {
    backgroundColor: BLUE_PRIMARY,
    paddingTop: 56,
    paddingHorizontal: 24,
    height: 240,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    position: 'relative',
    elevation: 5,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: WHITE,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  contentSection: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  tableWrapper: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: WHITE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  headerCell: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
    paddingHorizontal: 2,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  tableCell: {
    paddingHorizontal: 2,
    justifyContent: 'center',
  },
  cellTitleText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 1,
  },
  cellSubText: {
    fontSize: 8,
    color: '#64748B',
  },
  cellText: {
    fontSize: 9,
    color: '#334155',
  },
  statusBadge: {
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  actionBtn: {
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderRadius: 4,
    backgroundColor: '#EEF2FF',
  },
  actionBtnText: {
    fontSize: 8,
    fontWeight: '600',
    color: BLUE_PRIMARY,
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyRow: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyRowText: {
    fontSize: 12,
    color: '#64748B',
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
