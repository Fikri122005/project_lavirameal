<?php
header("Content-Type: application/json");
include_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    $idnt = !empty($data->email) ? $data->email : (!empty($data->identifier) ? $data->identifier : null);

    // Kita gunakan 'identifier' atau 'email' agar fleksibel
    if (!empty($idnt) && !empty($data->password)) {

        try {
            // QUERY SAKTI: Mencari di Users (Email) atau Siswa (NIS)
            // Sekaligus mengambil nama Sekolah atau nama SPPG
            $query = "SELECT u.id, u.nama, u.username, u.email, u.password_hash, u.role, u.sekolah_id, u.sppg_id, 
                             s.nama_sekolah, sp.nama_lembaga 
                      FROM users u 
                      LEFT JOIN siswa ss ON u.id = ss.user_id 
                      LEFT JOIN sekolah s ON u.sekolah_id = s.id 
                      LEFT JOIN sppg sp ON u.sppg_id = sp.id 
                      WHERE (u.username = :idnt1 OR u.email = :idnt2 OR ss.nis = :idnt3) AND u.is_active = TRUE 
                      LIMIT 1";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":idnt1", $idnt);
            $stmt->bindParam(":idnt2", $idnt);
            $stmt->bindParam(":idnt3", $idnt);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);

                if (password_verify($data->password, $row['password_hash'])) {
                    // Update Waktu Login
                    $db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?")->execute([$row['id']]);

                    unset($row['password_hash']); // Keamanan

                    http_response_code(200);
                    echo json_encode([
                        "status" => "success",
                        "message" => "Selamat datang di Lavira Meal Karawang!",
                        "user" => $row
                    ]);
                }
                else {
                    http_response_code(401);
                    echo json_encode(["status" => "error", "message" => "Password salah."]);
                }
            }
            else {
                http_response_code(401);
                echo json_encode(["status" => "error", "message" => "Akun tidak ditemukan atau nonaktif."]);
            }
        }
        catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
        }
    }
    else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Identifier (Email/NIS) dan Password harus diisi."]);
    }
}
else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
}
?>