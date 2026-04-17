
CREATE DATABASE IF NOT EXISTS lavirameal_db;
USE lavirameal_db;


-- 1. Penambahan snapshot harga di detail distribusi (Agar laporan keuangan tidak berubah jika harga menu diupdate)
-- 2. Penambahan qr_code_token di tabel siswa untuk keamanan scan
-- 3. Memastikan semua tabel memiliki updated_at trigger (opsional tergantung DB engine)

CREATE TABLE users (
  id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama          VARCHAR(150) NOT NULL,
  username      VARCHAR(100) UNIQUE,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash TEXT         NOT NULL,
  role          user_role    NOT NULL, -- (sppg, sekolah, kantin, guru, siswa)
  
  -- Tambahan agar satu file register.php lebih mudah:
  sekolah_id    UUID         REFERENCES sekolah(id) ON DELETE SET NULL, 
  sppg_id       UUID         REFERENCES sppg(id) ON DELETE SET NULL,

  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  last_login    TIMESTAMP,
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE sppg (
  id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID         NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  nama_lembaga  VARCHAR(200) NOT NULL,
  kode_sppg     VARCHAR(50)  NOT NULL UNIQUE,
  alamat        TEXT,
  kota          VARCHAR(100),
  provinsi      VARCHAR(100),
  no_telp       VARCHAR(20),
  email_lembaga VARCHAR(150),
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE sekolah (
  id            UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID            NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  sppg_id       UUID            NOT NULL REFERENCES sppg(id) ON DELETE RESTRICT,
  nama_sekolah  VARCHAR(200)    NOT NULL,
  npsn          VARCHAR(20)     NOT NULL UNIQUE,
  jenjang       jenjang_sekolah NOT NULL,
  alamat        TEXT,
  kota          VARCHAR(100),
  provinsi      VARCHAR(100),
  no_telp       VARCHAR(20),
  email_sekolah VARCHAR(150),
  jumlah_siswa  INT             NOT NULL DEFAULT 0,
  is_aktif      BOOLEAN         NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP       NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE TABLE kantin (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  sekolah_id      UUID        NOT NULL REFERENCES sekolah(id) ON DELETE RESTRICT,
  nama_kantin     VARCHAR(150) NOT NULL,
  pemilik         VARCHAR(150) NOT NULL,
  no_telp         VARCHAR(20),
  kapasitas_porsi INT         NOT NULL DEFAULT 0,
  is_aktif        BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE TABLE guru (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID        NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  sekolah_id     UUID        NOT NULL REFERENCES sekolah(id) ON DELETE RESTRICT,
  nip            VARCHAR(30)  UNIQUE,
  nama           VARCHAR(150) NOT NULL,
  mata_pelajaran VARCHAR(100),
  kelas_wali     VARCHAR(20),
  no_telp        VARCHAR(20),
  is_aktif       BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE TABLE siswa (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID          UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  sekolah_id    UUID          NOT NULL REFERENCES sekolah(id) ON DELETE RESTRICT,
  guru_id       UUID          REFERENCES guru(id) ON DELETE SET NULL,
  nis           VARCHAR(30)   NOT NULL,
  nama          VARCHAR(150)  NOT NULL,
  kelas         VARCHAR(20)   NOT NULL,
  jenis_kelamin jenis_kelamin,
  tanggal_lahir DATE,
  nama_wali     VARCHAR(150),
  no_telp_wali  VARCHAR(20),
  qr_code_token TEXT          UNIQUE, -- Tambahan untuk sistem scan yang lebih aman
  aktif         BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
  UNIQUE (sekolah_id, nis)
);

CREATE TABLE menu (
  id           UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  kantin_id    UUID          NOT NULL REFERENCES kantin(id) ON DELETE CASCADE,
  nama_menu    VARCHAR(200)  NOT NULL,
  deskripsi    TEXT,
  kalori       NUMERIC(8,2),
  protein      NUMERIC(8,2),
  karbohidrat  NUMERIC(8,2),
  lemak        NUMERIC(8,2),
  serat        NUMERIC(8,2),
  foto_url     TEXT,
  harga_satuan NUMERIC(12,2) NOT NULL DEFAULT 0,
  tersedia     BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE jadwal_distribusi (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id     UUID          NOT NULL REFERENCES sppg(id) ON DELETE RESTRICT,
  sekolah_id  UUID          NOT NULL REFERENCES sekolah(id) ON DELETE RESTRICT,
  kantin_id   UUID          NOT NULL REFERENCES kantin(id) ON DELETE RESTRICT,
  dibuat_oleh UUID          REFERENCES users(id) ON DELETE SET NULL,
  tanggal     DATE          NOT NULL,
  sesi        sesi_makan    NOT NULL DEFAULT 'siang',
  kuota_porsi INT           NOT NULL DEFAULT 0,
  status      status_jadwal NOT NULL DEFAULT 'draft',
  catatan     TEXT,
  created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
  UNIQUE (sekolah_id, kantin_id, tanggal, sesi)
);

CREATE TABLE distribusi_detail (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jadwal_id    UUID NOT NULL REFERENCES jadwal_distribusi(id) ON DELETE CASCADE,
  menu_id      UUID NOT NULL REFERENCES menu(id) ON DELETE RESTRICT,
  jumlah_porsi INT  NOT NULL DEFAULT 0,
  harga_at_snapshot NUMERIC(12,2) NOT NULL DEFAULT 0, -- Snapshot harga saat jadwal dibuat
  UNIQUE (jadwal_id, menu_id)
);

CREATE TABLE konsumsi_siswa (
  id           UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
  siswa_id     UUID      NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
  jadwal_id    UUID      NOT NULL REFERENCES jadwal_distribusi(id) ON DELETE CASCADE,
  menu_id      UUID      NOT NULL REFERENCES menu(id) ON DELETE RESTRICT,
  dicatat_oleh UUID      REFERENCES users(id) ON DELETE SET NULL,
  hadir        BOOLEAN   NOT NULL DEFAULT FALSE,
  makan        BOOLEAN   NOT NULL DEFAULT FALSE,
  waktu_scan   TIMESTAMP,
  catatan      TEXT,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (siswa_id, jadwal_id)
);

CREATE TABLE laporan (
  id               UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id          UUID          NOT NULL REFERENCES sppg(id) ON DELETE RESTRICT,
  sekolah_id       UUID          NOT NULL REFERENCES sekolah(id) ON DELETE RESTRICT,
  dibuat_oleh      UUID          REFERENCES users(id) ON DELETE SET NULL,
  disetujui_oleh   UUID          REFERENCES users(id) ON DELETE SET NULL,
  periode_mulai    DATE          NOT NULL,
  periode_selesai  DATE          NOT NULL,
  total_jadwal     INT           NOT NULL DEFAULT 0,
  total_porsi      INT           NOT NULL DEFAULT 0,
  total_siswa      INT           NOT NULL DEFAULT 0,
  total_hadir      INT           NOT NULL DEFAULT 0,
  total_makan      INT           NOT NULL DEFAULT 0,
  total_biaya      NUMERIC(15,2) DEFAULT 0, -- Tambahan untuk rekap anggaran
  persen_kehadiran NUMERIC(5,2)  DEFAULT 0,
  persen_konsumsi  NUMERIC(5,2)  DEFAULT 0,
  catatan          TEXT,
  status           status_laporan NOT NULL DEFAULT 'draft',
  disetujui_at     TIMESTAMP,
  created_at       TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP     NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_periode CHECK (periode_selesai >= periode_mulai)
);

CREATE TABLE notifikasi (
  id               UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pengirim_id      UUID            REFERENCES users(id) ON DELETE SET NULL,
  judul            VARCHAR(200)    NOT NULL,
  pesan            TEXT            NOT NULL,
  tipe             tipe_notifikasi  NOT NULL DEFAULT 'info',
  referensi_id     UUID,
  referensi_tabel  VARCHAR(50),
  is_read          BOOLEAN         NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMP       NOT NULL DEFAULT NOW()
);