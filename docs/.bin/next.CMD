@SETLOCAL
@IF NOT DEFINED NODE_PATH (
  @SET "NODE_PATH=C:\Users\Admin\Documents\Веркин\music-room\node_modules\.pnpm\next@14.0.3_@babel+core@7.2_c176deb768d5ad4f586932c5c8d2898e\node_modules\next\dist\bin\node_modules;C:\Users\Admin\Documents\Веркин\music-room\node_modules\.pnpm\next@14.0.3_@babel+core@7.2_c176deb768d5ad4f586932c5c8d2898e\node_modules\next\dist\node_modules;C:\Users\Admin\Documents\Веркин\music-room\node_modules\.pnpm\next@14.0.3_@babel+core@7.2_c176deb768d5ad4f586932c5c8d2898e\node_modules\next\node_modules;C:\Users\Admin\Documents\Веркин\music-room\node_modules\.pnpm\next@14.0.3_@babel+core@7.2_c176deb768d5ad4f586932c5c8d2898e\node_modules;C:\Users\Admin\Documents\Веркин\music-room\node_modules\.pnpm\node_modules"
) ELSE (
  @SET "NODE_PATH=C:\Users\Admin\Documents\Веркин\music-room\node_modules\.pnpm\next@14.0.3_@babel+core@7.2_c176deb768d5ad4f586932c5c8d2898e\node_modules\next\dist\bin\node_modules;C:\Users\Admin\Documents\Веркин\music-room\node_modules\.pnpm\next@14.0.3_@babel+core@7.2_c176deb768d5ad4f586932c5c8d2898e\node_modules\next\dist\node_modules;C:\Users\Admin\Documents\Веркин\music-room\node_modules\.pnpm\next@14.0.3_@babel+core@7.2_c176deb768d5ad4f586932c5c8d2898e\node_modules\next\node_modules;C:\Users\Admin\Documents\Веркин\music-room\node_modules\.pnpm\next@14.0.3_@babel+core@7.2_c176deb768d5ad4f586932c5c8d2898e\node_modules;C:\Users\Admin\Documents\Веркин\music-room\node_modules\.pnpm\node_modules;%NODE_PATH%"
)
@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\..\next\dist\bin\next" %*
) ELSE (
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node  "%~dp0\..\next\dist\bin\next" %*
)
