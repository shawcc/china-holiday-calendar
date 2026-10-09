# 中国节假日工作日历

依据国务院办公厅正式通知整理全国性节假日与补班日期，生成与“工作日历规则导入模板”兼容的 Excel 文件，并通过 GitHub Pages 公开下载。

## 数据原则

- 唯一事实源：国务院办公厅正式通知，以中国政府网或中央政府部门官网发布页为准。
- 完整收录：包括节假日与周末自然衔接的休息日，以及全部补班日。
- 发布门槛：新年度数据必须人工逐项复核，监测任务不会自动发布未核验数据。
- 可追溯：页面展示文件文号、发布日期、官方原文与 SHA-256。

## 本地验证

```bash
python3 -m pip install -r requirements.txt
python3 scripts/generate.py
python3 -m unittest discover -s tests
python3 -m http.server 4173 --directory public
```

打开 `http://localhost:4173`。

## 更新年度

1. 在 `data/` 新增经人工核验的年度 JSON。
2. 运行 `python3 scripts/generate.py`。
3. 运行测试并检查页面。
4. 推送到 `main`，GitHub Pages 自动部署。

每日监测任务在发现候选官方通知后创建 `release-check` issue，发布人须完成 issue 中的核验清单。
