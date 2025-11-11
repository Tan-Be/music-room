@SETLOCAL
@IF NOT DEFINED NODE_PATH (
  @SET "NODE_PATH=C:\Users\Admin\Documents\Веркин\music-room\node_modules\.pnpm\jest@29.7.0_@types+node@20.19.19\node_modules\jest\bin\node_modules;C:\Users\Admin\Documents\Веркин\music-room\node_modules\.pnpm\jest@29.7.0_@types+node@20.19.19\node_modules\jest\node_modules;C:\Users\Admin\Documents\Веркин\music-room\node_modules\.pnpm\jest@29.7.0_@types+node@20.19.19\node_modules;C:\Users\Admin\Documents\Веркин\music-room\node_modules\.pnpm\node_modules"
) ELSE (
  @SET "NODE_PATH=C:\Users\Admin\Documents\Веркин\music-room\node_modules\.pnpm\jest@29.7.0_@types+node@20.19.19\node_modules\jest\bin\node_modules;C:\Users\Admin\Documents\Веркин\music-room\node_modules\.pnpm\jest@29.7.0_@types+node@20.19.19\node_modules\jest\node_modules;C:\Users\Admin\Documents\Веркин\music-room\node_modules\.pnpm\jest@29.7.0_@types+node@20.19.19\node_modules;C:\Users\Admin\Documents\Веркин\music-room\node_modules\.pnpm\node_modules;%NODE_PATH%"
)
@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\..\jest\bin\jest.js" %*
) ELSE (
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node  "%~dp0\..\jest\bin\jest.js" %*
)
