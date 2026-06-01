# Simple Weight Tracker PWA 设计文档

版本：0.1  
状态：Draft  
目标平台：iPhone / iOS Safari / Home Screen PWA  
部署目标：GitHub Pages  
应用模式：纯前端、离线优先、本地数据存储

---

## 1. 项目概述

Simple Weight Tracker 是一个用于个人记录体重的轻量级 Progressive Web App。应用主要面向 iPhone 用户，可通过 Safari 添加到主屏幕，以接近原生 app 的方式运行。

本项目不使用 iOS native development，不通过 App Store 分发，不依赖服务器保存用户数据。体重记录默认保存在用户设备本地，并通过手动导出/导入文件完成备份和恢复。

核心设计目标是：

> 在正常使用情况下，数据应稳定保存在本机；在换手机、删除 app、清除网站数据、重新安装或跨设备使用等非常规情况下，允许用户通过手动导出的备份文件恢复数据。

---

## 2. Goals

### 2.1 产品目标

- 提供一个简单、可靠、私密的体重记录工具。
- 可作为 iOS PWA 添加到主屏幕。
- 不需要 App Store。
- 不需要 iOS 原生开发。
- 日常使用不需要联网。
- 数据默认保存在本地。
- 支持手动导出和导入备份文件。
- 支持导出人类可读或可分析的数据格式。
- 在 app 内明确显示本地数据保存状态。

### 2.2 技术目标

- 使用现代前端开发栈。
- 支持 TypeScript。
- 支持 `pnpm dev` 本地开发。
- 使用 IndexedDB 保存结构化数据。
- 请求 persistent storage，降低浏览器自动清理本地数据的风险。
- 使用 Service Worker 缓存应用资源，实现离线打开。
- 使用 GitHub Pages 提供 HTTPS 静态托管。
- 保持项目可以纯静态部署，不依赖后端服务。

---

## 3. Non-goals

第一版不做以下内容：

- 不做账号系统。
- 不做云同步。
- 不做服务器端数据库。
- 不做后台同步。
- 不做多人共享。
- 不做医疗建议。
- 不做 Apple Health 集成。
- 不做推送通知作为核心功能。
- 不承诺删除 app、换手机、清除网站数据后自动恢复。
- 不承诺“数据永久不会丢失”。

---

## 4. 目标用户场景

### 4.1 首次安装

1. 用户在 iPhone Safari 打开 GitHub Pages HTTPS 地址。
2. 用户通过 Safari 分享菜单选择“添加到主屏幕”。
3. 用户从主屏幕图标打开 app。
4. app 检测当前是否为 standalone PWA 模式。
5. 用户保存第一条体重记录。
6. app 将记录写入 IndexedDB。
7. app 请求 `navigator.storage.persist()`。
8. app 在“数据与备份”页面显示本地保存状态。

### 4.2 日常使用

1. 用户从主屏幕打开 app。
2. 用户输入当天体重。
3. app 将数据保存到 IndexedDB。
4. 用户可以查看、编辑、删除历史记录。
5. app 即使在无网络状态下也可以打开和记录数据。

### 4.3 手动备份

1. 用户进入“数据与备份”页面。
2. 用户点击“导出 JSON 备份”。
3. app 生成 JSON 文件。
4. 用户将文件保存到 iCloud Drive、Files、AirDrop、电脑或其他位置。

### 4.4 恢复数据

适用于以下情况：

- 换手机。
- 删除 PWA 后重新安装。
- 清除 Safari 网站数据。
- 改变部署 URL。
- 在另一台设备上安装 app。
- 数据异常后需要回滚。

流程：

1. 用户重新打开或安装 app。
2. 用户进入“数据与备份”页面。
3. 用户选择 JSON 备份文件。
4. app 校验备份格式。
5. app 将数据导入 IndexedDB。
6. app 更新历史记录列表。

---

## 5. 推荐技术栈

| 领域           | 推荐方案        |
| -------------- | --------------- |
| 构建工具       | Vite            |
| UI 框架        | React           |
| 语言           | TypeScript      |
| 包管理器       | pnpm            |
| PWA 支持       | vite-plugin-pwa |
| 本地数据库     | IndexedDB       |
| IndexedDB 封装 | Dexie.js        |
| 日期处理       | date-fns        |
| 图表           | Recharts，可选  |
| 测试           | Vitest          |
| 静态托管       | GitHub Pages    |

---

## 6. 开发工作流

### 6.1 初始化项目

```bash
pnpm create vite simple-weight-tracker --template react-ts
cd simple-weight-tracker
pnpm install
```

### 6.2 安装依赖

```bash
pnpm add dexie date-fns
pnpm add -D vite-plugin-pwa vitest eslint prettier gh-pages
```

如果需要趋势图：

```bash
pnpm add recharts
```

### 6.3 常用命令

```bash
pnpm dev
pnpm build
pnpm preview
pnpm deploy
```

建议含义：

| 命令           | 用途                   |
| -------------- | ---------------------- |
| `pnpm dev`     | 本地开发 UI 和业务逻辑 |
| `pnpm build`   | 构建生产静态资源       |
| `pnpm preview` | 本地预览生产构建结果   |
| `pnpm deploy`  | 部署到 GitHub Pages    |

### 6.4 本地 iPhone 测试

电脑和 iPhone 在同一个 LAN 内时，可以用：

```bash
pnpm dev --host 0.0.0.0
```

然后在 iPhone Safari 打开：

```text
http://电脑局域网IP:5173
```

该方式适合测试：

- 移动端布局。
- 表单交互。
- 基本 IndexedDB 读写。
- 导出/导入 UI。

但不适合完整测试：

- Service Worker。
- 离线缓存。
- PWA 安装行为。
- persistent storage 真实授权情况。

完整 PWA 测试应使用 HTTPS，例如 GitHub Pages。

---

## 7. 部署方案

### 7.1 推荐部署地址

项目可以部署到 GitHub Pages project site：

```text
https://你的用户名.github.io/simple-weight-tracker/
```

这是子路径部署，不是根路径部署。

### 7.2 Vite base 配置

如果仓库名是 `simple-weight-tracker`，Vite 需要设置：

```ts
base: "/simple-weight-tracker/";
```

示例：

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const repoName = "simple-weight-tracker";

export default defineConfig({
  base: `/${repoName}/`,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Simple Weight Tracker",
        short_name: "Weight",
        description: "A private offline-first weight tracker.",
        display: "standalone",
        start_url: `/${repoName}/`,
        scope: `/${repoName}/`,
        theme_color: "#ffffff",
        background_color: "#ffffff",
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icons/maskable-icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
      },
    }),
  ],
});
```

### 7.3 子路径部署注意事项

必须保持以下配置一致：

```text
base      = /simple-weight-tracker/
start_url = /simple-weight-tracker/
scope     = /simple-weight-tracker/
```

图标路径建议使用相对路径：

```text
icons/icon-192.png
```

避免使用：

```text
/icons/icon-192.png
```

否则资源可能被解析到：

```text
https://你的用户名.github.io/icons/icon-192.png
```

而不是：

```text
https://你的用户名.github.io/simple-weight-tracker/icons/icon-192.png
```

### 7.4 路由策略

第一版建议不使用复杂前端路由。可以用单页 app 内部 tab 管理页面状态，例如：

- Today
- History
- Backup
- Settings

如果以后需要路由，GitHub Pages 上建议使用 hash route：

```text
/simple-weight-tracker/#/settings
/simple-weight-tracker/#/history
```

不建议第一版使用 BrowserRouter 的普通路径路由，因为刷新子页面可能出现 404。

### 7.5 URL 稳定性

正式使用后，不应随意更改：

- GitHub 用户名。
- 仓库名。
- 部署路径。
- 自定义域名。
- app 的 `start_url` 和 `scope`。

如果必须更改 URL，用户应先导出 JSON 备份，再到新 URL 中导入。

---

## 8. PWA 安装与运行模式

### 8.1 Safari tab 与主屏幕 PWA

该 app 支持两种运行方式：

| 运行方式        | 用途             |
| --------------- | ---------------- |
| Safari tab      | 试用、预览、调试 |
| Home Screen PWA | 正式使用         |

正式使用应推荐用户添加到主屏幕。

原因：

- 主屏幕 PWA 更接近原生 app 体验。
- 没有普通 Safari 地址栏。
- 更符合长期使用的用户心智。
- 更有利于请求 persistent storage。
- iOS 上 Safari tab 与主屏幕 PWA 的存储环境可能不同。
- 同一 PWA 添加多次也可能产生不同的存储环境。

### 8.2 standalone 检测

```ts
export function isStandalonePWA(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone ===
      true
  );
}
```

### 8.3 UI 行为

如果不是 standalone 模式，显示提示：

```text
建议添加到主屏幕后正式使用。
这样可以获得更像 app 的体验，并提高本地数据持久性。
Safari → 分享 → 添加到主屏幕
```

如果是 standalone 模式，显示：

```text
当前正在主屏幕 App 模式运行。
```

---

## 9. 本地数据持久化策略

### 9.1 总体策略

应用采用以下本地数据可靠性模型：

```text
IndexedDB
+ navigator.storage.persist()
+ navigator.storage.persisted()
+ JSON 导出/导入
```

职责划分：

| 组件                            | 职责                   |
| ------------------------------- | ---------------------- |
| IndexedDB                       | 日常主数据库           |
| Dexie.js                        | IndexedDB 封装         |
| `navigator.storage.persist()`   | 请求持久存储           |
| `navigator.storage.persisted()` | 检查是否已获得持久存储 |
| `navigator.storage.estimate()`  | 显示存储使用量和配额   |
| JSON 导出/导入                  | 非常规情况下的数据恢复 |
| CSV / Markdown / TXT 导出       | 人类可读或分析用途     |

### 9.2 数据可靠性边界

当满足以下条件时，可以认为 app 达到“正常使用时数据不应丢失”的设计目标：

```text
✅ 从主屏幕 PWA 打开
✅ IndexedDB 可用
✅ navigator.storage.persisted() === true
✅ 最近一次数据库写入成功
✅ JSON 导出/导入功能可用
```

该目标不覆盖以下情况：

- 用户删除主屏幕 PWA。
- 用户清除 Safari 网站数据。
- 用户换手机。
- 用户更改 app URL。
- 设备损坏或丢失。
- iOS 系统级异常。
- app bug 写坏数据。
- IndexedDB migration 失败。
- 用户从不同 origin 打开 app。

这些情况必须通过 JSON 备份恢复。

### 9.3 请求持久存储

```ts
export type StoragePersistenceStatus = {
  supported: boolean;
  persisted: boolean;
  quota: number | null;
  usage: number | null;
};

export async function getStoragePersistenceStatus(): Promise<StoragePersistenceStatus> {
  const storage = navigator.storage;

  if (!storage) {
    return {
      supported: false,
      persisted: false,
      quota: null,
      usage: null,
    };
  }

  const [persisted, estimate] = await Promise.all([
    storage.persisted ? storage.persisted() : Promise.resolve(false),
    storage.estimate ? storage.estimate() : Promise.resolve(null),
  ]);

  return {
    supported: Boolean(storage.persist && storage.persisted),
    persisted,
    quota: estimate?.quota ?? null,
    usage: estimate?.usage ?? null,
  };
}

export async function requestPersistentStorage(): Promise<StoragePersistenceStatus> {
  const storage = navigator.storage;

  if (!storage?.persist || !storage.persisted) {
    return getStoragePersistenceStatus();
  }

  const alreadyPersisted = await storage.persisted();

  if (!alreadyPersisted) {
    await storage.persist();
  }

  return getStoragePersistenceStatus();
}
```

### 9.4 触发时机

建议在以下时机请求 persistent storage：

1. 用户第一次保存体重记录后。
2. 用户在“数据与备份”页面点击“检查/启用持久存储”。
3. app 启动时只检查状态，不频繁请求。

不建议每次保存都重复请求。

---

## 10. 数据模型

### 10.1 WeightEntry

```ts
export type WeightUnit = "kg" | "lb";

export type WeightEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number;
  unit: WeightUnit;
  note?: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
};
```

### 10.2 Backup File

```ts
export type WeightTrackerBackup = {
  app: "simple-weight-tracker";
  schemaVersion: 1;
  exportedAt: string;
  entries: WeightEntry[];
};
```

### 10.3 IndexedDB Schema

使用 Dexie：

```ts
import Dexie, { type Table } from "dexie";
import type { WeightEntry } from "../types/weight";

class WeightTrackerDatabase extends Dexie {
  weightEntries!: Table<WeightEntry, string>;

  constructor() {
    super("simple-weight-tracker");

    this.version(1).stores({
      weightEntries: "id, date, createdAt, updatedAt",
    });
  }
}

export const db = new WeightTrackerDatabase();
```

注意事项：

- 数据库名不应随意更改。
- 表结构变更必须通过 Dexie version migration。
- 不应在 app 更新时清空数据库。
- schemaVersion 应同时体现在导出文件中。

---

## 11. 核心功能范围

### 11.1 MVP 功能

第一版应实现：

- 添加体重记录。
- 编辑体重记录。
- 删除体重记录。
- 查看历史记录。
- 按日期排序。
- IndexedDB 本地保存。
- PWA manifest。
- Service Worker 离线缓存。
- 检测是否 standalone PWA。
- 请求 persistent storage。
- 显示数据保存状态。
- JSON 备份导出。
- JSON 备份导入。
- CSV 导出。
- GitHub Pages 部署。

### 11.2 第二版功能

后续可考虑：

- Markdown 导出。
- TXT 导出。
- 趋势图。
- kg / lb 切换。
- 目标体重。
- 7 日 / 30 日移动平均。
- 最近备份时间提醒。
- app version 显示。
- 数据校验报告。
- 更完整的导入冲突处理。
- UI polish。

---

## 12. 数据与备份页面

建议提供一个独立的“数据与备份”页面。

### 12.1 显示状态

应展示：

- 运行模式：Safari tab / Home Screen PWA。
- IndexedDB 状态：可用 / 不可用。
- persistent storage：已启用 / 未启用 / 不支持。
- 存储 usage。
- 存储 quota。
- 最近一次 JSON 备份时间。
- app version。
- 当前部署 URL。
- 数据条数。

### 12.2 操作按钮

应包含：

- 检查存储状态。
- 请求持久存储。
- 导出 JSON 备份。
- 导入 JSON 备份。
- 导出 CSV。
- 导出 Markdown。
- 导出 TXT。
- 清空全部数据，需二次确认。

### 12.3 提示逻辑

如果不是 standalone：

```text
当前正在 Safari 浏览器中运行。建议添加到主屏幕后正式记录体重。
```

如果 `persisted() !== true`：

```text
本地数据已经保存，但尚未获得持久存储保护。浏览器仍可能在空间压力或策略清理时删除数据。建议启用持久存储并导出 JSON 备份。
```

如果从未导出备份：

```text
尚未导出过 JSON 备份。换手机、删除 app 或清除网站数据前，请先导出备份。
```

如果运行环境满足安全本地模式：

```text
当前为主屏幕 App 模式，且持久存储已启用。正常使用时，本地数据不应被浏览器自动清理。
```

---

## 13. 导入导出策略

### 13.1 格式用途

| 格式     | 用途                     | 是否用于恢复 |
| -------- | ------------------------ | ------------ |
| JSON     | 完整备份与恢复           | 是           |
| CSV      | 表格分析、Numbers、Excel | 否           |
| Markdown | 人类可读记录             | 否           |
| TXT      | 简单文本记录             | 否           |

JSON 是唯一正式恢复格式。

### 13.2 JSON 导出

```ts
import type { WeightEntry } from "../types/weight";

export type WeightTrackerBackup = {
  app: "simple-weight-tracker";
  schemaVersion: 1;
  exportedAt: string;
  entries: WeightEntry[];
};

export function createJsonBackup(entries: WeightEntry[]): string {
  const backup: WeightTrackerBackup = {
    app: "simple-weight-tracker",
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    entries,
  };

  return JSON.stringify(backup, null, 2);
}
```

### 13.3 通用下载函数

```ts
export function downloadTextFile(
  filename: string,
  content: string,
  mimeType: string,
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}
```

### 13.4 JSON 导入校验

导入时必须校验：

- `app` 是否为 `"simple-weight-tracker"`。
- `schemaVersion` 是否支持。
- `entries` 是否为数组。
- 每条记录字段是否合法。
- `weight` 是否为合理数字。
- `unit` 是否为 `"kg"` 或 `"lb"`。
- `date` 是否符合 `YYYY-MM-DD`。
- `createdAt` / `updatedAt` 是否为字符串。

示例：

```ts
import { db } from "../db/db";
import type { WeightEntry } from "../types/weight";

type BackupFile = {
  app?: unknown;
  schemaVersion?: unknown;
  entries?: unknown;
};

function isWeightEntry(value: unknown): value is WeightEntry {
  if (!value || typeof value !== "object") return false;

  const entry = value as Record<string, unknown>;

  return (
    typeof entry.id === "string" &&
    typeof entry.date === "string" &&
    typeof entry.weight === "number" &&
    Number.isFinite(entry.weight) &&
    (entry.unit === "kg" || entry.unit === "lb") &&
    typeof entry.createdAt === "string" &&
    typeof entry.updatedAt === "string"
  );
}

export async function importJsonBackupText(text: string) {
  const parsed = JSON.parse(text) as BackupFile;

  if (
    parsed.app !== "simple-weight-tracker" ||
    parsed.schemaVersion !== 1 ||
    !Array.isArray(parsed.entries)
  ) {
    throw new Error("Invalid backup file.");
  }

  const entries = parsed.entries;

  if (!entries.every(isWeightEntry)) {
    throw new Error("Backup contains invalid entries.");
  }

  await db.transaction("rw", db.weightEntries, async () => {
    await db.weightEntries.bulkPut(entries);
  });

  return entries.length;
}
```

### 13.5 导入冲突策略

MVP 可以采用：

```text
相同 id：覆盖
不同 id：新增
```

第二版可以提供更细的选项：

- 合并。
- 覆盖全部。
- 仅导入不存在的数据。
- 导入前自动导出当前数据快照。

---

## 14. 离线策略

### 14.1 Service Worker

使用 `vite-plugin-pwa` 和 Workbox 缓存 app shell。

应缓存：

- `index.html`
- JavaScript bundle
- CSS
- manifest
- icons
- favicon
- 其他静态资源

### 14.2 离线可用能力

无网络时应支持：

- 打开 app。
- 查看历史数据。
- 新增体重记录。
- 编辑记录。
- 删除记录。
- 导出 JSON / CSV / Markdown / TXT。

不需要支持：

- 云同步。
- 后台同步。
- 登录。
- 服务端数据恢复。

---

## 15. 更新与迁移策略

### 15.1 App 更新

建议使用：

```ts
VitePWA({
  registerType: "autoUpdate",
});
```

并在设置页显示：

```text
App version: 0.1.0
```

这样方便确认 iPhone 上运行的是哪个版本。

### 15.2 数据库迁移

规则：

- 不随意更改 IndexedDB 数据库名。
- 不随意更改 object store 名称。
- 修改数据结构必须增加 Dexie version。
- migration 逻辑应向后兼容。
- 部署新版本前应测试旧数据库升级。
- 更新 app 不应导致用户数据丢失。

### 15.3 备份 schema 迁移

备份文件包含：

```text
schemaVersion
```

导入时根据版本处理。

MVP 只支持：

```text
schemaVersion = 1
```

未来如果有 `schemaVersion = 2`，需要提供 migration。

---

## 16. 风险与限制

### 16.1 数据持久性限制

即使启用 persistent storage，也不能防止：

- 用户删除 PWA。
- 用户清除 Safari 网站数据。
- 用户换手机。
- 用户改变部署 URL。
- 用户从不同域名或路径访问 app。
- 设备损坏或丢失。
- 系统异常。
- 应用代码 bug。
- 数据库 migration bug。

因此，JSON 导出/导入是必要功能，不是附属功能。

### 16.2 URL 与 origin 风险

以下 URL 被视为不同环境：

```text
http://192.168.1.23:5173
https://你的用户名.github.io/simple-weight-tracker/
https://你的用户名.github.io/weight/
https://weight.example.com/
```

用户在一个 URL 下保存的数据，不会自动出现在另一个 URL 下。

迁移 URL 前必须导出备份。

### 16.3 GitHub Pages 隐私边界

GitHub Pages 只托管静态文件：

- HTML
- CSS
- JavaScript
- manifest
- icons
- Service Worker

用户体重数据保存在用户设备本地 IndexedDB 中，不会自动上传到 GitHub。

如果仓库是 public，源码公开；但用户数据不公开。

### 16.4 Safari tab 与 Home Screen PWA

iOS 上 Safari tab 和主屏幕 PWA 可能不是同一个存储环境。

因此：

- Safari tab 可用于试用。
- 正式使用应从主屏幕 PWA 开始。
- 如果用户在 Safari tab 中录入数据，安装后可能需要手动导出/导入迁移。

---

## 17. 测试计划

### 17.1 桌面开发测试

测试内容：

- 表单输入。
- 历史列表。
- 编辑记录。
- 删除记录。
- IndexedDB 读写。
- JSON 导出。
- JSON 导入。
- CSV 导出。
- 基本 UI layout。

命令：

```bash
pnpm dev
```

### 17.2 iPhone LAN UI 测试

命令：

```bash
pnpm dev --host 0.0.0.0
```

iPhone 打开：

```text
http://电脑局域网IP:5173
```

测试内容：

- iPhone 屏幕布局。
- 输入体验。
- 日期选择。
- 导出按钮可用性。
- Safari 中的基本 IndexedDB 行为。

### 17.3 GitHub Pages PWA 测试

部署后在 iPhone 上测试：

1. 打开 `https://你的用户名.github.io/simple-weight-tracker/`。
2. 确认无资源 404。
3. Safari 分享 → 添加到主屏幕。
4. 从主屏幕图标打开。
5. 确认无普通 Safari 地址栏。
6. standalone 检测为 true。
7. 保存第一条体重。
8. 请求 persistent storage。
9. 检查 `navigator.storage.persisted()` 状态。
10. 关闭 app 后重新打开。
11. 确认数据仍在。
12. 开启飞行模式。
13. 确认 app 可离线打开。
14. 离线新增记录。
15. 导出 JSON。
16. 删除或清空部分数据。
17. 导入 JSON。
18. 确认数据恢复。
19. 重新部署新版 app。
20. 确认旧数据仍在。

### 17.4 更新测试

测试场景：

- 从 v0.1.0 升级到 v0.1.1。
- Service Worker 是否更新。
- app version 是否变化。
- IndexedDB 数据是否保留。
- persistent storage 状态是否仍可读取。
- 导出/导入是否仍兼容。

### 17.5 备份恢复测试

测试场景：

- 空数据库导入备份。
- 有数据时导入备份。
- 重复 id 导入。
- 非法 JSON 文件。
- app id 不匹配。
- schemaVersion 不支持。
- entries 字段缺失。
- weight 非数字。
- unit 非法。
- date 格式非法。

---

## 18. 推荐项目结构

```text
simple-weight-tracker/
  public/
    icons/
      icon-192.png
      icon-512.png
      maskable-icon-512.png
  src/
    app/
      App.tsx
    components/
      AddWeightForm.tsx
      WeightList.tsx
      StorageStatusCard.tsx
      BackupPanel.tsx
    db/
      db.ts
      weightEntries.ts
    export/
      downloadFile.ts
      exportCsv.ts
      exportJson.ts
      exportMarkdown.ts
      exportTxt.ts
      importJson.ts
    pwa/
      displayMode.ts
      storagePersistence.ts
    types/
      weight.ts
    main.tsx
  index.html
  vite.config.ts
  package.json
  tsconfig.json
```

---

## 19. Package Scripts

建议：

```json
{
  "scripts": {
    "dev": "vite",
    "dev:host": "vite --host 0.0.0.0",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "preview:host": "vite preview --host 0.0.0.0",
    "test": "vitest",
    "lint": "eslint .",
    "deploy": "pnpm build && gh-pages -d dist"
  }
}
```

---

## 20. 用户可见文案原则

不要说：

```text
数据永久保存在本机，绝不会丢失。
```

推荐说：

```text
数据保存在本机。启用持久存储后，浏览器通常不会自动清理这些数据。换手机、删除 app、清除网站数据或设备损坏时，需要通过导出的 JSON 备份恢复。
```

对于非 standalone 模式：

```text
当前正在 Safari 浏览器中运行。建议添加到主屏幕后正式记录体重，以获得更好的 app 体验和本地数据持久性。
```

对于 persistent storage 未启用：

```text
本地数据已经保存，但尚未获得持久存储保护。建议启用持久存储，并定期导出 JSON 备份。
```

对于安全本地模式：

```text
当前为主屏幕 App 模式，且持久存储已启用。正常使用时，本地数据不应被浏览器自动清理。
```

---

## 21. 设计决策摘要

| 决策           | 选择                          | 原因                                    |
| -------------- | ----------------------------- | --------------------------------------- |
| 是否联网       | 不联网                        | 用户希望本地优先和隐私                  |
| 是否做后端     | 不做                          | 静态 PWA 足够                           |
| 是否做账号     | 不做                          | 降低复杂度                              |
| 主数据库       | IndexedDB                     | 适合结构化本地数据                      |
| IndexedDB 封装 | Dexie.js                      | 简化 API                                |
| 持久性增强     | `navigator.storage.persist()` | 降低自动清理风险                        |
| 正式入口       | Home Screen PWA               | 更接近 app，利于持久存储                |
| 托管           | GitHub Pages                  | 免费 HTTPS 静态托管                     |
| 备份格式       | JSON                          | 可完整恢复                              |
| 分析格式       | CSV                           | 可用于表格软件                          |
| 第一版路由     | 无复杂路由                    | 避免 GitHub Pages 404 和 PWA scope 问题 |

---

## 22. MVP 验收标准

第一版完成后，应满足：

- [ ] 可以通过 GitHub Pages HTTPS 打开。
- [ ] 可以添加到 iPhone 主屏幕。
- [ ] 从主屏幕打开时进入 standalone 模式。
- [ ] 可以新增体重记录。
- [ ] 可以编辑体重记录。
- [ ] 可以删除体重记录。
- [ ] 记录保存到 IndexedDB。
- [ ] 关闭并重新打开 app 后数据仍在。
- [ ] 可以请求 persistent storage。
- [ ] 可以显示 persisted 状态。
- [ ] 可以导出 JSON 备份。
- [ ] 可以导入 JSON 备份。
- [ ] 可以导出 CSV。
- [ ] 飞行模式下可以打开 app。
- [ ] 飞行模式下可以新增记录。
- [ ] 重新部署新版 app 后旧数据仍在。
- [ ] “数据与备份”页面能正确显示风险提示。

---

## 23. 结论

该项目适合使用纯前端 PWA 实现。

推荐方案为：

```text
Vite + React + TypeScript + pnpm
+ vite-plugin-pwa
+ Dexie.js / IndexedDB
+ navigator.storage.persist()
+ JSON 导出/导入
+ GitHub Pages HTTPS 部署
```

在不联网的前提下，这已经是 iOS PWA 能提供的较合理数据持久方案。

关键原则是：

```text
IndexedDB 负责日常记录。
persistent storage 负责降低浏览器自动清理风险。
JSON 备份负责非常规恢复。
GitHub Pages 只负责托管 app 代码，不保存用户数据。
```

只要用户从主屏幕 PWA 正式使用，并且 persistent storage 成功启用，正常使用时本地数据不应被浏览器自动清理。对于换手机、删除 app、清除网站数据、设备损坏、改变 URL 等情况，必须依赖用户手动导出的 JSON 备份恢复。
