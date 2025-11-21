// B:\404 CITY Remastered\resources\[lvx]\lvx_skin\html\app.js

const wrapper      = document.querySelector('.skin-wrapper');
const titleEl      = document.getElementById('skin-title');
const categoryCol  = document.getElementById('category-column');
const slidersBox   = document.getElementById('sliders-container');
const footerPrice  = document.getElementById('footer-price');

const panelRight   = document.getElementById('panel-right');
const savePriceLbl = document.getElementById('save-price-label');
const saveInput    = document.getElementById('input-outfit-name');
const btnSave      = document.getElementById('btn-save-outfit');
const wardrobeList = document.getElementById('wardrobe-list');

const btnReset     = document.getElementById('btn-reset');
const btnConfirm   = document.getElementById('btn-confirm');

// ===== NUI helper =====
const isNui = typeof GetParentResourceName === 'function';

function sendNuiCallback(name, data) {
    if (!isNui) {
        console.log('[DEV] NUI', name, data);
        return;
    }

    fetch(`https://${GetParentResourceName()}/${name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify(data || {})
    }).catch(() => {});
}

// ===== CATEGORY + SLIDER CONFIG =====

const CATEGORIES = [
    {
        key: 'skin',
        label: 'สกิน',
        iconClass: 'category-icon-skin',
        sliders: [
            { id: 'face',        field: 'face',         label: 'รูปหน้า',     min: 0, max: 45 },
            { id: 'skin',        field: 'skin',         label: 'โทนผิว',       min: 0, max: 45 },
            { id: 'age_1',       field: 'age_1',        label: 'ริ้วรอย',      min: 0, max: 15 },
            { id: 'age_2',       field: 'age_2',        label: 'ความเข้มริ้วรอย', min: 0, max: 10 },
            { id: 'blemishes_1', field: 'blemishes_1',  label: 'สิว / รอยสิว', min: 0, max: 15 },
            { id: 'blemishes_2', field: 'blemishes_2',  label: 'ความเข้มสิว', min: 0, max: 10 },
            { id: 'sun_1',       field: 'sun_1',        label: 'รอยแดด',      min: 0, max: 15 },
            { id: 'sun_2',       field: 'sun_2',        label: 'ความเข้มรอยแดด', min: 0, max: 10 },
            { id: 'eye_color',   field: 'eye_color',    label: 'สีตา',        min: 0, max: 31 }
        ]
    },
    {
        key: 'head',
        label: 'ส่วนหัว',
        iconClass: 'category-icon-head',
        sliders: [
            { id: 'hair_1',        field: 'hair_1',       label: 'ทรงผม',        min: 0, max: 80 },
            { id: 'hair_2',        field: 'hair_2',       label: 'ลายผม',        min: 0, max: 10 },
            { id: 'hair_color_1',  field: 'hair_color_1', label: 'สีผมหลัก',     min: 0, max: 63 },
            { id: 'hair_color_2',  field: 'hair_color_2', label: 'สีไฮไลท์',     min: 0, max: 63 },
            { id: 'beard_1',       field: 'beard_1',      label: 'ทรงหนวด',      min: 0, max: 28 },
            { id: 'beard_2',       field: 'beard_2',      label: 'ความเข้มหนวด', min: 0, max: 10 },
            { id: 'beard_3',       field: 'beard_3',      label: 'สีหนวด',       min: 0, max: 63 }
        ]
    },
    {
        key: 'body',
        label: 'ส่วนตัว',
        iconClass: 'category-icon-body',
        sliders: [
            { id: 'tshirt_1',  field: 'tshirt_1',  label: 'เสื้อใน',     min: 0, max: 200 },
            { id: 'tshirt_2',  field: 'tshirt_2',  label: 'ลายเสื้อใน', min: 0, max: 10 },
            { id: 'torso_1',   field: 'torso_1',   label: 'เสื้อนอก',   min: 0, max: 250 },
            { id: 'torso_2',   field: 'torso_2',   label: 'ลายเสื้อนอก',min: 0, max: 10 },
            { id: 'arms',      field: 'arms',      label: 'แขน/มือ',     min: 0, max: 20 },
            { id: 'decals_1',  field: 'decals_1',  label: 'รอยสัก',      min: 0, max: 30 },
            { id: 'decals_2',  field: 'decals_2',  label: 'ลายรอยสัก',  min: 0, max: 10 }
        ]
    },
    {
        key: 'legs',
        label: 'ส่วนขา',
        iconClass: 'category-icon-legs',
        sliders: [
            { id: 'pants_1', field: 'pants_1', label: 'กางเกง',    min: 0, max: 150 },
            { id: 'pants_2', field: 'pants_2', label: 'ลายกางเกง', min: 0, max: 10 }
        ]
    },
    {
        key: 'feet',
        label: 'ส่วนเท้า',
        iconClass: 'category-icon-feet',
        sliders: [
            { id: 'shoes_1', field: 'shoes_1', label: 'รองเท้า',    min: 0, max: 100 },
            { id: 'shoes_2', field: 'shoes_2', label: 'ลายรองเท้า', min: 0, max: 10 }
        ]
    },
    {
        key: 'misc',
        label: 'อื่น ๆ',
        iconClass: 'category-icon-misc',
        sliders: [
            { id: 'mask_1',  field: 'mask_1',  label: 'หน้ากาก',     min: 0, max: 130 },
            { id: 'mask_2',  field: 'mask_2',  label: 'ลายหน้ากาก', min: 0, max: 10 },
            { id: 'bags_1',  field: 'bags_1',  label: 'กระเป๋า',     min: 0, max: 90 },
            { id: 'bags_2',  field: 'bags_2',  label: 'ลายกระเป๋า', min: 0, max: 10 }
        ]
    }
];

let currentMode   = 'skin';   // 'skin' | 'clothes'
let freeMode      = true;
let confirmPrice  = 0;
let savePrice     = 0;
let activeCatKey  = 'skin';

// ===== RENDER HELPERS =====

function clearNode(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
}

function renderCategories() {
    clearNode(categoryCol);

    getVisibleCategories().forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        if (cat.key === activeCatKey) btn.classList.add('active');

        btn.dataset.key = cat.key;

        const icon = document.createElement('span');
        icon.className = `category-icon ${cat.iconClass}`;
        btn.appendChild(icon);

        const sr = document.createElement('span');
        sr.className = 'sr-only';
        sr.textContent = cat.label;
        btn.appendChild(sr);

        btn.addEventListener('click', () => {
            activeCatKey = cat.key;
            renderCategories();
            renderSliders();

            // บอกฝั่ง client ให้เปลี่ยนกล้องตามหมวด
            sendNuiCallback('changeCategory', { key: cat.key });
        });

        categoryCol.appendChild(btn);
    });
}


// คืน list หมวดที่จะแสดง ตาม currentMode
function getVisibleCategories() {
    return CATEGORIES.filter(cat => {
        // ถ้าอยู่โหมดร้านเสื้อผ้า -> ไม่ให้แก้หมวดสกิน
        if (currentMode === 'clothes' && cat.key === 'skin') {
            return false;
        }
        return true;
    });
}

function renderSliders() {
    clearNode(slidersBox);

    const cat = getVisibleCategories().find(c => c.key === activeCatKey);
    if (!cat) return;

    cat.sliders.forEach(sl => {
        const row = document.createElement('div');
        row.className = 'slider-row';
        row.dataset.sliderId = sl.id;
        row.dataset.field    = sl.field;

        const label = document.createElement('div');
        label.className = 'slider-label';
        label.textContent = sl.label || sl.id;
        row.appendChild(label);

        const controls = document.createElement('div');
        controls.className = 'slider-controls';

        const input = document.createElement('input');
        input.className = 'slider-input';
        input.type  = 'range';
        input.min   = sl.min ?? 0;
        input.max   = sl.max ?? 10;
        input.step  = sl.step ?? 1;
        input.value = sl.default ?? sl.min ?? 0;

        const stepGroup = document.createElement('div');
        stepGroup.className = 'slider-step-group';

        const btnDec = document.createElement('button');
        btnDec.className = 'slider-step-btn';
        btnDec.textContent = '<';

        const valueSpan = document.createElement('span');
        valueSpan.className = 'slider-value';
        valueSpan.textContent = input.value;

        const btnInc = document.createElement('button');
        btnInc.className = 'slider-step-btn';
        btnInc.textContent = '>';

        stepGroup.appendChild(btnDec);
        stepGroup.appendChild(valueSpan);
        stepGroup.appendChild(btnInc);

        controls.appendChild(input);
        controls.appendChild(stepGroup);

        function applyValue(newVal) {
            const v = Number(newVal);
            input.value = v;
            valueSpan.textContent = v;

            sendNuiCallback('updateSlider', {
                sliderId: sl.id,
                field: sl.field,
                value: v
            });
        }

        input.addEventListener('input', (e) => {
            applyValue(e.target.value);
        });

        btnDec.addEventListener('click', () => {
            const v = Math.max(Number(input.min), Number(input.value) - Number(input.step));
            applyValue(v);
        });
        btnInc.addEventListener('click', () => {
            const v = Math.min(Number(input.max), Number(input.value) + Number(input.step));
            applyValue(v);
        });

        row.appendChild(controls);
        slidersBox.appendChild(row);
    });
}

// ===== WARDROBE RENDER =====

function renderWardrobe(list) {
    clearNode(wardrobeList);

    if (!Array.isArray(list) || list.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'wardrobe-item';
        empty.textContent = 'ยังไม่มีชุดที่เซฟไว้';
        wardrobeList.appendChild(empty);
        return;
    }

    list.forEach(item => {
        const row = document.createElement('div');
        row.className = 'wardrobe-item';

        const nameEl = document.createElement('div');
        nameEl.className = 'wardrobe-item-name';
        nameEl.textContent = item.label || item.name || `ชุด #${item.id || '?'}`;

        const btnUse = document.createElement('button');
        btnUse.className = 'btn-wardrobe-use';
        btnUse.textContent = 'เรียกใช้';

        btnUse.addEventListener('click', () => {
            sendNuiCallback('useOutfit', { id: item.id });
        });

        row.appendChild(nameEl);
        row.appendChild(btnUse);
        wardrobeList.appendChild(row);
    });
}

// ===== OPEN/CLOSE MENU (จาก client.lua) =====

function openMenu(payload) {
    wrapper.classList.remove('hidden');

    currentMode  = payload.mode === 'clothes' ? 'clothes' : 'skin';
    freeMode     = !!payload.freeMode;
    confirmPrice = Number(payload.confirmPrice || 0);
    savePrice    = Number(payload.savePrice || 0);

    if (titleEl) {
        titleEl.textContent = currentMode === 'clothes' ? 'CLOTHES SHOP' : 'SKIN MENU';
    }

    if (footerPrice) {
        footerPrice.textContent = freeMode ? '0$' : `${confirmPrice}$`;
    }

    if (panelRight) {
        if (currentMode === 'clothes' && !freeMode) {
            panelRight.classList.remove('hidden');
        } else {
            panelRight.classList.add('hidden');
        }
    }

    if (savePriceLbl) {
        savePriceLbl.textContent = `${savePrice}$`;
    }

    renderCategories();
    renderSliders();
    renderWardrobe(payload.wardrobe || []);

    if (saveInput) saveInput.value = '';
        // แจ้ง client ให้เซ็ตกล้องตามหมวดแรก
    sendNuiCallback('changeCategory', { key: activeCatKey });
}

function closeMenu() {
    wrapper.classList.add('hidden');
}

// ===== BUTTON EVENTS =====

if (btnReset) {
    btnReset.addEventListener('click', () => {
        sendNuiCallback('reset', {});
    });
}

if (btnConfirm) {
    btnConfirm.addEventListener('click', () => {
        sendNuiCallback('confirm', {});
    });
}

if (btnSave) {
    btnSave.addEventListener('click', () => {
        const name = (saveInput?.value || '').trim();
        sendNuiCallback('saveOutfit', { name });
    });
}

// ===== MESSAGE LISTENER (จาก client.lua) =====

window.addEventListener('message', (e) => {
    const { action, payload } = e.data || {};

    if (action === 'open') {
        openMenu(payload || {});
    } else if (action === 'close') {
        closeMenu();
    } else if (action === 'updateWardrobe') {
        renderWardrobe(payload || []);
    }
});

// DEV mode preview ใน Browser
if (!isNui) {
    console.log('%c[lvx_skin] DEV preview mode', 'color:#0ff');
    openMenu({
        mode: 'skin',
        freeMode: true,
        confirmPrice: 0,
        savePrice: 1000,
        wardrobe: [
            { id: 1, label: 'ชุดทำงาน' },
            { id: 2, label: 'ไปเที่ยวทะเล' }
        ]
    });
}
