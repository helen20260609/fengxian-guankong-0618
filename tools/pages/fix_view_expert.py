from pathlib import Path

p = Path('tp-expert.html')
text = p.read_text(encoding='utf-8')

start = text.find('function viewExpert(name) {')
end = text.find('function editExpert(name) {')
new = """function viewExpert(name) {
    var item = expertList.find(function(e) { return e.name === name; });
    if (!item) return;
    var rows = [
        ['姓名', item.name],
        ['性别', item.gender],
        ['出生年月', item.birth],
        ['工作单位', item.org],
        ['专业领域', item.domain],
        ['专业方向', item.direction],
        ['职称', item.title],
        ['发证机构', item.titleOrg],
        ['取得时间', item.titleTime],
        ['工作年限', item.years + ' 年'],
        ['联系电话', item.phone],
        ['电子邮箱', item.email],
        ['通讯地址', item.address],
        ['状态', item.status]
    ];
    var tableRows = rows.map(function(r) {
        return '\u003ctr\u003e\u003ctd style="width:100px;color:#666;padding:6px 0;vertical-align:top;"\u003e' + r[0] + '\u003c/td\u003e\u003ctd style="padding:6px 0;"\u003e' + r[1] + '\u003c/td\u003e\u003c/tr\u003e';
    }).join('');
    var html = '\u003cdiv style="font-size:14px;line-height:1.8;"\u003e' +
        '\u003ch3 style="margin:0 0 12px 0;padding-bottom:8px;border-bottom:1px solid #eee;"\u003e' + item.name + ' - 专家详情\u003c/h3\u003e' +
        '\u003ctable style="width:100%;border-collapse:collapse;"\u003e' + tableRows + '\u003c/table\u003e' +
        '\u003c/div\u003e';
    var w = window.open('', 'expertView', 'width=620,height=660,scrollbars=yes,resizable=yes');
    if (!w) return;
    var doc = w.document;
    doc.open();
    doc.write('\u003c!DOCTYPE html\u003e\u003chtml lang="zh-CN"\u003e\u003chead\u003e\u003cmeta charset="UTF-8"\u003e\u003ctitle\u003e专家详情\u003c/title\u003e\u003c/head\u003e\u003cbody style="padding:24px;font-family:Microsoft YaHei,PingFang SC,sans-serif;background:#fff;color:#202124;"\u003e' + html + '\u003c/body\u003e\u003c/html\u003e');
    doc.close();
}

"""
if start == -1 or end == -1:
    print('markers not found', start, end)
else:
    text2 = text[:start] + new + text[end:]
    p.write_text(text2, encoding='utf-8')
    print('replaced')
