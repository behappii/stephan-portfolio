# behappii.ru

Сайт-портфолио на SvelteKit с админкой для редактирования контента. Дизайн — `docs/design/`, спецификация — `docs/superpowers/specs/`.

## Разработка

```sh
pnpm install
cp .env.example .env
pnpm hash-password            # вставьте выведенную строку ADMIN_PASSWORD_HASH='…' в .env
pnpm dev                      # http://localhost:5173, админка — /admin
```

`pnpm dev` и `pnpm preview` читают `.env` сами; переменные, заданные в окружении, важнее файла. База и картинки лежат в `./data` (переменная `DATA_DIR`). При первом запуске база заполняется текстами из макета.

| Команда                         | Что делает                                                                                          |
| ------------------------------- | --------------------------------------------------------------------------------------------------- |
| `pnpm test`                     | модульные тесты (Vitest)                                                                            |
| `pnpm test:e2e`                 | сквозные тесты (Playwright, сам собирает и поднимает сайт)                                          |
| `pnpm check`, `pnpm lint`       | типы и стиль                                                                                        |
| `pnpm db:generate --name <имя>` | миграция после правки `src/lib/server/db/schema.ts`; затем поднимите `SCHEMA_VERSION` в `client.ts` |

## Развёртывание через Dokploy

1. В Dokploy создайте сервис типа Compose из этого репозитория, ветка `main`, файл `docker-compose.yml`.
2. Во вкладке Environment задайте переменные по образцу `.env.example`: Dokploy положит их в `.env` рядом с compose-файлом.
3. Во вкладке Domains добавьте домен: сервис `web`, порт `3000`, HTTPS через Let's Encrypt.
4. Deploy. Миграции применяются при старте, база и картинки живут в томе `portfolio-data`.

Порт наружу не публикуется: порт 3000 на хосте занят самим Dokploy, а Traefik ходит в контейнер по внутренней сети. Продакшен-сервер (`node build`) доверяет заголовкам `X-Forwarded-*` от Traefik. Без прокси, напрямую по http, формы отвечают 403: adapter-node считает протокол `https`, и проверка origin не проходит. Локально продакшен-сборку смотрите через `pnpm build && pnpm preview`.

## Бэкапы

- В админке → «Бэкапы»: скачать архив, загрузить архив, восстановить один из 10 автобэкапов.
- С сервера: `docker cp $(docker ps -qf label=com.docker.compose.service=web -f name=portfolio):/data ./data-backup` копирует базу, картинки и автобэкапы.
