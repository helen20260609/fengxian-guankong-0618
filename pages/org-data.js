/**
 * ===== 组织架构数据 =====
 * 基于组织架构.md 的真实数据
 * 可被多个页面共享引用
 */

const orgData = [
    {
        id: 'dept1', name: '区建设管理委（区交通委）', parentId: null, children: [
            { id: 'dept2', name: '党政班子', parentId: 'dept1', children: [] },
            { id: 'dept3', name: '纪检监察室', parentId: 'dept1', children: [] },
            { id: 'dept4', name: '工会', parentId: 'dept1', children: [] },
            { id: 'dept5', name: '党政办公室', parentId: 'dept1', children: [] },
            { id: 'dept6', name: '组织人事科', parentId: 'dept1', children: [] },
            { id: 'dept7', name: '宣传教育科', parentId: 'dept1', children: [] },
            { id: 'dept8', name: '计划财务科', parentId: 'dept1', children: [] },
            { id: 'dept9', name: '规划建设科', parentId: 'dept1', children: [] },
            { id: 'dept10', name: '行政许可科（政策法规科）', parentId: 'dept1', children: [] },
            { id: 'dept11', name: '城乡建设管理科', parentId: 'dept1', children: [] },
            { id: 'dept12', name: '交通运输管理科（交战办）', parentId: 'dept1', children: [] },
            { id: 'dept13', name: '交通设施管理科', parentId: 'dept1', children: [] },
            { id: 'dept14', name: '城市综合管理科（安全监督科）', parentId: 'dept1', children: [] },
            { id: 'dept15', name: '城市更新科', parentId: 'dept1', children: [] },
            { id: 'dept16', name: '信访办公室', parentId: 'dept1', children: [] },
            { id: 'dept17', name: '重大办', parentId: 'dept1', children: [] }
        ]
    },
    {
        id: 'dept18', name: '交通委员会执法大队', parentId: null, children: [
            { id: 'dept19', name: '班子领导', parentId: 'dept18', children: [] },
            { id: 'dept20', name: '办公室', parentId: 'dept18', children: [] },
            { id: 'dept21', name: '法制科', parentId: 'dept18', children: [] },
            { id: 'dept22', name: '勤务协调科', parentId: 'dept18', children: [] },
            { id: 'dept23', name: '一中队', parentId: 'dept18', children: [] },
            { id: 'dept24', name: '二中队', parentId: 'dept18', children: [] },
            { id: 'dept25', name: '三中队', parentId: 'dept18', children: [] },
            { id: 'dept26', name: '四中队', parentId: 'dept18', children: [] },
            { id: 'dept27', name: '五中队', parentId: 'dept18', children: [] },
            { id: 'dept28', name: '六中队', parentId: 'dept18', children: [] },
            { id: 'dept29', name: '机动中队', parentId: 'dept18', children: [] }
        ]
    },
    {
        id: 'dept30', name: '交通建设管理中心', parentId: null, children: [
            { id: 'dept31', name: '党政班子', parentId: 'dept30', children: [] },
            { id: 'dept32', name: '办公室', parentId: 'dept30', children: [] },
            { id: 'dept33', name: '财务科', parentId: 'dept30', children: [] },
            { id: 'dept34', name: '计划规划科', parentId: 'dept30', children: [] },
            { id: 'dept35', name: '设施管理科', parentId: 'dept30', children: [] },
            { id: 'dept36', name: '道路照明管理科', parentId: 'dept30', children: [] },
            { id: 'dept37', name: '工程管理科', parentId: 'dept30', children: [] },
            { id: 'dept38', name: '乡村公路管理科', parentId: 'dept30', children: [] },
            { id: 'dept39', name: '网格化中心', parentId: 'dept30', children: [] },
            { id: 'dept40', name: '劳动人事科', parentId: 'dept30', children: [] },
            { id: 'dept41', name: '路政管理科', parentId: 'dept30', children: [] },
            { id: 'dept42', name: '路政检查执法队', parentId: 'dept30', children: [] },
            { id: 'dept43', name: '信息管理科', parentId: 'dept30', children: [] },
            { id: 'dept44', name: '工青妇', parentId: 'dept30', children: [] },
            { id: 'dept45', name: '战备办', parentId: 'dept30', children: [] }
        ]
    },
    {
        id: 'dept46', name: '交通运输管理中心', parentId: null, children: [
            { id: 'dept47', name: '党政班子', parentId: 'dept46', children: [] },
            { id: 'dept48', name: '办公室', parentId: 'dept46', children: [] },
            { id: 'dept49', name: '货运管理科', parentId: 'dept46', children: [] },
            { id: 'dept50', name: '客运管理科', parentId: 'dept46', children: [] },
            { id: 'dept51', name: '汽车服务管理科', parentId: 'dept46', children: [] },
            { id: 'dept52', name: '海事管理科', parentId: 'dept46', children: [] },
            { id: 'dept53', name: '港航管理科', parentId: 'dept46', children: [] },
            { id: 'dept54', name: '停车管理科', parentId: 'dept46', children: [] },
            { id: 'dept55', name: '综合管理科', parentId: 'dept46', children: [] }
        ]
    },
    {
        id: 'dept56', name: '燃气管理所', parentId: null, children: [
            { id: 'dept57', name: '党政班子', parentId: 'dept56', children: [] },
            { id: 'dept58', name: '综合办公室', parentId: 'dept56', children: [] },
            { id: 'dept59', name: '稽查科', parentId: 'dept56', children: [] },
            { id: 'dept60', name: '市场科', parentId: 'dept56', children: [] }
        ]
    },
    {
        id: 'dept61', name: '建设工程安全质量监督站', parentId: null, children: [
            { id: 'dept62', name: '党政班子', parentId: 'dept61', children: [] },
            { id: 'dept63', name: '综合办公室', parentId: 'dept61', children: [] },
            { id: 'dept64', name: '督查一科', parentId: 'dept61', children: [] },
            { id: 'dept65', name: '督查二科', parentId: 'dept61', children: [] },
            { id: 'dept66', name: '督查三科', parentId: 'dept61', children: [] },
            { id: 'dept67', name: '督查四科', parentId: 'dept61', children: [] },
            { id: 'dept68', name: '管理科', parentId: 'dept61', children: [] },
            { id: 'dept69', name: '执法科', parentId: 'dept61', children: [] },
            { id: 'dept70', name: '市场科', parentId: 'dept61', children: [] },
            { id: 'dept71', name: '巡查科', parentId: 'dept61', children: [] },
            { id: 'dept72', name: '市政监督科', parentId: 'dept61', children: [] },
            { id: 'dept73', name: '财务科', parentId: 'dept61', children: [] },
            { id: 'dept74', name: '建材管理科', parentId: 'dept61', children: [] }
        ]
    }
];

// 人员数据（基于组织架构）
const orgPersons = [
    { id: 'p1', name: '张建国', role: '主任', dept: '燃气管理所', deptId: 'dept56', phone: '138****1234' },
    { id: 'p2', name: '李明华', role: '科长', dept: '燃气管理所', deptId: 'dept56', phone: '139****5678' },
    { id: 'p3', name: '王志强', role: '科长', dept: '城市综合管理科（安全监督科）', deptId: 'dept14', phone: '137****9012' },
    { id: 'p4', name: '陈秀英', role: '科员', dept: '城乡建设管理科', deptId: 'dept11', phone: '136****3456' },
    { id: 'p5', name: '刘大伟', role: '科员', dept: '交通设施管理科', deptId: 'dept13', phone: '135****7890' },
    { id: 'p6', name: '赵小红', role: '科长', dept: '稽查科', deptId: 'dept59', phone: '134****2345' },
    { id: 'p7', name: '孙大力', role: '科员', dept: '交通委员会执法大队', deptId: 'dept18', phone: '133****6789' },
    { id: 'p8', name: '周敏', role: '科员', dept: '交通建设管理中心', deptId: 'dept30', phone: '132****0123' },
    { id: 'p9', name: '吴建国', role: '科员', dept: '交通运输管理中心', deptId: 'dept46', phone: '131****4567' },
    { id: 'p10', name: '郑丽华', role: '站长', dept: '建设工程安全质量监督站', deptId: 'dept61', phone: '130****8901' }
];

// 导出（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { orgData, orgPersons };
}
