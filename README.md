# Tracklume Web

> **Tracklume — Track tasks, bugs, and product ideas clearly.**
> Kelola tugas, bug, dan ide produk dengan lebih terarah.

[![CI/CD](https://github.com/Basith-08/tracklume-web/actions/workflows/deploy.yml/badge.svg)](https://github.com/Basith-08/tracklume-web/actions/workflows/deploy.yml)

Tracklume adalah aplikasi web issue tracker untuk tim kecil dan proyek produk.
Aplikasi ini membantu pengguna mencatat pekerjaan, bug, dan ide fitur, lalu
mengelolanya berdasarkan status, prioritas, tipe, assignee, dan due date.
Tagline produk: **Track tasks, bugs, and product ideas clearly.**

Repository ini berisi frontend Tracklume. Data aplikasi disediakan oleh REST
API backend pada repository terpisah. Frontend tidak mengakses PostgreSQL secara
langsung.

Repository: [Basith-08/tracklume-web](https://github.com/Basith-08/tracklume-web)

## Ringkasan produk

Tracklume dibuat untuk menyediakan alur kerja yang ringkas dan mudah dipahami:

1. Pengunjung membuat akun baru atau mencoba demo read-only.
2. Pengguna membuat atau memilih project.
3. Task, bug, dan feature request dibuat sebagai issue.
4. Issue dikelola melalui daftar issue atau Kanban board.
5. Progress dipantau melalui dashboard project.
6. Anggota dan akses project dikelola berdasarkan role.

Frontend bertanggung jawab atas tampilan, navigasi, form, cache server state,
dan pengalaman pengguna. Backend tetap menjadi sumber data dan sumber
authorization utama.

## Fitur MVP

- Authentication: login, register, logout, profile, dan ganti password.
- Project: list, create, edit, archive, delete, switcher, dan project settings.
- Dashboard: total issue, progress, status, priority, type, overdue, dan recent issues.
- Kanban: Backlog, To Do, In Progress, Done, dan Cancelled dengan drag-and-drop.
- Issues: search, filter, sort, pagination, create, edit, detail, delete, dan activity history.
- Members: tambah anggota melalui email, ubah role, dan remove member.
- Onboarding publik: landing page, registration sebagai flow utama, dan demo
  viewer yang tidak dapat mengubah data bersama.
- Platform admin: overview, user directory, pencarian/filter/pagination,
  detail akun, deactivate/reactivate, soft delete, dan restore.
- UX: light/dark mode, responsive layout, loading state, error state, empty state,
  toast, confirmation dialog, dan keyboard-friendly interaction.

## Arsitektur

```text
Browser
  │
  │ same-origin request
  ▼
Next.js App Router + BFF route handlers
  │  HTTP-only session cookie → Bearer token
  │
  ▼
Tracklume REST API (/api/v1)
  │
  ▼
PostgreSQL
```

Browser memanggil route same-origin `/api/backend/*`. Route handler Next.js
meneruskan request ke backend, membaca access token dari HTTP-only cookie, dan
menambahkan header `Authorization`. JWT tidak disimpan di `localStorage` dan
tidak dicetak ke log.

Backend menggunakan response envelope `{ data }` atau collection
`{ data, meta }`. API adapter frontend menangani pemetaan kontrak backend,
termasuk field `snake_case`, pagination, dashboard aggregates, dan project role.

## Teknologi

- Next.js App Router dan React
- TypeScript strict mode
- Tailwind CSS dengan design tokens berbasis CSS variables
- TanStack Query untuk server state dan cache
- React Hook Form dan Zod untuk form serta validasi
- dnd-kit untuk Kanban drag-and-drop
- Lucide React untuk icon
- Vitest dan React Testing Library untuk unit/component test
- Playwright untuk end-to-end test
- Docker multi-stage build dengan Next.js standalone output

## Struktur project

```text
src/
├── app/              # routes, layouts, BFF proxy, dan health endpoint
├── components/       # app shell, UI primitives, dan shared states
├── features/         # auth, projects, issues, members, board, dashboard
├── hooks/            # reusable client hooks
├── lib/              # API client, query keys, permissions, validation, utils
├── styles/           # global styles dan CSS variables
└── types/            # shared types yang mengikuti kontrak backend
e2e/                  # Playwright demo flow
```

## Prasyarat

- Node.js 20 atau lebih baru
- npm 10 atau lebih baru
- Backend Tracklume API aktif dan dapat diakses
- Docker Engine dan Docker Compose v2 untuk menjalankan image/stack

## Menjalankan secara lokal

### 1. Jalankan backend

Backend berada pada repository terpisah. Contoh berikut mengasumsikan backend
tersedia di folder sibling `backend` dan memiliki target Makefile yang sesuai:

```bash
cd /path/to/issueTracker/backend
docker compose up -d db
make migrate-up
make seed
make run
```

Backend lokal diharapkan tersedia pada `http://localhost:8080`.

### 2. Jalankan frontend

```bash
git clone git@github.com:Basith-08/tracklume-web.git
cd tracklume-web
npm ci
cp .env.example .env.local
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

Browser selalu memanggil BFF same-origin melalui `/api/backend/*`. BFF memakai
`INTERNAL_API_URL` untuk meneruskan request ke backend: gunakan `localhost` saat
menjalankan Next.js langsung di host development dan nama service Docker saat
production. URL backend tidak perlu diekspos ke browser.

## Environment variables

| Variable               | Development                    | Production               |
| ---------------------- | ------------------------------ | ------------------------ |
| `IMAGE_TAG`            | `local`                        | commit SHA image         |
| `PLATFORM_DOMAIN`      | `example.com`                  | domain platform          |
| `GHCR_OWNER`           | `basith-08`                    | owner GHCR lowercase     |
| `NEXT_PUBLIC_APP_NAME` | `Tracklume`                    | `Tracklume`              |
| `INTERNAL_API_URL`     | `http://localhost:8080/api/v1` | `http://api:8080/api/v1` |
| `AUTH_COOKIE_NAME`     | `tracklume_session`            | `tracklume_session`      |
| `AUTH_COOKIE_SECURE`   | `false`                        | `true` pada HTTPS        |
| `DEMO_EMAIL`           | `demo@tracklume.local`         | akun viewer backend      |
| `DEMO_PASSWORD`        | `DemoTracklume!`               | credential runtime       |

Mulai dari template berikut:

```bash
cp .env.example .env.local
```

Untuk deployment saat ini, workflow membuat `.env` secara otomatis dengan
nilai berikut:

```env
PLATFORM_DOMAIN=asfinebasith.my.id
GHCR_OWNER=basith-08
NEXT_PUBLIC_APP_NAME=Tracklume
INTERNAL_API_URL=http://api:8080/api/v1
AUTH_COOKIE_NAME=tracklume_session
AUTH_COOKIE_SECURE=true
DEMO_EMAIL=demo@tracklume.local
DEMO_PASSWORD=DemoTracklume!
```

Jangan commit `.env`, JWT secret, private key, atau credential backend.

## Public onboarding dan demo

Halaman `/` adalah entry point publik. Pengguna baru mengikuti alur:

```text
Landing page → Create an account → Login → Create project → Add issues
```

Pengunjung yang hanya ingin melihat produk dapat memilih **Try the read-only
demo**. Tombol ini memanggil route server-side Next.js, sehingga credential
demo tidak pernah dikirim ke browser dan token tetap berada di HTTP-only cookie.

Backend harus menyediakan akun berikut sebagai viewer pada project demo:

```text
Email:    demo@tracklume.local
Password: DemoTracklume!
```

Akun demo viewer tidak dapat membuat, mengubah, atau menghapus issue. Seed
backend saat ini perlu ditambahkan/diubah agar akun tersebut benar-benar ada;
frontend tidak membuat akun demo secara otomatis. Untuk local development,
seed owner backend tetap dapat digunakan:

```text
owner@tracklume.local · Password123!
```

Jangan gunakan akun owner bersama untuk demo publik.

Demo flow:

1. Buka landing page.
2. Pilih `Try the read-only demo`.
3. Buka project demo dan lihat overview, board, issues, serta activity.
4. Untuk alur write-enabled, pilih `Create an account`.

## Platform admin

Platform admin berbeda dari role project. Hanya user dengan
`platform_role=superadmin` yang dapat membuka:

- `/admin` untuk ringkasan user, project, dan issue.
- `/admin/users` untuk search, filter status, pagination, dan deactivate/reactivate.
- `/admin/users/{userID}` untuk detail support, soft delete, dan restore.

Backend tetap melakukan authorization. Frontend hanya mengatur route guard dan
menyembunyikan aksi yang tidak relevan. Buat superadmin dari repository
backend, bukan dengan credential yang di-hard-code:

```bash
ADMIN_BOOTSTRAP_PASSWORD='choose-a-strong-password' \
  go run ./cmd/admin create --email admin@example.com --name 'Platform Admin'
```

Jangan menjadikan superadmin sebagai member otomatis semua project.

## Route utama

| Route                                    | Kegunaan                |
| ---------------------------------------- | ----------------------- |
| `/login`                                 | Login                   |
| `/register`                              | Registrasi              |
| `/projects`                              | Daftar project          |
| `/projects/[projectId]`                  | Overview project        |
| `/projects/[projectId]/board`            | Kanban board            |
| `/projects/[projectId]/issues`           | Issue list              |
| `/projects/[projectId]/issues/[issueId]` | Issue detail            |
| `/projects/[projectId]/members`          | Project members         |
| `/projects/[projectId]/settings`         | Project settings        |
| `/settings/profile`                      | User profile settings   |
| `/admin`                                 | Platform admin overview |
| `/admin/users`                           | Platform user directory |
| `/admin/users/[userId]`                  | Platform user detail    |

## Permission matrix

| Action                      | Owner | Admin | Member | Viewer |
| --------------------------- | :---: | :---: | :----: | :----: |
| Read project dan issues     |  Yes  |  Yes  |  Yes   |  Yes   |
| Create/edit issue           |  Yes  |  Yes  |  Yes   |   No   |
| Delete issue                |  Yes  |  Yes  |   No   |   No   |
| Manage project members      |  Yes  |  Yes  |   No   |   No   |
| Archive/edit/delete project |  Yes  |  Yes  |   No   |   No   |

Permission pada UI hanya untuk pengalaman pengguna. Backend tetap melakukan
enforcement authorization dan dapat mengembalikan `403 Forbidden`.

## Testing dan quality checks

Jalankan check utama dengan perintah berikut:

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

End-to-end test membutuhkan backend demo aktif dan browser Playwright:

```bash
npx playwright install chromium
npm run test:e2e
```

Test E2E mencakup login, membuka demo project, membuat issue, memindahkan
status, membuka detail issue, dan logout.

## Production build dan Docker

Build lokal:

```bash
npm run build
npm start
```

Build dan jalankan image:

```bash
docker build -t tracklume-web:local .
docker run --rm -p 3000:3000 --env-file .env.local tracklume-web:local
```

Image menggunakan Next.js standalone output, multi-stage build, runtime
non-root UID `1001`, port `3000`, dan healthcheck `/api/health`.

Compose production menggunakan image:

```text
ghcr.io/${GHCR_OWNER}/tracklume-web:${IMAGE_TAG}
```

Container terhubung ke network internal `tracklume-web-internal` dan network
Traefik external `edge`. Host publik mengikuti pola
`tracklume.${PLATFORM_DOMAIN}`.

## Deployment GitHub Actions ke VPS

Workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) akan:

1. Membaca konfigurasi build/test dari `build.env`.
2. Menjalankan test di dalam image `BUILD_IMAGE`.
3. Build image menggunakan seluruh build args dari `build.env`.
4. Push image ke GHCR dengan tag commit SHA.
5. Mengubah `IMAGE_TAG` pada `/srv/apps/tracklume-web/.env`.
6. Pull image terbaru dan restart Compose.

### GitHub repository secrets

| Secret             | Keterangan                                        |
| ------------------ | ------------------------------------------------- |
| `PROD_HOST`        | IP address atau hostname VPS                      |
| `PROD_DEPLOY_USER` | User SSH deployment yang dapat menjalankan Docker |
| `PROD_DEPLOY_KEY`  | Private SSH key untuk user deployment             |

`GITHUB_TOKEN` disediakan otomatis oleh GitHub Actions untuk push ke GHCR.
Workflow tidak menyimpan secret backend.

### Persiapan VPS

Pastikan VPS memiliki:

- Docker Engine dan Docker Compose v2.
- Traefik dengan external network bernama `edge`.
- DNS `tracklume.asfinebasith.my.id` mengarah ke VPS.
- Backend API yang dapat dijangkau dari container web.
- User deployment yang dapat menjalankan Docker tanpa `sudo`.
- Package GHCR yang public, atau konfigurasi `docker login ghcr.io` di VPS.

Workflow mengikuti standar template dan mengharapkan `/srv/apps/tracklume-web`
serta `.env` sudah tersedia di VPS. Workflow tidak mengunggah atau membuat
ulang `.env`; hanya `IMAGE_TAG` yang diperbarui.

Buat `.env` satu kali di VPS:

```env
IMAGE_TAG=replace-with-commit-sha
PLATFORM_DOMAIN=asfinebasith.my.id
GHCR_OWNER=basith-08
NEXT_PUBLIC_APP_NAME=Tracklume
INTERNAL_API_URL=http://api:8080/api/v1
AUTH_COOKIE_NAME=tracklume_session
AUTH_COOKIE_SECURE=true
DEMO_EMAIL=demo@tracklume.local
DEMO_PASSWORD=DemoTracklume!
```

Untuk backend pada network Docker yang sama, `INTERNAL_API_URL` memakai nama
service backend, yaitu `http://api:8080/api/v1`. Jangan memakai `localhost` dari
container web karena akan menunjuk ke container web itu sendiri.

### Deploy manual dan rollback

```bash
cd /srv/apps/tracklume-web
docker compose pull
docker compose up -d
docker compose ps
curl -fsS https://tracklume.asfinebasith.my.id/api/health
```

Rollback dilakukan dengan mengganti `IMAGE_TAG` ke commit SHA sebelumnya:

```bash
docker compose pull
docker compose up -d
```

## Security notes

- Session disimpan pada HTTP-only cookie dengan `SameSite` dan `Secure` sesuai environment.
- Access token tidak disimpan pada `localStorage`.
- Description issue tidak dirender sebagai raw HTML.
- Error backend dinormalisasi sebelum ditampilkan kepada pengguna.
- Redirect destination divalidasi untuk mencegah open redirect.
- Backend tetap menjadi sumber authorization utama.
- Public environment variables hanya berisi konfigurasi non-secret.

## Non-goals MVP

Realtime/WebSocket, komentar, attachment, notification, email invitation, OAuth,
sprint, custom fields, subtask, time tracking, billing, rich text editor
kompleks, offline-first, dan aplikasi native mobile.

## Troubleshooting

| Gejala                 | Pemeriksaan                                         |
| ---------------------- | --------------------------------------------------- |
| `503` saat development | Pastikan backend aktif pada port `8080`.            |
| `UPSTREAM_UNAVAILABLE` | Periksa `INTERNAL_API_URL` dari dalam container.    |
| `502` dari Traefik     | Periksa network `edge` dan status health container. |
| Image pull gagal       | Periksa GHCR owner, visibility, dan SHA tag.        |
| Cookie tidak tersimpan | Gunakan HTTPS dan `AUTH_COOKIE_SECURE=true`.        |
| API terkena CORS       | Gunakan BFF `/api/backend/*`, bukan API direct.     |

## Scripts

| Command                | Kegunaan                             |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Development server                   |
| `npm run build`        | Production build                     |
| `npm start`            | Menjalankan production server        |
| `npm run lint`         | ESLint                               |
| `npm run typecheck`    | TypeScript check                     |
| `npm test`             | Unit/component test                  |
| `npm run test:e2e`     | Playwright end-to-end test           |
| `npm run format`       | Format dengan Prettier               |
| `npm run format:check` | Memeriksa format tanpa mengubah file |
