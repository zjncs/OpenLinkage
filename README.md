# OpenLinkage

> 🔗 构建健康连接的智能底座  
> An open-source framework for multi-agent health management and privacy-preserving data intelligence.

---

## 🚀 简介 / Overview

**OpenLinkage** 是由 [Linkage App](https://your-site-link.com) 团队开源的健康智能体框架。
它为开发者提供了一套可扩展的底层架构，用于构建 AI 健康助手、医生辅助分析与个性化健康管理系统。  

主要特性：
- 🧠 **多智能体协作系统**（Multi-Agent Framework）
- 💾 **AI 记忆引擎**（短期 / 长期）
- 🔒 **隐私保护与本地数据计算**
- 📊 **健康数据融合与趋势建模**
- 🔌 **开放 API 接口**，轻松对接医院、健康设备、运动 App

---

## 🧩 框架结构 / Architecture

```
User
└── Linkage Core
    ├── Health Butler Agent
    ├── Nutrition Agent
    ├── Exercise Agent
    ├── Medication Agent
    ├── Security Agent
    └── Memory Engine + Privacy Guard

````

---

## ⚙️ 技术栈 / Tech Stack

- Backend: **Python / FastAPI / LangGraph**
- AI Integration: **OpenAI GPT / Qwen / Claude**
- Vector DB: **pgvector / Qdrant**
- Privacy: **Decentralized encryption inspired by Second-Me**
- Optional Frontend: **Flutter / React Native**

---

## 📦 快速开始 / Quick Start

本仓库内包含一个可直接运行的 FastAPI 多智能体演示服务，附带基础校验、概览汇总与单元测试用例，便于快速扩展。

```bash
git clone https://github.com/your-org/OpenLinkage.git
cd OpenLinkage
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run.py

# 运行单元测试（可选，如缺少依赖将自动跳过）
python -m unittest discover -s tests -v
````

启动后，打开 [http://localhost:8000/docs](http://localhost:8000/docs) 查看 API 文档。

### 示例请求 / Sample Request

调用 `/analyze` 接口，模拟健康管家、营养、运动与用药安全智能体协作：

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
        "user_id": "demo-user",
        "symptoms": ["fatigue"],
        "goals": ["weight management"],
        "lifestyle_notes": "prefers evening workouts"
      }'
```

响应会返回每个智能体的建议，便于前端或下游系统进一步处理。

返回结构示例（节选）：

```json
{
  "user_id": "demo-user",
  "overall_summary": "HealthButlerAgent: Follow a consistent sleep schedule to support hormone balance. | NutritionAgent: Prioritize vegetables and lean protein in daily meals.",
  "warnings": [
    "Chest pain requires immediate evaluation. If severe, call emergency services."
  ],
  "responses": [
    {"agent": "HealthButlerAgent", "summary": "...", "recommendations": ["..."]},
    {"agent": "NutritionAgent", "summary": "...", "recommendations": ["..."]},
    {"agent": "ExerciseAgent", "summary": "...", "recommendations": ["..."]},
    {"agent": "MedicationAgent", "summary": "...", "recommendations": ["..."]}
  ]
}
```

---

## 🤝 开源与社区 / Open Source & Community

本项目遵循 **Apache 2.0** 开源协议。
欢迎贡献代码、提出改进意见或提交 Issue！

---

© 2025 Linkage Team. All rights reserved.
