<?php
include_once 'config.php';

$sppg_id = isset($_GET['sppg_id']) ? $_GET['sppg_id'] : null;

if (!empty($sppg_id)) {
    try {
        $stmt = $db->prepare("
            SELECT 
                k.id, 
                k.nama_kantin, 
                k.pemilik as pengelola, 
                k.no_telp as kontak, -- UBAH DI SINI: ambil dari kolom no_telp asli
                k.status_verifikasi, 
                s.nama_sekolah as sekolah, 
                s.alamat
            FROM kantin k
            JOIN sekolah s ON k.sekolah_id = s.id
            WHERE s.sppg_id = ?
        ");
        $stmt->execute([$sppg_id]);
        $kantin_list = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Map status agar frontend lebih mudah baca
        $result = array_map(function ($k) {
            // Kita pastikan status yang dikirim adalah text (Aktif/Pending/Ditolak)
            $k['status'] = $k['status_verifikasi'];
            return $k;
        }, $kantin_list);

        echo json_encode([
            "status" => "success",
            "data" => $result
        ]);
    }
    catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "SPPG ID tidak ditemukan"]);
}
?>