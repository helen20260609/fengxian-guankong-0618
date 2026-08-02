from pathlib import Path

p = Path(r'e:\风险管控0618\js\house-arch-data.js')
text = p.read_text(encoding='utf-8')
print('house-arch-data.js total_lines', len(text.splitlines()))
for kw in ['function generateInspectionRecords','function generateAppraisalReports','function generatePatrolRecords','function generateManageRecords','function generateProjectRecordsLocal','function generateQualityTrace','function generateArchiveRecords','function generateRiskIdentification','function generateEmergencyResponse','function generateHousePhotos','function generateHazards','function generateMeasures','function initHouseArchSeed','function syncCloseApplyData','const DEFAULT_HOUSE_STATUS']:
    idx = text.find(kw)
    if idx>=0:
        line = text[:idx].count('\n')+1
        print(kw, 'line', line)

p2 = Path(r'e:\风险管控0618\pages\situation-rural-house.html')
text2 = p2.read_text(encoding='utf-8')
print('\nsituation-rural-house.html total_lines', len(text2.splitlines()))
for kw in ['function showPopup','function openDrawer','function closeDrawer','function renderPatrolTable','function renderRiskTable','function renderMeasureTable','function renderRectProgressTable','function renderAppraisalTable','const RISK_CONFIG','const MAP_BOUNDS','const MAP_VIEW','const STREET_MOCK_POSITIONS','const STREET_BOUNDARIES','function switchDetailTab','function toggleDetailTable','.detail-tab','.tab-pane','house-popup','rightDrawer','function showMeasureDetail','function showPatrolDetail','function showAppraisalDetail','function showRectProgressDetail']:
    idx = text2.find(kw)
    if idx>=0:
        line = text2[:idx].count('\n')+1
        print(kw, 'line', line)

print('\n=== timeline/时间轴 in situation-rural-house.html ===')
for i, line in enumerate(text2.splitlines(), 1):
    if 'timeline' in line.lower() or '时间轴' in line:
        print(i, line.strip()[:200])
print('\n=== inspection in situation-rural-house.html ===')
for i, line in enumerate(text2.splitlines(), 1):
    if 'inspection' in line.lower():
        print(i, line.strip()[:200])
print('\n=== history in situation-rural-house.html ===')
for i, line in enumerate(text2.splitlines(), 1):
    if 'history' in line.lower():
        print(i, line.strip()[:200])
