# Tracklume Web

Tracklume adalah frontend issue tracker untuk task, bug, dan feature request.

> Tracklume — Track tasks, bugs, and product ideas clearly.
>
> Kelola tugas, bug, dan ide produk dengan lebih terarah.

Frontend ini hanya berkomunikasi dengan REST API backend. Browser dan container
web tidak mengakses PostgreSQL secara langsung.

Repository: `git@github.com:Basith-08/tracklume-web.git`

## Tentang Tracklume

Tracklume adalah aplikasi web issue tracker untuk tim kecil dan proyek produk.
Aplikasi ini membantu pengguna mencatat pekerjaan, bug, dan ide fitur dalam
satu tempat, kemudian mengelolanya berdasarkan status, prioritas, tipe,
assignee, dan due date.

Alur utama pengguna adalah:

1. Login atau membuat akun.
2. Membuat atau memilih project.
3. Membuat issue dengan tipe task, bug, atau feature.
4. Mengatur issue melalui daftar issue dan Kanban board.
5. Memantau progres melalui dashboard.
6. Mengelola anggota project berdasarkan role Owner, Admin, Member, atau Viewer.

Tracklume terdiri dari frontend ini dan backend REST API pada repository
terpisah. Frontend bertanggung jawab atas tampilan, navigasi, form, cache
server state, dan pengalaman pengguna. Backend tetap menjadi sumber data serta
sumber authorization utama; frontend tidak pernah mengakses PostgreSQL secara
langsung.

Project ini ditujukan untuk demo end-to-end dan penggunaan internal skala
kecil. Fitur kolaborasi realtime, komentar, attachment, notifikasi, OAuth,
sprint, dan billing sengaja berada di luar cakupan MVP.

## Fitur MVP

- Login, register, session HTTP-only cookie, logout, profile, dan ganti password.
- Project list, create/edit/archive project, project switcher, dan project settings.
- Overview dashboard dari API.
- Kanban Backlog, To do, In progress, Done, Cancelled dengan drag-and-drop optimistic update.
- Issue list dengan search debounce, filter, sorting, URL state, dan pagination.
- Create/edit/detail/delete issue, activity history, due date, assignee, dan permission-aware actions.
- Members: add by registered email, role update, dan remove member.
- Light/dark mode, responsive drawer, loading/error/empty states, dan keyboard-friendly dialogs.

## Stack dan struktur

Next.js App Router, React, TypeScript strict, Tailwind CSS, TanStack Query,
React Hook Form, Zod, dnd-kit, Lucide, Vitest, Testing Library, dan Playwright.

```text
src/
├── app/              # routes, layouts, BFF proxy, health endpoint
├── components/       # shell, UI primitives, shared states
├── features/         # auth, projects, issues, project forms
├── lib/              # API client, query keys, permissions, validation, utils
├── styles/           # CSS variables dan Tailwind entrypoint
└── types/            # shared backend-aligned types
e2e/                  # Playwright demo flow
```

## Requirement dan local development

- Node.js 20+
- npm 10+
- Backend API tersedia di `http://localhost:8080`

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Buka `http://localhost:3000`.

Saat development, BFF memakai `NEXT_PUBLIC_API_URL`. Saat production/container,
BFF memprioritaskan `INTERNAL_API_URL`.

Contoh backend lokal:

```bash
cd /home/junichirou/Documents/code/issueTracker/backend
docker compose up -d db
make migrate-up
make seed
make run
```

## Environment variables

| Variable               | Contoh                                    | Keterangan                           |
| ---------------------- | ----------------------------------------- | ------------------------------------ |
| `IMAGE_TAG`            | `abc123`                                  | Tag image production                 |
| `PLATFORM_DOMAIN`      | `example.com`                             | Host menjadi `tracklume.example.com` |
| `GHCR_OWNER`           | `basith-08`                               | Owner image GHCR dalam lowercase     |
| `NEXT_PUBLIC_APP_NAME` | `Tracklume`                               | Nama produk non-secret               |
| `NEXT_PUBLIC_API_URL`  | `http://localhost:8080/api/v1`            | URL API untuk development            |
| `INTERNAL_API_URL`     | `http://host.docker.internal:8080/api/v1` | URL API dari container               |
| `AUTH_COOKIE_NAME`     | `tracklume_session`                       | Nama cookie session                  |
| `AUTH_COOKIE_SECURE`   | `false`                                   | Set `true` di production HTTPS       |

Jangan commit `.env`, JWT secret, private key, atau credential backend.

## Backend integration dan authentication

Browser memanggil route same-origin `/api/backend/*`. Route handler Next.js
meneruskan request ke backend, mengambil token dari HTTP-only cookie, lalu
menambahkan Bearer token. JWT tidak disimpan di localStorage dan tidak ditulis
ke log.

Backend memakai prefix `/api/v1` dan envelope `{ data }` atau collection
`{ data, meta }`. Adapter frontend menangani perbedaan field backend seperti
`user_id`, dashboard aggregates, dan project role.

Backend demo saat ini menyediakan:

```text
owner@issueflow.local
Password123!
```

Email demo tetap memakai domain `issueflow.local` karena mengikuti seed backend
yang belum di-rename.

## Testing

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:e2e
```

E2E membutuhkan backend demo aktif dan Chromium Playwright:

```bash
npx playwright install chromium
npm run test:e2e
```

## Production build dan Docker

```bash
npm run build
npm start

docker build -t tracklume-web:local .
docker run --rm -p 3000:3000 --env-file .env.local tracklume-web:local
```

Dockerfile memakai Next.js standalone output, multi-stage build, runtime
non-root `appuser`, port `3000`, dan healthcheck `/api/health`.

`compose.yaml` menjalankan image:

```text
ghcr.io/${GHCR_OWNER}/tracklume-web:${IMAGE_TAG}
```

Compose memakai network external Traefik `edge`, network internal
`tracklume-web-internal`, dan hostname `tracklume.${PLATFORM_DOMAIN}`.

## Push ke GitHub

Workspace ini tidak memiliki metadata Git yang usable, jadi jalankan dari root
repository setelah memastikan GitHub repository sudah dibuat:

```bash
git init
git branch -M main
git remote add origin git@github.com:Basith-08/tracklume-web.git
git add -A
git commit -m "feat: build Tracklume frontend"
git push -u origin main
```

Pastikan repository visibility di GitHub diset ke `Public`. Package GHCR juga
perlu diset `Public` bila VPS akan pull image tanpa login GHCR.

## GitHub Actions

Workflow `.github/workflows/deploy.yml` menjalankan format check, lint,
typecheck, unit/component test, production build, build image, push GHCR, dan
deploy SSH ke VPS.

Image yang dipush:

```text
ghcr.io/<github-repository-owner-lowercase>/tracklume-web:<commit-sha>
```

GitHub repository secrets yang perlu disiapkan:

| Secret             | Isi                                                           |
| ------------------ | ------------------------------------------------------------- |
| `PROD_HOST`        | IP atau hostname VPS                                          |
| `PROD_DEPLOY_USER` | User SSH deployment                                           |
| `PROD_DEPLOY_KEY`  | Private SSH key untuk user tersebut                           |
| `PROD_APP_DIR`     | Directory aplikasi di VPS, misalnya `/srv/apps/tracklume-web` |

`GITHUB_TOKEN` sudah disediakan otomatis oleh GitHub Actions untuk push ke GHCR.
Jangan menaruh token itu manual di workflow.

## Persiapan VPS

Siapkan hal berikut:

1. Docker Engine dan Docker Compose v2.
2. Traefik aktif dengan external network bernama `edge`.
3. DNS `tracklume.<PLATFORM_DOMAIN>` mengarah ke IP VPS.
4. User deployment SSH yang dapat menjalankan Docker tanpa sudo.
5. Directory deployment yang akan diberikan melalui secret `PROD_APP_DIR`.
6. Backend API sudah berjalan dan dapat dijangkau dari container web.

Workflow otomatis membuat `PROD_APP_DIR`, meng-upload `compose.yaml`, dan
membuat `.env` production pada setiap deploy. Tidak perlu membuat file tersebut
secara manual.

Contoh `.env` production:

```env
IMAGE_TAG=<commit-sha>
PLATFORM_DOMAIN=asfinebasith.my.id
GHCR_OWNER=basith-08
NEXT_PUBLIC_APP_NAME=Tracklume
NEXT_PUBLIC_API_URL=https://api-tracklume.asfinebasith.my.id/api/v1
INTERNAL_API_URL=https://api-tracklume.asfinebasith.my.id/api/v1
AUTH_COOKIE_NAME=tracklume_session
AUTH_COOKIE_SECURE=true
```

Jika backend dan frontend berada pada network Docker yang sama, gunakan nama
service backend untuk `INTERNAL_API_URL`, misalnya
`http://<backend-service>:8080/api/v1`. Jangan gunakan `localhost` dari dalam
container web karena itu menunjuk ke container web sendiri.

Deploy manual:

```bash
cd /srv/apps/tracklume-web
docker compose pull
docker compose up -d
docker compose ps
curl -fsS https://tracklume.asfinebasith.my.id/api/health
```

Rollback dilakukan dengan mengubah `IMAGE_TAG` ke commit SHA sebelumnya lalu:

```bash
docker compose pull
docker compose up -d
```

## Permission matrix

| Action                      | Owner | Admin | Member | Viewer |
| --------------------------- | ----- | ----- | ------ | ------ |
| Read project/issues         | yes   | yes   | yes    | yes    |
| Create/edit issue           | yes   | yes   | yes    | no     |
| Delete issue                | yes   | yes   | no     | no     |
| Manage members              | yes   | yes   | no     | no     |
| Archive/edit/delete project | yes   | yes   | no     | no     |

UI permission hanya untuk pengalaman pengguna. Backend tetap menjadi sumber
authorization utama.

## Non-goals MVP

Realtime/WebSocket, comments, attachments, notifications, email invitation,
OAuth, sprint, custom fields, subtasks, time tracking, billing, rich text
kompleks, offline-first, dan aplikasi native mobile.

## Troubleshooting

- `UPSTREAM_UNAVAILABLE`: periksa `INTERNAL_API_URL` dari sudut pandang container.
- `503` saat `npm run dev`: pastikan backend aktif di port `8080`.
- `502` dari Traefik: pastikan service sehat dan network `edge` tersedia.
- Image pull gagal: pastikan `GHCR_OWNER`, package name, visibility, dan tag SHA benar.
- Cookie tidak tersimpan: production harus HTTPS dan `AUTH_COOKIE_SECURE=true`.
