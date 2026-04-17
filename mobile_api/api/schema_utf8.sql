-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: lavirameal_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `guru`
--

DROP TABLE IF EXISTS `guru`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `guru` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `sekolah_id` varchar(36) NOT NULL,
  `nip` varchar(30) DEFAULT NULL,
  `nama` varchar(150) NOT NULL,
  `kelas_wali` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `nip` (`nip`),
  KEY `sekolah_id` (`sekolah_id`),
  CONSTRAINT `guru_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `guru_ibfk_2` FOREIGN KEY (`sekolah_id`) REFERENCES `sekolah` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jadwal_distribusi`
--

DROP TABLE IF EXISTS `jadwal_distribusi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jadwal_distribusi` (
  `id` varchar(36) NOT NULL,
  `sppg_id` varchar(36) NOT NULL,
  `sekolah_id` varchar(36) NOT NULL,
  `kantin_id` varchar(36) NOT NULL,
  `tanggal` date NOT NULL,
  `sesi` enum('pagi','siang') NOT NULL DEFAULT 'siang',
  `status` enum('draft','proses','selesai','batal') DEFAULT 'draft',
  PRIMARY KEY (`id`),
  KEY `sppg_id` (`sppg_id`),
  KEY `sekolah_id` (`sekolah_id`),
  KEY `kantin_id` (`kantin_id`),
  CONSTRAINT `jadwal_distribusi_ibfk_1` FOREIGN KEY (`sppg_id`) REFERENCES `sppg` (`id`),
  CONSTRAINT `jadwal_distribusi_ibfk_2` FOREIGN KEY (`sekolah_id`) REFERENCES `sekolah` (`id`),
  CONSTRAINT `jadwal_distribusi_ibfk_3` FOREIGN KEY (`kantin_id`) REFERENCES `kantin` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jadwal_makan`
--

DROP TABLE IF EXISTS `jadwal_makan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jadwal_makan` (
  `id` varchar(50) NOT NULL,
  `sekolah_id` varchar(50) DEFAULT NULL,
  `menu_id` varchar(50) DEFAULT NULL,
  `tanggal` date DEFAULT NULL,
  `status` enum('Pending','Proses','Selesai') DEFAULT 'Pending',
  `total_target` int(11) DEFAULT NULL,
  `total_teralisasi` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `sekolah_id` (`sekolah_id`),
  KEY `menu_id` (`menu_id`),
  CONSTRAINT `jadwal_makan_ibfk_1` FOREIGN KEY (`sekolah_id`) REFERENCES `sekolah` (`id`),
  CONSTRAINT `jadwal_makan_ibfk_2` FOREIGN KEY (`menu_id`) REFERENCES `menu_makanan` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `kantin`
--

DROP TABLE IF EXISTS `kantin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `kantin` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `sekolah_id` varchar(36) NOT NULL,
  `nama_kantin` varchar(150) NOT NULL,
  `pemilik` varchar(150) NOT NULL,
  `kapasitas_porsi` int(11) NOT NULL DEFAULT 0,
  `status_verifikasi` enum('Pending','Aktif','Ditolak') DEFAULT 'Pending',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `sekolah_id` (`sekolah_id`),
  CONSTRAINT `kantin_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `kantin_ibfk_2` FOREIGN KEY (`sekolah_id`) REFERENCES `sekolah` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `konsumsi_siswa`
--

DROP TABLE IF EXISTS `konsumsi_siswa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `konsumsi_siswa` (
  `id` varchar(36) NOT NULL,
  `siswa_id` varchar(36) NOT NULL,
  `menu_id` varchar(36) NOT NULL,
  `sekolah_id` varchar(36) NOT NULL,
  `waktu_scan` datetime NOT NULL DEFAULT current_timestamp(),
  `metode_scan` enum('hp_siswa','voucher_kertas') NOT NULL,
  `harga_saat_ini` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `siswa_id` (`siswa_id`),
  KEY `menu_id` (`menu_id`),
  KEY `sekolah_id` (`sekolah_id`),
  CONSTRAINT `konsumsi_siswa_ibfk_1` FOREIGN KEY (`siswa_id`) REFERENCES `siswa` (`id`) ON DELETE CASCADE,
  CONSTRAINT `konsumsi_siswa_ibfk_2` FOREIGN KEY (`menu_id`) REFERENCES `menu` (`id`),
  CONSTRAINT `konsumsi_siswa_ibfk_3` FOREIGN KEY (`sekolah_id`) REFERENCES `sekolah` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `laporan`
--

DROP TABLE IF EXISTS `laporan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `laporan` (
  `id` varchar(36) NOT NULL,
  `sppg_id` varchar(36) NOT NULL,
  `sekolah_id` varchar(36) NOT NULL,
  `periode_mulai` date NOT NULL,
  `periode_selesai` date NOT NULL,
  `total_makan` int(11) NOT NULL DEFAULT 0,
  `total_biaya` decimal(15,2) DEFAULT 0.00,
  `status` enum('draft','dikirim','disetujui') DEFAULT 'draft',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `sppg_id` (`sppg_id`),
  KEY `sekolah_id` (`sekolah_id`),
  CONSTRAINT `laporan_ibfk_1` FOREIGN KEY (`sppg_id`) REFERENCES `sppg` (`id`),
  CONSTRAINT `laporan_ibfk_2` FOREIGN KEY (`sekolah_id`) REFERENCES `sekolah` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `menu`
--

DROP TABLE IF EXISTS `menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `menu` (
  `id` varchar(36) NOT NULL,
  `kantin_id` varchar(36) NOT NULL,
  `nama_menu` varchar(200) NOT NULL,
  `harga_satuan` decimal(12,2) NOT NULL DEFAULT 0.00,
  `tersedia` tinyint(1) NOT NULL DEFAULT 1,
  `foto_url` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `kantin_id` (`kantin_id`),
  CONSTRAINT `menu_ibfk_1` FOREIGN KEY (`kantin_id`) REFERENCES `kantin` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `menu_makanan`
--

DROP TABLE IF EXISTS `menu_makanan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `menu_makanan` (
  `id` varchar(50) NOT NULL,
  `sppg_id` varchar(50) DEFAULT NULL,
  `nama_menu` varchar(150) DEFAULT NULL,
  `deskripsi_gizi` text DEFAULT NULL,
  `kalori` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sppg_id` (`sppg_id`),
  CONSTRAINT `menu_makanan_ibfk_1` FOREIGN KEY (`sppg_id`) REFERENCES `sppg` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notifikasi`
--

DROP TABLE IF EXISTS `notifikasi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifikasi` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `judul` varchar(200) NOT NULL,
  `pesan` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifikasi_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sekolah`
--

DROP TABLE IF EXISTS `sekolah`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sekolah` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `sppg_id` varchar(36) NOT NULL,
  `nama_sekolah` varchar(200) NOT NULL,
  `npsn` varchar(20) NOT NULL,
  `jenjang` enum('SD','SMP','SMA','SMK') NOT NULL,
  `alamat` text DEFAULT NULL,
  `jumlah_siswa` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `npsn` (`npsn`),
  KEY `sppg_id` (`sppg_id`),
  CONSTRAINT `sekolah_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sekolah_ibfk_2` FOREIGN KEY (`sppg_id`) REFERENCES `sppg` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `siswa`
--

DROP TABLE IF EXISTS `siswa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `siswa` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `sekolah_id` varchar(36) NOT NULL,
  `nis` varchar(30) NOT NULL,
  `nama` varchar(150) NOT NULL,
  `kelas` varchar(20) NOT NULL,
  `saldo` decimal(12,2) DEFAULT 0.00,
  `qr_code_token` varchar(255) DEFAULT NULL,
  `aktif` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `sekolah_id` (`sekolah_id`,`nis`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `qr_code_token` (`qr_code_token`),
  CONSTRAINT `siswa_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `siswa_ibfk_2` FOREIGN KEY (`sekolah_id`) REFERENCES `sekolah` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sppg`
--

DROP TABLE IF EXISTS `sppg`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sppg` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `nama_lembaga` varchar(200) NOT NULL,
  `kode_sppg` varchar(50) NOT NULL,
  `alamat` text DEFAULT NULL,
  `no_telp` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `kode_sppg` (`kode_sppg`),
  CONSTRAINT `sppg_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transaksi_makan`
--

DROP TABLE IF EXISTS `transaksi_makan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transaksi_makan` (
  `id` varchar(50) NOT NULL,
  `siswa_id` varchar(50) DEFAULT NULL,
  `kantin_id` varchar(50) DEFAULT NULL,
  `jadwal_id` varchar(50) DEFAULT NULL,
  `waktu_scan` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `siswa_id` (`siswa_id`),
  KEY `kantin_id` (`kantin_id`),
  KEY `jadwal_id` (`jadwal_id`),
  CONSTRAINT `transaksi_makan_ibfk_1` FOREIGN KEY (`siswa_id`) REFERENCES `siswa` (`id`),
  CONSTRAINT `transaksi_makan_ibfk_2` FOREIGN KEY (`kantin_id`) REFERENCES `kantin` (`id`),
  CONSTRAINT `transaksi_makan_ibfk_3` FOREIGN KEY (`jadwal_id`) REFERENCES `jadwal_makan` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `nama` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` text NOT NULL,
  `role` enum('sppg','sekolah','kantin','guru','siswa') NOT NULL,
  `sekolah_id` varchar(36) DEFAULT NULL,
  `sppg_id` varchar(36) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-18 21:07:24
