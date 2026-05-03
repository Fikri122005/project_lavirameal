import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    SafeAreaView,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/client';

const BLUE_PRIMARY = '#1C2C5B';
const BLUE_DARK = '#1C2C5B';
const BLUE_LIGHT = '#6995B9';
const BLUE_BG_PATTERN = 'rgba(255,255,255,0.08)';
const WHITE = '#FFFFFF';

export default function Login1({ navigation }) {
    const [nama, setNama] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [daftarSebagai, setDaftarSebagai] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agree, setAgree] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [kodeUnik, setKodeUnik] = useState('');
    const [namaLembaga, setNamaLembaga] = useState('');
    const [alamatLembaga, setAlamatLembaga] = useState('');

    const handleNext = async () => {
        // Validation
        if (!nama || !username || !email || !password || !confirmPassword || !daftarSebagai) {
            Alert.alert('Error', 'Semua data dasar dan peran wajib diisi');
            return;
        }

        // Validasi format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Format email tidak valid (contoh: user@gmail.com)');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Konfirmasi password tidak cocok');
            return;
        }

        if (!agree) {
            Alert.alert('Error', 'Anda harus menyetujui Syarat dan Ketentuan');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                nama_lengkap: nama,
                username: username,
                email: email,
                password: password,
                role: daftarSebagai.toLowerCase(),
                sekolah_id: null
            };

            const response = await apiClient.post('auth/register.php', payload);

            if (response.data.status === 'success') {
                const isKantin = daftarSebagai.toLowerCase() === 'kantin';
                const successMsg = isKantin 
                    ? 'Registrasi berhasil! Akun Anda sedang menunggu persetujuan (ACC) dari admin SPPG.'
                    : 'Registrasi berhasil! Silakan login.';
                
                Alert.alert('Sukses', successMsg, [
                    { text: 'OK', onPress: () => navigation.navigate('Login') }
                ]);
            } else {
                Alert.alert('Gagal', response.data.message || 'Terjadi kesalahan');
            }
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.message || 'Tidak dapat terhubung ke server';
            Alert.alert('Error', errorMsg);
        } finally {
            setLoading(false);
        }
    };


    const selectOption = (option) => {
        setDaftarSebagai(option);
        setMenuOpen(false);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Header Section */}
            <View style={styles.headerSection}>
                <Image
                    source={require('../../../assets/batik_cirebon.png')}
                    style={[StyleSheet.absoluteFillObject, { opacity: 0.08, resizeMode: 'repeat' }]}
                />
                {/* Efek Gradasi dihapus agar batik terlihat sampai bawah header */}
                <View style={[styles.headerTextContainer, { height: 160, justifyContent: 'center' }]}>
                    <Text style={styles.logoTextMain}>
                        Lavira<Text style={styles.logoTextSub}>Meal</Text>
                    </Text>
                    <View style={styles.logoBadge}>
                        <Text style={styles.logoBadgeText}>APPS</Text>
                    </View>
                </View>
            </View>

            {/* Form Section - White Card */}
            <View style={styles.formCard}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <Text style={styles.formTitle}>Buat Akun</Text>
                    <Text style={styles.formSubtitle}>Daftar untuk menyampaikan laporan resmi</Text>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Nama Lengkap</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color="#AAB8C2" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Nama Lengkap"
                                placeholderTextColor="#AAB8C2"
                                value={nama}
                                onChangeText={setNama}
                            />
                        </View>
                    </View>


                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Username</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color="#AAB8C2" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Cth: budi123"
                                placeholderTextColor="#AAB8C2"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color="#AAB8C2" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Cth: budi@gmail.com"
                                placeholderTextColor="#AAB8C2"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Daftar Sebagai</Text>
                        <TouchableOpacity
                            style={styles.inputContainer}
                            onPress={() => setMenuOpen(!menuOpen)}
                        >
                            <Ionicons name="cube-outline" size={20} color="#AAB8C2" style={styles.inputIcon} />
                            <Text style={[styles.inputField, { color: daftarSebagai ? BLUE_PRIMARY : '#CCC', fontWeight: daftarSebagai ? 'bold' : 'normal' }]}>
                                {daftarSebagai || "Pilih peran Anda"}
                            </Text>
                            <Ionicons name="chevron-down-outline" size={18} color="#999" />
                        </TouchableOpacity>

                        {menuOpen && (
                            <View style={styles.dropdown}>
                                <TouchableOpacity
                                    style={[styles.dropdownItem, daftarSebagai === 'SPPG' && styles.dropdownItemActive]}
                                    onPress={() => selectOption('SPPG')}
                                >
                                    <Text style={[styles.dropdownText, daftarSebagai === 'SPPG' && styles.dropdownTextActive]}>SPPG</Text>
                                </TouchableOpacity>
                                <View style={styles.dropdownDivider} />
                                <TouchableOpacity
                                    style={[styles.dropdownItem, daftarSebagai === 'Kantin' && styles.dropdownItemActive]}
                                    onPress={() => selectOption('Kantin')}
                                >
                                    <Text style={[styles.dropdownText, daftarSebagai === 'Kantin' && styles.dropdownTextActive]}>Kantin</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Kata Sandi</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color="#AAB8C2" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Isi Kata Sandi"
                                placeholderTextColor="#AAB8C2"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#999" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Konfirmasi Kata Sandi</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color="#AAB8C2" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="***********"
                                placeholderTextColor="#AAB8C2"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#999" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Syarat & Ketentuan */}
                    <TouchableOpacity
                        style={styles.checkboxContainer}
                        onPress={() => setAgree(!agree)}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name={agree ? "checkbox" : "square-outline"}
                            size={24}
                            color={agree ? BLUE_PRIMARY : "#AAB8C2"}
                        />
                        <Text style={styles.checkboxText}>
                            Saya setuju dengan <Text style={styles.termsText}>Syarat Layanan dan Kebijakan Privasi</Text>
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.footerInfo}>
                        <Text style={styles.footerText}>Sudah punya akun? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginLink}>Masuk</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.mainButton}
                        onPress={handleNext}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={WHITE} />
                        ) : (
                            <Text style={styles.mainButtonText}>Selanjutnya</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BLUE_PRIMARY,
    },
    headerSection: {
        backgroundColor: BLUE_PRIMARY,
        paddingTop: 80,
        paddingBottom: 60,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        position: 'relative',
    },
    headerTextContainer: {
        alignItems: 'center',
        zIndex: 2,
    },
    logoTextMain: {
        color: WHITE,
        fontSize: 46,
        fontWeight: '900',
        letterSpacing: 1.5,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.25)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 10,
    },
    logoTextSub: {
        color: WHITE,
        fontSize: 46,
        fontWeight: '900',
        letterSpacing: 1.5,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.25)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 10, // Light sky blue to give a premium glow
    },
    logoBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginTop: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    logoBadgeText: {
        color: WHITE,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 4,
        opacity: 0.9,
    },
    formCard: {
        flex: 1,
        backgroundColor: WHITE,
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        // Extremely subtle shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 10,
        marginTop: -35,
    },
    scrollContent: {
        paddingHorizontal: 30,
        paddingTop: 35,
        paddingBottom: 40,
    },
    formTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    formSubtitle: {
        fontSize: 14,
        color: '#707070',
        marginBottom: 25,
    },
    formGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.2,
        borderColor: '#E8ECEF',
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 56,
        backgroundColor: '#FFFFFF',
        // Very light shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 2,
        elevation: 1,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#1A1A1A',
    },
    inputField: {
        flex: 1,
        fontSize: 15,
        paddingVertical: 15,
    },
    dropdown: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8ECEF',
        borderRadius: 12,
        marginTop: 5,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 5,
    },

    dropdownItem: {
        padding: 15,
    },
    dropdownItemActive: {
        backgroundColor: BLUE_PRIMARY, // Red background for selected item
    },
    dropdownText: {
        fontSize: 15,
        color: '#1A1A1A',
    },
    dropdownTextActive: {
        color: '#FFFFFF', // White text for selected item
        fontWeight: 'bold',
    },

    dropdownDivider: {
        height: 1,
        backgroundColor: '#F0F2F5',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        marginBottom: 15,
        paddingHorizontal: 5,
    },
    checkboxText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#636E72',
        flex: 1,
        lineHeight: 20,
    },
    termsText: {
        color: BLUE_PRIMARY,
        fontWeight: 'bold',
    },
    footerInfo: {
        flexDirection: 'row',
        marginTop: 10,
        marginBottom: 30,
        justifyContent: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#636E72',
    },
    loginLink: {
        fontSize: 14,
        color: BLUE_PRIMARY,
        fontWeight: 'bold',
    },
    mainButton: {
        backgroundColor: BLUE_PRIMARY,
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: BLUE_PRIMARY,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
    },
    mainButtonText: {
        color: '#FFFFFF', // Pure WHITE text for the button
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});



