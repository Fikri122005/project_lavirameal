import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
  TextInput,
  Image,
  SafeAreaView
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import apiClient from '../../../api/client';

const BLUE_PRIMARY = '#1C2C5B';
const BLUE_DARK = '#1C2C5B';
const BLUE_LIGHT = '#6995B9';
const WHITE = '#FFFFFF';

export default function SekolahScreen({ navigation }) {
  const [schools, setSchools] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      // Saat ini kita menggunakan endpoint stats yang sudah kita buat sebelumnya
      // untuk mengambil daftar_sekolah, atau nanti Anda bisa membuat API spesifik: sppg_get_sekolah.php
      const response = await apiClient.get('/sppg_get_stats.php?sppg_id=1');
      if (response.data && response.data.status === 'success') {
        const daftar = response.data.data.daftar_sekolah || [];
        setSchools(daftar);
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchools = schools.filter(school => {
    const nama = school.nama_sekolah || school.nama || '';
    return nama.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const renderSchoolItem = ({ item }) => (
    <TouchableOpacity
      style={styles.schoolCard}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('DetailSekolah', { schoolData: item })}
    >
      <View style={styles.schoolIconContainer}>
        <Ionicons name="business" size={24} color={BLUE_PRIMARY} />
      </View>
      <View style={styles.schoolInfo}>
        <Text style={styles.schoolName}>{item.nama_sekolah || item.nama}</Text>
        <Text style={styles.schoolAddress} numberOfLines={2}>
          {item.alamat || 'Alamat tidak tersedia'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header dengan Motif Batik */}
      <View style={styles.headerSection}>
        <Image
          source={require('../../../../assets/batik_cirebon.png')}
          style={[StyleSheet.absoluteFillObject, { opacity: 0.08, resizeMode: 'repeat' }]}
        />

        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Manajemen Sekolah</Text>
            <Text style={styles.headerSubtitle}>Kelola daftar sekolah penerima MBG</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('TambahSekolah')}
          >
            <Feather name="plus" size={22} color={WHITE} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama sekolah..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* List Sekolah */}
      <View style={styles.contentSection}>
        {loading ? (
          <ActivityIndicator size="large" color={BLUE_PRIMARY} style={{ marginTop: 40 }} />
        ) : filteredSchools.length > 0 ? (
          <FlatList
            data={filteredSchools}
            keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            renderItem={renderSchoolItem}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={60} color="#E2E8F0" />
            <Text style={styles.emptyText}>Tidak ada sekolah ditemukan</Text>
          </View>
        )}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => navigation.navigate('Home')}>
          <Feather name="home" size={24} color="#94A3B8" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <Feather name="book" size={24} color={BLUE_PRIMARY} />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Sekolah</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => navigation.navigate('Laporan')}>
          <Feather name="file-text" size={24} color="#94A3B8" />
          <Text style={styles.navLabel}>Laporan</Text>
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
    backgroundColor: '#F8F9FA',
  },
  headerSection: {
    backgroundColor: BLUE_PRIMARY,
    paddingTop: 56, // Padding statusBar (jika Android)
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
    marginBottom: 24,
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
  addButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
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
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  schoolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  schoolIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  schoolAddress: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    paddingRight: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
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
