<?php
include_once __DIR__ . '/../shared/config.php';

$sppg_id = isset($_GET['sppg_id']) ? $_GET['sppg_id'] : null;

if (!$sppg_id) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "SPPG ID required"]);
    exit();
}

try {
    // 1. Ambil Riwayat Distribusi & Petugas Penerima
    $query_riwayat = "
        SELECT 
            s.id as sekolah_id,
            s.nama_sekolah,
            jd.tanggal,
            jd.sesi,
            f.petugas_penerima,
            k.nama_kantin,
            jd.kuota_porsi as jumlah_makan,
            jd.status
        FROM jadwal_distribusi jd
        JOIN sekolah s ON jd.sekolah_id = s.id
        JOIN kantin k ON jd.kantin_id = k.id
        LEFT JOIN feedback_kantin f ON jd.id = f.jadwal_id
        WHERE jd.sppg_id = ?
        ORDER BY jd.tanggal DESC
        LIMIT 50
    ";
    $stmt_riwayat = $db->prepare($query_riwayat);
    $stmt_riwayat->execute([$sppg_id]);
    $riwayat = $stmt_riwayat->fetchAll(PDO::FETCH_ASSOC);

    // 2. Kantin Terlaris (Ranking)
    $query_ranking = "
        SELECT 
            k.nama_kantin,
            SUM(jd.kuota_porsi) as total_porsi,
            COUNT(jd.id) as total_distribusi
        FROM kantin k
        JOIN jadwal_distribusi jd ON k.id = jd.kantin_id
        WHERE jd.sppg_id = ? AND jd.status = 'completed'
        GROUP BY k.id
        ORDER BY total_porsi DESC
    ";
    $stmt_ranking = $db->prepare($query_ranking);
    $stmt_ranking->execute([$sppg_id]);
    $ranking_kantin = $stmt_ranking->fetchAll(PDO::FETCH_ASSOC);

    // 3. Rata-rata Rating Kantin
    $query_rating = "
        SELECT 
            k.nama_kantin,
            AVG(f.rating) as avg_rating,
            COUNT(f.id) as total_feedback
        FROM kantin k
        JOIN feedback_kantin f ON k.id = f.kantin_id
        GROUP BY k.id
        ORDER BY avg_rating DESC
    ";
    $stmt_rating = $db->prepare($query_rating);
    $stmt_rating->execute([]);
    $rating_kantin = $stmt_rating->fetchAll(PDO::FETCH_ASSOC);

    // 4. Riwayat Transaksi Dana
    $query_transaksi = "
        SELECT 
            td.id,
            s.nama_sekolah as sekolah,
            DATE_FORMAT(td.tanggal, '%d %b %Y') as tanggal_format,
            td.nominal,
            td.metode,
            td.status
        FROM transaksi_dana td
        JOIN sekolah s ON td.sekolah_id = s.id
        WHERE td.sppg_id = ?
        ORDER BY td.tanggal DESC
        LIMIT 50
    ";
    $stmt_transaksi = $db->prepare($query_transaksi);
    $stmt_transaksi->execute([$sppg_id]);
    $transaksi_dana = $stmt_transaksi->fetchAll(PDO::FETCH_ASSOC);

    // 5. Penerima MBG (Siswa yang klaim dana kaget)
    $query_penerima = "
        SELECT 
            s.nama as nama_siswa,
            sek.nama_sekolah as sekolah,
            s.kelas,
            dk.amount as dana_diterima,
            DATE_FORMAT(dkc.claimed_at, '%b %Y') as periode
        FROM dana_kaget_claims dkc
        JOIN siswa s ON dkc.user_id = s.user_id
        JOIN dana_kaget dk ON dkc.dana_kaget_id = dk.id
        JOIN sekolah sek ON dk.sekolah_id = sek.id
        WHERE sek.sppg_id = ?
        ORDER BY dkc.claimed_at DESC
        LIMIT 100
    ";
    $stmt_penerima = $db->prepare($query_penerima);
    $stmt_penerima->execute([$sppg_id]);
    $penerima_mbg = $stmt_penerima->fetchAll(PDO::FETCH_ASSOC);

    // 6. Bulanan / Rekap
    $query_bulanan = "
        SELECT 
            DATE_FORMAT(td.tanggal, '%M %Y') as bulan,
            SUM(CASE WHEN td.status = 'Berhasil' THEN td.nominal ELSE 0 END) as total_dana,
            COUNT(DISTINCT td.sekolah_id) as jumlah_sekolah,
            (
                SELECT COUNT(*) 
                FROM dana_kaget_claims dkc
                JOIN dana_kaget dk ON dkc.dana_kaget_id = dk.id
                JOIN sekolah s ON dk.sekolah_id = s.id
                WHERE s.sppg_id = td.sppg_id 
                AND DATE_FORMAT(dkc.claimed_at, '%M %Y') = DATE_FORMAT(td.tanggal, '%M %Y')
            ) as total_penerima,
            SUM(CASE WHEN td.status = 'Berhasil' THEN 1 ELSE 0 END) as berhasil,
            SUM(CASE WHEN td.status != 'Berhasil' THEN 1 ELSE 0 END) as gagal
        FROM transaksi_dana td
        WHERE td.sppg_id = ?
        GROUP BY DATE_FORMAT(td.tanggal, '%Y-%m')
        ORDER BY td.tanggal DESC
    ";
    $stmt_bulanan = $db->prepare($query_bulanan);
    $stmt_bulanan->execute([$sppg_id]);
    $bulanan = $stmt_bulanan->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "data" => [
            "riwayat" => $riwayat,
            "transaksi_dana" => $transaksi_dana,
            "ranking_kantin" => $ranking_kantin,
            "rating_kantin" => $rating_kantin,
            "penerima_mbg" => $penerima_mbg,
            "bulanan" => $bulanan
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
