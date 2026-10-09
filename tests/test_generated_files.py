import csv
import json
import unittest
from pathlib import Path

from openpyxl import load_workbook


ROOT = Path(__file__).resolve().parents[1]


class GeneratedFileTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.manifest = json.loads((ROOT / "public" / "manifest.json").read_text(encoding="utf-8"))

    def test_manifest_counts_match_source(self):
        self.assertEqual([year["year"] for year in self.manifest["years"]], [2025, 2026])
        for year in self.manifest["years"]:
            holidays = year["holidays"]
            rest = sum(len(item["rest_dates"]) for item in holidays)
            work = sum(len(item["work_dates"]) for item in holidays)
            self.assertEqual(year["rest_count"], rest)
            self.assertEqual(year["work_count"], work)
            self.assertEqual(year["row_count"], rest + work)

    def test_xlsx_matches_import_contract(self):
        expected = {
            2025: (33, ("2025-01-01", "休息日"), ("2025-10-11", "工作日")),
            2026: (39, ("2026-01-01", "休息日"), ("2026-10-10", "工作日"))
        }
        for year in self.manifest["years"]:
            workbook = load_workbook(ROOT / "public" / year["xlsx"])
            sheet = workbook["工作日历规则导入模板"]
            rows = [
                (sheet.cell(row, 1).value, sheet.cell(row, 2).value)
                for row in range(3, 3 + year["row_count"])
            ]
            count, first, last = expected[year["year"]]
            self.assertEqual(len(rows), count)
            self.assertEqual(rows[0], first)
            self.assertEqual(rows[-1], last)
            self.assertTrue(all(day_type in {"工作日", "休息日"} for _, day_type in rows))
            self.assertEqual(len(sheet.data_validations.dataValidation), 1)

    def test_csv_matches_xlsx_rows(self):
        for year in self.manifest["years"]:
            with (ROOT / "public" / year["csv"]).open(encoding="utf-8-sig") as file:
                csv_rows = list(csv.reader(file))[1:]
            workbook = load_workbook(ROOT / "public" / year["xlsx"], read_only=True)
            sheet = workbook["工作日历规则导入模板"]
            xlsx_rows = [
                [sheet.cell(row, 1).value, sheet.cell(row, 2).value]
                for row in range(3, 3 + year["row_count"])
            ]
            self.assertEqual(csv_rows, xlsx_rows)


if __name__ == "__main__":
    unittest.main()
