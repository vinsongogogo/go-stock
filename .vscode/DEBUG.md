# 调试说明 (Debug)

## 为什么 `wails debug` 会报错？

**Wails v2 没有 `debug` 子命令**。CLI 只提供：`build`、`dev`、`doctor`、`init`、`update`、`show`、`generate`、`version`。

## 正确的调试方式

### 方式一：VS Code 断点调试（推荐）

1. **仅调试 Go 后端（前端用已打包的 dist）**
   - 按 **F5** 或菜单「运行 → 启动调试」
   - 选择 **「Debug Wails App」**
   - 会先执行 `npm run build` 再启动 Go，可在 Go 代码里下断点

2. **调试 Go + 前端热更新（前端改代码即时生效）**
   - 按 **F5**，选择 **「Debug Wails App (Frontend Dev Mode)」**
   - 会先启动前端的 `npm run dev`（Vite 5173），再启动 Go 并连接该 dev 服务
   - Go 断点、前端修改都可用

### 方式二：命令行开发模式（不断点）

在项目根目录执行：

```powershell
wails dev
```

会编译并运行应用，并监听前端变更（热重载）。适合快速跑起来看效果，不能下 Go 断点。

---

总结：需要断点调试用 **VS Code F5**；不需要断点用 **`wails dev`**。不要使用不存在的 `wails debug`。
