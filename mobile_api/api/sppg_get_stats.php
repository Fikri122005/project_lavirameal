<?php
include_once 'config.php';

$sppg_id = isset($_GET['sppg_id']) ? $_GET['sppg_id'] : null;

if (!empty($sppg_id)) {
    try {
        $today = date('Y-m-d');

        // Total sekolah
        $stmt_sekolah = $db->prepare("SELECT COUNT(*) as total FROM sekolah WHERE sppg_id = ?");
        $stmt_sekolah->execute([$sppg_id]);
        $total_sekolah = $stmt_sekolah->fetchColumn() ?: 0;

        // Daftar sekolah
        $stmt_daftar = $db->prepare("SELECT id, nama_sekolah as nama, alamat, jumlah_siswa FROM sekolah WHERE sppg_id = ?");
        $stmt_daftar->execute([$sppg_id]);
        $daftar_sekolah = $stmt_daftar->fetchAll(PDO::FETCH_ASSOC);

        // Kehadiran Hari Ini
        $stmt_kehadiran = $db->prepare("
            SELECT COUNT(*) as total 
            FROM konsumsi_siswa ks 
            JOIN sekolah s ON ks.sekolah_id = s.id 
            WHERE s.sppg_id = ? AND DATE(ks.waktu_scan) = ?
        ");
        $stmt_kehadiran->execute([$sppg_id, $today]);
        $kehadiran_hari_ini = $stmt_kehadiran->fetchColumn() ?: 0;

        // Total siswa
        $stmt_siswa = $db->prepare("SELECT SUM(jumlah_siswa) as total_siswa FROM sekolah WHERE sppg_id = ?");
        $stmt_siswa->execute([$sppg_id]);
        $total_siswa = $stmt_siswa->fetchColumn() ?: 0;

        // Info User
        $stmt_user = $db->prepare("SELECT u.nama, s.nama_lembaga FROM users u JOIN sppg s ON u.id = s.user_id WHERE s.id = ?");
        $stmt_user->execute([$sppg_id]);
        $user_info = $stmt_user->fetch();

        $grafik = [];
        $hari_labels = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
        $start_date = date('Y-m-d', strtotime("-6 days"));
        $end_date = date('Y-m-d');
        
        // 1. Coba dari tabel konsumsi_siswa
        $stmt_grafik = $db->prepare("
            SELECT DATE(ks.waktu_scan) as tanggal, COUNT(*) as total
            FROM konsumsi_siswa ks
            JOIN sekolah s ON ks.sekolah_id = s.id
            WHERE s.sppg_id = ? AND DATE(ks.waktu_scan) BETWEEN ? AND ?
            GROUP BY DATE(ks.waktu_scan)
        ");
        $stmt_grafik->execute([$sppg_id, $start_date, $end_date]);
        $data_konsumsi = $stmt_grafik->fetchAll(PDO::FETCH_KEY_PAIR);
        
        // 2. Jika kosong, coba dari transaksi_makan
        if (empty($data_konsumsi)) {
            $stmt_grafik2 = $db->prepare("
                SELECT DATE(tm.waktu_scan) as tanggal, COUNT(*) as total
                FROM transaksi_makan tm 
                JOIN siswa sw ON tm.siswa_id = sw.id 
                JOIN sekolah s ON sw.sekolah_id = s.id 
                WHERE s.sppg_id = ? AND DATE(tm.waktu_scan) BETWEEN ? AND ?
                GROUP BY DATE(tm.waktu_scan)
            ");
            $stmt_grafik2->execute([$sppg_id, $start_date, $end_date]);
            $data_konsumsi = $stmt_grafik2->fetchAll(PDO::FETCH_KEY_PAIR);
        }

        // Susun data 7 hari terakhir
        for ($i = 6; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-$i days"));
            $day_of_week = date('w', strtotime($date));
            $total = isset($data_konsumsi[$date]) ? $data_konsumsi[$date] : 0;
            
            $grafik[] = [
                "label" => $hari_labels[(int)$day_of_week],
                "value" => (int)$total,
                "date" => $date
            ];
        }

        echo json_encode([
            "status" => "success",
            "data" => [
                "user" => [
                    "nama" => $user_info['nama'] ?? 'Admin',
                    "lembaga" => $user_info['nama_lembaga'] ?? 'SPPG'
                ],
                "total_sekolah" => (int)$total_sekolah,
                "total_siswa" => (int)$total_siswa,
                "daftar_sekolah" => $daftar_sekolah,
                "kehadiran_hari_ini" => (int)$kehadiran_hari_ini,
                "grafik_konsumsi" => $grafik
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage(), "line" => $e->getLine()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "SPPG ID tidak ditemukan"]);
}
?>