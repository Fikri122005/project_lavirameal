<?php
// api/config.php
// Mengatur timezone agar fungsi NOW() di DB sinkron dengan waktu Indonesia
date_default_timezone_set('Asia/Jakarta');

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Konfigurasi Database
$host = "localhost";
$db_name = "lavirameal_db";
$username = "root";
$password = "";

try {
    // Menambahkan opsi ATTR_DEFAULT_FETCH_MODE agar hasil query otomatis jadi array asosiatif
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    $db = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $username, $password, $options);
}
catch (PDOException $exception) {
    // Menggunakan http_response_code 500 untuk error server
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Gagal terhubung ke database."
        // "detail" => $exception->getMessage() // Aktifkan hanya saat tahap pengembangan/coding
    ]);
    exit();
}
?>