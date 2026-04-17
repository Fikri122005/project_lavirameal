<?php
header("Content-Type: application/json; charset=UTF-8");
include_once 'config.php';

$sekolah_id = isset($_GET['sekolah_id']) ? $_GET['sekolah_id'] : null;

// Jika tidak ada parameter sekolah_id, otomatis ambil ID sekolah pertama agar langsung ada tampilan
if (!$sekolah_id) {
    try {
        $stmt_check = $db->query("SELECT id FROM sekolah LIMIT 1");
        $first_skyl = $stmt_check->fetch(PDO::FETCH_ASSOC);
        if ($first_skyl) {
            $sekolah_id = $first_skyl['id'];
        }
    } catch(Exception $e) {}
}

$total_siswa = 0;
$jadwal_hari_ini = 0;
$status_distribusi = "Belum Ada Jadwal";

if ($sekolah_id) {
    try {
        // Query Total Siswa
        $stmtSiswa = $db->prepare("SELECT COUNT(*) as total FROM siswa WHERE sekolah_id = :id AND aktif = 1");
        $stmtSiswa->execute([':id' => $sekolah_id]);
        $total_siswa = (int)$stmtSiswa->fetch(PDO::FETCH_ASSOC)['total'];

        // Query Sesi Makan
        $stmtJadwal = $db->prepare("SELECT status FROM jadwal_makan WHERE sekolah_id = :id AND tanggal = CURDATE() ORDER BY id DESC LIMIT 1");
        $stmtJadwal->execute([':id' => $sekolah_id]);
        $rowJadwal = $stmtJadwal->fetch(PDO::FETCH_ASSOC);
        
        if ($rowJadwal) {
            $jadwal_hari_ini = 1;
            $status_distribusi = $rowJadwal['status']; 
            if (!$status_distribusi) $status_distribusi = "Proses"; 
        } else {
            $status_distribusi = "Menunggu Jadwal";
        }

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        exit();
    }
}

echo json_encode([
    "status" => "success",
    "data" => [
        "total_siswa" => $total_siswa,
        "jadwal_hari_ini" => $jadwal_hari_ini,
        "status_distribusi" => $status_distribusi
    ]
]);
?>
