// 农房回头看 - 整改字段统一迁移脚本
// 目标：把历史数据中混杂的整改字段（rectification/ownerRectifyMeasures/rectifyDeadline）统一为 rectify.*
// 用法：node tools/migrate-rectify-fields.js [--dry-run]

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const RECORDS_FILE = path.join(DATA_DIR, 'farm-review-records.json');
const BACKUP_FILE = path.join(DATA_DIR, 'farm-review-records.backup-' + Date.now() + '.json');

const DRY_RUN = process.argv.includes('--dry-run');

// 从旧字段提取整改数据，归并为统一结构
function normalizeRectify(rec) {
    // 已有标准 rectify 对象，且非空 → 直接保留
    if (rec.rectify && typeof rec.rectify === 'object' && Object.keys(rec.rectify).length) {
        return rec.rectify;
    }

    var r = {
        needRectify: false,
        appraisal: { done: '', conclusion: '', date: '', orgName: '', orgCode: '' },
        measures: {
            controlDone: '', controlTypes: [], controlTypeOther: '', controlPhotos: [],
            engineeringDone: '', engineeringTypes: [], engineeringTypeOther: '', engineeringPhotos: [],
            ownerSign: '', ownerPhone: '', ownerDate: '',
            userSign: '', userPhone: '', userDate: '',
            townSign: '', townOrg: '', townPhone: '', townDate: '',
            districtSign: '', districtOrg: '', districtPhone: '', districtDate: ''
        },
        updateTime: ''
    };

    // 1) 老字段 rectification（对象）
    if (rec.rectification && typeof rec.rectification === 'object') {
        var old = rec.rectification;
        r.needRectify = true;
        if (old.measures) r.measures.controlTypes = Array.isArray(old.measures) ? old.measures : [old.measures];
        if (old.deadline) r.measures.ownerDate = old.deadline;
        if (old.ownerSign) r.measures.ownerSign = old.ownerSign;
        if (old.ownerPhone) r.measures.ownerPhone = old.ownerPhone;
        if (old.remark) r.measures.controlTypeOther = old.remark;
        r.updateTime = old.updateTime || rec.submitTime || '';
    }

    // 2) 中文字段 ownerRectifyMeasures（answers 里也可能是数组）
    var ownerMeasures = rec.ownerRectifyMeasures || (rec.answers && rec.answers.ownerRectifyMeasures);
    if (ownerMeasures) {
        r.needRectify = true;
        if (Array.isArray(ownerMeasures)) {
            r.measures.controlTypes = ownerMeasures.filter(function(m) { return m !== '其他'; });
            if (ownerMeasures.indexOf('其他') >= 0) r.measures.controlTypeOther = '见详情';
        } else if (typeof ownerMeasures === 'string') {
            r.measures.controlTypes = [ownerMeasures];
        }
        if (!r.updateTime) r.updateTime = rec.submitTime || '';
    }

    // 3) rectifyDeadline（日期字符串）
    var deadline = rec.rectifyDeadline || (rec.answers && rec.answers.rectifyDeadline);
    if (deadline) {
        r.needRectify = true;
        r.measures.ownerDate = deadline;
        if (!r.updateTime) r.updateTime = rec.submitTime || '';
    }

    // 4) 顶层有 hazardLevel 且为严重/一般，但没任何整改字段 → 标记 needRectify=true（补数据）
    if (!r.needRectify && (rec.hazardLevel === '严重' || rec.hazardLevel === '一般')) {
        r.needRectify = true;
    }

    return r;
}

// 删除旧字段，保留标准 rectify
function cleanupOldFields(rec) {
    delete rec.rectification;
    delete rec.ownerRectifyMeasures;
    delete rec.rectifyDeadline;
    if (rec.answers) {
        delete rec.answers.ownerRectifyMeasures;
        delete rec.answers.rectifyDeadline;
    }
}

function main() {
    console.log('读取：' + RECORDS_FILE);
    var raw = fs.readFileSync(RECORDS_FILE, 'utf8');
    var list = JSON.parse(raw);
    if (!Array.isArray(list)) {
        console.error('数据格式错误：顶层不是数组');
        process.exit(1);
    }

    var changed = 0, hasOldFields = 0, hasRectify = 0;
    list.forEach(function(rec) {
        if (!rec || !rec.houseNo) return;

        var hadOld = !!(rec.rectification || rec.ownerRectifyMeasures || rec.rectifyDeadline ||
                        (rec.answers && (rec.answers.ownerRectifyMeasures || rec.answers.rectifyDeadline)));
        var hadRectify = !!(rec.rectify && Object.keys(rec.rectify).length);

        if (hadOld) hasOldFields++;
        if (hadRectify) hasRectify++;

        // 只处理有旧字段 或 没有 rectify 但隐患等级为严重/一般的记录
        if (!hadOld && hadRectify) return; // 已是标准格式
        if (!hadOld && !hadRectify && rec.hazardLevel !== '严重' && rec.hazardLevel !== '一般') return; // 无需整改

        rec.rectify = normalizeRectify(rec);
        cleanupOldFields(rec);
        changed++;
    });

    console.log('总记录：' + list.length);
    console.log('含旧字段：' + hasOldFields);
    console.log('已有标准 rectify：' + hasRectify);
    console.log('本次迁移：' + changed);

    if (DRY_RUN) {
        console.log('\n[DRY RUN] 不写盘。正式执行请去掉 --dry-run');
        return;
    }

    // 备份
    fs.writeFileSync(BACKUP_FILE, raw, 'utf8');
    console.log('已备份到：' + BACKUP_FILE);

    // 写回
    fs.writeFileSync(RECORDS_FILE, JSON.stringify(list, null, 2), 'utf8');
    console.log('已写回：' + RECORDS_FILE);
}

main();
