# Cloudflare D1 —— 两个计数器（`/api/nudge`、`/api/visit`）

> 代码：`functions/api/nudge.js`、`functions/api/visit.js`（Cloudflare Pages Functions，与 Astro 的 `dist/` 一起部署）。
> 客户端：`src/components/FanPage.astro`（催更计次）、`src/layouts/Layout.astro`（页面加载计次）。
> 什么时候读：动这两个接口、动 D1 绑定、或者数字看起来不对的时候。

⚠️ **这一页是从代码反推的，不是从控制台导出的。** 建表和绑定都在 Cloudflare 控制台里做的，仓库里原本没有任何记录。下面「表结构」一节写的是**代码要求的形状**；如果和线上不一致，以线上为准，然后回来改这里。

## 一、绑定

| 位置 | 名字 | 说明 |
| --- | --- | --- |
| Pages 项目 → Settings → Functions → D1 database bindings | **`DB`** | 代码里读 `context.env.DB`。改名就必须三处一起改（两个函数 + 这里） |
| 数据库 | 自定 | 绑定指向哪个 D1 实例由控制台决定，代码不关心 |

⚠️ **`astro dev` 里没有这些路由。** `functions/` 是 Cloudflare Pages 的东西，本地 `astro dev` 不认识 `/api/*`，所以：

- `/api/nudge`、`/api/visit` 在 dev 里都是 **404**；
- 页面本身必须能忍受这件事（现在能：见下面「失败时的行为」）；
- 想在本地试接口，用 `npx wrangler pages dev dist`（需要 `wrangler` 登录并配好绑定）。

## 二、表结构（代码要求的形状）

```sql
-- 催更总数：全局一行
CREATE TABLE IF NOT EXISTS nudge_count (
  id    INTEGER PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0
);

-- 每个路径一行，按 section 分组（main / fan）
CREATE TABLE IF NOT EXISTS page_views (
  path    TEXT PRIMARY KEY,
  section TEXT NOT NULL,
  views   INTEGER NOT NULL DEFAULT 0
);
```

⚠️ **`nudge_count` 不再需要手工插种子行。** 原来的实现是 `UPDATE ... WHERE id = 1`，行不存在时**静默什么都不做**（接口照样回 `success: true, count: 0`，日志里一个字都没有）。现在是 upsert：

```sql
INSERT INTO nudge_count (id, count) VALUES (1, 1)
ON CONFLICT(id) DO UPDATE SET count = nudge_count.count + 1
RETURNING count
```

所以老数据库里有没有那一行都无所谓；仍然建议手工确认一次（`SELECT * FROM nudge_count;`），因为**如果 `id` 不是 1，接口会一直加在 1 上**。

## 三、接口

| 方法 | 路径 | 干什么 |
| --- | --- | --- |
| `GET` | `/api/nudge` | 读全局催更数 |
| `POST` | `/api/nudge` | `+1` 并返回新值（upsert + `RETURNING`，一条语句） |
| `GET` | `/api/visit` | 列出所有页面计数（`ORDER BY section, views DESC`） |
| `POST` | `/api/visit` | `{ "path": "/lab" }` → 该路径 `+1`，不存在则建行 |

⚠️ **路径归一化在两端各写了一遍**（服务端 `normalizePath`，客户端 `Layout.astro` 里那三行）：去掉尾部斜杠、`/` 保持 `/`。改一边必须改另一边，否则同一个页面会被记成两条（`/lab` 和 `/lab/`）。

⚠️ **`section` 只分 `main` / `fan`**，判据是路径前缀（`/fan`、`/zh/fan`、`/nl/fan` 及它们的子路径）。以后加子页面不用改。

⚠️ **`POST /api/visit` 信客户端传来的 `path`。** 个人站无所谓，但要知道：任何人可以往表里写任意路径字符串。真要收紧就加长度上限 + 白名单字符（代码里现在只校验「以 `/` 开头」）。

## 四、失败时的行为（这是设计的一部分）

| 情况 | 表现 |
| --- | --- |
| 接口 404（本地 dev） | 控制台一条 `console.warn`（**不是 error**），数字退化成「本地本次会话计数」 |
| 接口 500 / 数据库挂了 | 同上：页面照常，只是全局数不涨 |
| 请求慢 | **催更的玩具不等它** —— 视觉反馈是同步的，计数是乐观 +1 后由服务端校正 |

⚠️ **催更按钮的第一版把玩具挂在了网络上**：`await fetch('/api/nudge')` 成功之后才播放按压动画、头像跳跃、回复文案和掉水果。结果是接口一挂（dev 里必然挂）**按钮什么也不做**，线上也要等 100–250ms 才有反馈。现在顺序反过来了：点击先出画面，`void sendNudge()` 去补计数。

⚠️ **`applyServerCount` 只让数字前进**，所以多个请求乱序返回时不会把新值覆盖回旧值；请求失败也不回滚本地数字（全局总数是锦上添花，玩具才是本体）。

## 五、复验

| 脚本（`输入/_scratch/`） | 查什么 |
| --- | --- |
| `nudge-offline.mjs` | 把 `/api/nudge` **屏蔽**和**延迟 900ms** 两种情况下各按一次：玩具必须在 **<400ms** 出现（实测 7–8ms），回复同帧出现，计数仍然前进 |
| `nudge-check.mjs` | 回复池的文案（与 D1 无关，但同一个模块） |
| `final-check.mjs` | 页面行为总检：11 种水果、无碎片、回复池随机且不重复 |

⚠️ 线上核对数字最省事的办法：`GET /api/nudge`、`GET /api/visit` 直接看 JSON。
