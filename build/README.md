# Build Directory

The build directory is used to house all the build files and assets for your application.

## 窗口左上角图标配置

- **`appicon.png`**（本目录下）  
  - 用于：macOS 关于窗口、各平台对话框图标；`wails build` 时会据此生成 `windows/icon.ico`，作为 **Windows 窗口标题栏左上角图标** 和可执行文件图标。  
  - 建议尺寸：256×256 或 512×512 像素的 PNG。  
  - 修改后重新执行 `wails build` 即可生效。

- **`app.ico`**（本目录下）  
  - 用于：Windows 系统托盘图标（右下角托盘区）。  
  - 若只改了 `appicon.png`，需自行将 PNG 转为 ICO 并替换 `app.ico`，托盘图标才会更新。

- **`windows/icon.ico`**  
  - 由 Wails 根据 `appicon.png` 自动生成，无需手改。若删除此文件再执行 `wails build`，会重新从 `appicon.png` 生成。

总结：要改 **窗口左上角图标**，只需替换 **`build/appicon.png`** 后按下面步骤操作。

### 图标替换后不生效？按下面做

**重要：程序只认这两个文件名，不要用 appicon1.png / app1.ico。**
- 窗口/关于/对话框图标：**`build/appicon.png`**
- 托盘图标：**`build/app.ico`**  
若你有新图 `appicon1.png`，请**复制并覆盖**为 `build/appicon.png`；新托盘图标同理覆盖为 `build/app.ico`。

1. **必须重新编译**  
   图标通过 `//go:embed` 在**编译时**打进程序，只改文件不重新编译不会生效。  
   - 若用 **`wails dev`**：先**完全退出**（Ctrl+C），再重新执行 `wails dev`，让 Go 重新编译并嵌入新的 `appicon.png`。  
   - 若用 **`wails build`**：替换图标后重新执行一次 `wails build`，再运行**新生成**的 exe（不要用旧的）。

2. **Windows 窗口左上角/任务栏图标**  
   实际用的是 **`build/windows/icon.ico`**，该文件**只在执行 `wails build` 时**从 **`appicon.png`** 自动生成（Wails 不会读 appicon1.png）。  
   - 请先确保新图标已覆盖为 **`build/appicon.png`**。  
   - 删除 **`build/windows/icon.ico`**（若存在），再执行 **`wails build`**，让 Wails 用新图重新生成。  
   - 之后用新打的 exe 或再开 `wails dev`，窗口图标才会更新。

3. **仍不生效时可试**  
   - 清理缓存后重新构建：`go clean -cache`，再执行 `wails build`。  
   - 或删掉整个 **`build/windows`** 目录，再执行 **`wails build`**。  
   - 确认 **`build/appicon.png`** 是 256×256 或 512×512 的 PNG。

The structure is:

* bin - Output directory
* darwin - macOS specific files
* windows - Windows specific files

## Mac

The `darwin` directory holds files specific to Mac builds.
These may be customised and used as part of the build. To return these files to the default state, simply delete them
and
build with `wails build`.

The directory contains the following files:

- `Info.plist` - the main plist file used for Mac builds. It is used when building using `wails build`.
- `Info.dev.plist` - same as the main plist file but used when building using `wails dev`.

## Windows

The `windows` directory contains the manifest and rc files used when building with `wails build`.
These may be customised for your application. To return these files to the default state, simply delete them and
build with `wails build`.

- `icon.ico` - The icon used for the application. This is used when building using `wails build`. If you wish to
  use a different icon, simply replace this file with your own. If it is missing, a new `icon.ico` file
  will be created using the `appicon.png` file in the build directory.
- `installer/*` - The files used to create the Windows installer. These are used when building using `wails build`.
- `info.json` - Application details used for Windows builds. The data here will be used by the Windows installer,
  as well as the application itself (right click the exe -> properties -> details)
- `wails.exe.manifest` - The main application manifest file.