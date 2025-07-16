> 中文 | [English](./structure.md)

## ✨ 项目结构

```text
src/
├── assets/                 # 静态资源
├── common/                 # 通用可复用模块
│   ├── actions/            # 共享动作类型、工厂与逻辑
│   ├── components/         # 共享 UI 组件
│   ├── modals/             # 共享弹窗组件
│   ├── types/              # 共享类型定义
│   └── utils/              # 共享工具函数
├── core/                   # 核心业务逻辑（如 ActionDispatcher）
├── locales/                # 国际化文件
├── services/               # 服务层（文件、命令、脚本、URL 等）
├── settings/               # 设置页专用模块
│   └── sections/           # 设置页分区
└── views/                  # 主面板视图层
    ├── managers/           # 视图状态与移动管理（仅面板用）
    └── renderers/          # 视图渲染器
```

- 目录和文件命名均采用小驼峰或大驼峰风格，便于维护和查找。
- 通用、视图、设置、服务、核心等分层清晰，便于扩展和协作。
- 主要功能如按钮面板、分类、动作、脚本、设置、国际化等均有独立模块。
