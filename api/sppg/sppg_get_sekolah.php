<?php
header("Content-Type: application/json");
include_once __DIR__ . '/../shared/config.php';

$sppg_id = isset($_GET['sppg_id']) ? $_GET['sppg_id'] : null;

if (!empty($sppg_id)) {
    try {
        $stmt = $db->prepare("SELECT id, nama_sekolah, npsn, jumlah_siswa as siswa, saldo, 'Aktif' as status FROM sekolah WHERE sppg_id = ?");
        $stmt->execute([$sppg_id]);
        $sekolah = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "status" => "success",
            "data" => $sekolah
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "SPPG ID tidak ditemukan"]);
}
?>
