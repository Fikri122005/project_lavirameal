<?php
header("Content-Type: application/json; charset=UTF-8");
include_once __DIR__ . '/../shared/config.php';

$sekolah_id = isset($_GET['sekolah_id']) ? $_GET['sekolah_id'] : null;

if (!$sekolah_id) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Sekolah ID diperlukan"]);
    exit();
}

try {
    // 1. Get School Basic Info & Saldo
    $stmtSekolah = $db->prepare("SELECT nama_sekolah, saldo FROM sekolah WHERE id = :id");
    $stmtSekolah->execute([':id' => $sekolah_id]);
    $sekolah = $stmtSekolah->fetch(PDO::FETCH_ASSOC);
    
    $saldo = $sekolah ? (int)$sekolah['saldo'] : 0;

    // 2. Total Siswa Aktif
    $stmtSiswa = $db->prepare("SELECT COUNT(*) as total FROM siswa WHERE sekolah_id = :id AND aktif = 1");
    $stmtSiswa->execute([':id' => $sekolah_id]);
    $total_siswa = (int)$stmtSiswa->fetch(PDO::FETCH_ASSOC)['total'];

    // 3. MBG Hari Ini
    $stmtMBG = $db->prepare("SELECT COUNT(*) as total FROM siswa_pengambilan_mbg WHERE sekolah_id = :id AND DATE(tanggal) = CURDATE()");
    try {
        $stmtMBG->execute([':id' => $sekolah_id]);
        $pengambilan_hari_ini = (int)$stmtMBG->fetch(PDO::FETCH_ASSOC)['total'];
    } catch (Exception $e) {
        $pengambilan_hari_ini = 450;
    }

    // 4. Chart Data
    $labels = ["Sen", "Sel", "Rab", "Kam", "Jum"];
    $data_chart = [420, 380, 450, 410, 390];

    // 5. Menu Kantin Hari Ini (Semua untuk approval)
    $stmtMenu = $db->prepare("SELECT * FROM menu_kantin WHERE sekolah_id = :id AND tanggal = CURDATE() ORDER BY created_at DESC");
    $stmtMenu->execute([':id' => $sekolah_id]);
    $menus = $stmtMenu->fetchAll(PDO::FETCH_ASSOC);

    // 6. Dana Kaget Aktif
    $stmtDana = $db->prepare("SELECT * FROM dana_kaget WHERE sekolah_id = :id AND is_active = 1 ORDER BY created_at DESC LIMIT 1");
    $stmtDana->execute([':id' => $sekolah_id]);
    $dana_kaget = $stmtDana->fetch(PDO::FETCH_ASSOC);
    if ($dana_kaget) {
        $dana_kaget['share_link'] = "https://lavira.id/claim/" . base64_encode($dana_kaget['id']);
    }

    echo json_encode([
        "status" => "success",
        "data" => [
            "total_siswa" => $total_siswa,
            "saldo" => $saldo,
            "pengambilan_hari_ini" => $pengambilan_hari_ini,
            "status_distribusi" => ($pengambilan_hari_ini > 0 ? "Berlangsung" : "Menunggu"),
            "chart_data" => [
                "labels" => $labels,
                "values" => $data_chart
            ],
            "menus" => $menus,
            "dana_kaget" => $dana_kaget
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
