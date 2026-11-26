# Hibira Illusion plugin

Your AI assistant, now with a studio. Ask in plain words for campaign scenes, product shots, game art or a vertical video, and [Hibira Illusion](https://illusion.hibira.io) makes it with your account and puts the finished files straight into your project.

| Skill | Command | What it does |
|---|---|---|
| `illusion-studio` | | The studio itself: picks the right tool for what you describe, says the cost before anything large, follows the job, and downloads the results where your project keeps its assets. Edits, upscales, cut-outs, relighting, wider frames, clips and follow-ups on any result. |
| `game-art-assets` | `/game-art` | Game art that drops into your engine: 8-direction walking characters, animation sheets, effects, UI kits, matching item and prop icons, autotile tilesets, whole level maps and animated chests and doors, with Tiled, Godot 4, Unity and Aseprite files. It reads your project first so every piece matches your tile size and look. |
| `ad-creatives` | `/ad-set` | Your real product in campaign scenes with its label kept exact, every aspect ratio in one go, promo clips, and Shorts, Reels and TikToks with voice-over and captions, handed over as a named campaign folder. Nothing is ever published for you. |

## Set up

1. Open the [portal](https://illusion.hibira.io/portal), go to **API** and create a token with **Read and write** access (read only can look but not create).
2. Keep it in your environment, never in a file you commit:

   ```sh
   export ILLUSION_API_TOKEN=ilk_pat_…
   ```

3. Install the plugin and start your assistant from that shell.

### Claude Code

```sh
claude plugin marketplace add hibira-io/agent-plugin
claude plugin install hibira-illusion@hibira
```

`/mcp` then shows `illusion` as connected.

### Codex CLI

```sh
codex plugin marketplace add hibira-io/agent-plugin
codex plugin add hibira-illusion@hibira
```

### Cursor

```sh
git clone https://github.com/hibira-io/agent-plugin.git /tmp/hibira-agent-plugin
cp -R /tmp/hibira-agent-plugin/plugins/illusion ~/.cursor/plugins/local/hibira-illusion
```

and restart Cursor from a shell where `ILLUSION_API_TOKEN` is set.

### Other clients

Copy `skills/` into your client's skills folder and add the MCP server `https://illusion.hibira.io/mcp` with the header `Authorization: Bearer <your token>`. The [setup guide](https://illusion.hibira.io/guides/ai-assistants) shows each client.

## What it can do

The `illusion` MCP server (`https://illusion.hibira.io/mcp`) gives the assistant these tools:

| Tool | What it does |
|---|---|
| `list_pipelines` | Everything you can make, with its options and cost |
| `estimate_job` | The credits a job would take, without starting it |
| `upload_image_data`, `create_upload` | Send in a picture to edit, animate or place |
| `generate` | Start a job |
| `get_job`, `list_jobs` | Follow a job and get its files |
| `cancel_job`, `delete_job` | Stop a job, or delete it for good (only after you agree) |
| `get_account`, `get_usage` | Your plan, credits and usage |

Jobs are charged in credits like jobs from the studio, and they stay in your library on the web. The assistant says the cost before batches and videos, and asks before deleting anything. Creations made on a paid plan may be used commercially, including for clients.

## 中文摘要

讓你的 AI 助理多一間工作室：用一句話描述，[Hibira Illusion](https://illusion.hibira.io) 就用你的帳號做出廣告情境圖、商品照、遊戲美術或直式短影音，並把成品直接放進你的專案。

- **工作室**（`illusion-studio`）：依你的描述挑對工具，大批量或影片前先報點數，完成後把檔案下載到專案的素材資料夾；可再修圖、放大、去背、改光線、擴圖或做成影片。
- **遊戲美術**（`/game-art`）：八方向行走角色、動畫序列、特效、UI 套件、成套道具圖示、自動拼接地圖塊、整張關卡地圖、會開的寶箱與門，附 Tiled、Godot 4、Unity、Aseprite 檔；先讀你的專案，讓每件美術都符合格子大小與風格。
- **廣告素材**（`/ad-set`）：把你真實的商品放進情境、標籤一字不改，一次產出所有比例，也能做商品短片與附配音字幕的 Shorts／Reels／TikTok，整理成命名好的活動資料夾。絕不替你發布。

在入口網站 **API** 頁建立「讀取與寫入」權杖，放進環境變數 `ILLUSION_API_TOKEN`（不要貼進對話或提交到 git），再安裝外掛：`claude plugin install hibira-illusion@hibira`。付費方案的作品可商用（含接案）。
