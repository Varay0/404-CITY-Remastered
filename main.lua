local ESX
local isMenuOpen = false

-- skin cache
local CurrentSkin = {}
local SavedSkin   = {}

-- กล้อง preview
local skinCam = nil
local currentCategory = 'skin'

------------------------------------------------------------
-- ESX init
------------------------------------------------------------
CreateThread(function()
    while not ESX do
        pcall(function()
            ESX = exports["es_extended"]:getSharedObject()
        end)

        if not ESX then
            TriggerEvent("esx:getSharedObject", function(obj)
                ESX = obj
            end)
        end

        Wait(500)
    end
end)

------------------------------------------------------------
-- tools
------------------------------------------------------------
local function deepCopy(tbl)
    if type(tbl) ~= 'table' then return tbl end
    local t = {}
    for k, v in pairs(tbl) do
        t[k] = deepCopy(v)
    end
    return t
end

local function RefreshSkinCache()
    TriggerEvent('skinchanger:getSkin', function(skin)
        if not skin then return end
        CurrentSkin = deepCopy(skin)
        SavedSkin   = deepCopy(skin)
        print('[lvx_skin] skin cache refreshed')
    end)
end

AddEventHandler('esx:playerLoaded', function()
    RefreshSkinCache()
end)

AddEventHandler('onResourceStart', function(res)
    if res == GetCurrentResourceName() then
        Wait(2000)
        RefreshSkinCache()
    end
end)

------------------------------------------------------------
-- กล้อง preview
------------------------------------------------------------
local function DestroySkinCam()
    if skinCam and DoesCamExist(skinCam) then
        RenderScriptCams(false, true, 500, true, true)
        DestroyCam(skinCam, false)
    end
    skinCam = nil
    currentCategory = 'skin'
end

local function EnsureSkinCam()
    if skinCam and DoesCamExist(skinCam) then return end

    local ped    = PlayerPedId()
    local coords = GetEntityCoords(ped)

    skinCam = CreateCam("DEFAULT_SCRIPTED_CAMERA", true)
    SetCamActive(skinCam, true)
    RenderScriptCams(true, true, 500, true, true)
    SetFollowPedCamViewMode(1) -- third person
end

local function UpdateSkinCamForCategory(catKey)
    if not skinCam or not DoesCamExist(skinCam) then return end

    currentCategory = catKey or currentCategory or 'skin'

    local ped    = PlayerPedId()
    local pedPos = GetEntityCoords(ped)

    -- base offset จากตัวละคร (ด้านหน้าเล็กน้อย)
    local baseOffsetY = 1.2
    local heightOffset = 0.6

    if currentCategory == 'skin' or currentCategory == 'head' then
        heightOffset = 0.6   -- ช่วงหัว / หน้า
    elseif currentCategory == 'body' then
        heightOffset = 0.2   -- ช่วงลำตัว
    elseif currentCategory == 'legs' then
        heightOffset = -0.4  -- ช่วงต้นขา
    else -- feet / misc
        heightOffset = -0.8  -- ช่วงเท้า
    end

    local camX = pedPos.x
    local camY = pedPos.y + baseOffsetY
    local camZ = pedPos.z + heightOffset

    SetCamCoord(skinCam, camX, camY, camZ)
    PointCamAtEntity(skinCam, ped, 0.0, 0.0, heightOffset + 0.2, true)
end


------------------------------------------------------------
-- apply จาก slider → skinchanger
------------------------------------------------------------
local function ApplySkinField(field, value)
    if not field or field == '' then
        return
    end

    value = tonumber(value) or 0

    -- ใช้ event ของ skinchanger โดยตรง (แบบเดียวกับ esx_skin เดิม)
    TriggerEvent('skinchanger:change', field, value)

    -- อัปเดต cache ด้วย
    TriggerEvent('skinchanger:getSkin', function(skin)
        if skin then
            CurrentSkin = deepCopy(skin)
        end
    end)
end

------------------------------------------------------------
-- เปิด/ปิด NUI
------------------------------------------------------------
local function OpenSkinMenuCommon(mode, freeMode)
    if isMenuOpen then return end
    isMenuOpen = true

    RefreshSkinCache()

    SetNuiFocus(true, true)
    SetNuiFocusKeepInput(true)

    EnsureSkinCam()
    UpdateSkinCamForCategory(mode == 'clothes' and 'body' or 'skin')
end

local function OpenSkinMenuFree()
    OpenSkinMenuCommon('skin', true)

    SendNUIMessage({
        action = "open",
        payload = {
            mode         = "skin",
            freeMode     = true,
            confirmPrice = Config.FreeSkinPrice,
            savePrice    = Config.OutfitSavePrice,
            wardrobe     = {},
        }
    })
end

local function OpenSkinMenuShop()
    OpenSkinMenuCommon('clothes', false)

    SendNUIMessage({
        action = "open",
        payload = {
            mode         = "clothes",
            freeMode     = false,
            confirmPrice = Config.ClothesShopPrice,
            savePrice    = Config.OutfitSavePrice,
            wardrobe     = {},
        }
    })
end

local function CloseSkinMenu()
    if not isMenuOpen then return end
    isMenuOpen = false

    DestroySkinCam()

    SetNuiFocus(false, false)
    SetNuiFocusKeepInput(false)

    SendNUIMessage({ action = "close" })
end

------------------------------------------------------------
-- Events ให้ script อื่นใช้
------------------------------------------------------------
RegisterNetEvent("lvx_skin:openFree", function()
    OpenSkinMenuFree()
end)

RegisterNetEvent("lvx_skin:openShop", function()
    OpenSkinMenuShop()
end)

------------------------------------------------------------
-- NUI Callbacks
------------------------------------------------------------

-- เปลี่ยนหมวด (ใช้เลื่อนกล้อง)
RegisterNUICallback("changeCategory", function(data, cb)
    local key = data and data.key or 'skin'
    UpdateSkinCamForCategory(key)
    cb({})
end)

-- ปิดเมนู (จาก ESC ใน NUI / ปุ่มปิด)
RegisterNUICallback("close", function(_, cb)
    CloseSkinMenu()
    cb({})
end)

-- CONFIRM
RegisterNUICallback("confirm", function(_, cb)
    -- Part 4: เซฟสกิน + ตัดเงิน ที่นี่
    CloseSkinMenu()
    cb({})
end)

-- RESET → กลับไปสกินก่อนเปิด
RegisterNUICallback("reset", function(_, cb)
    if next(SavedSkin) then
        TriggerEvent('skinchanger:loadSkin', SavedSkin)
        CurrentSkin = deepCopy(SavedSkin)
    else
        RefreshSkinCache()
    end
    cb({})
end)

-- save outfit (stub)
RegisterNUICallback("saveOutfit", function(data, cb)
    local name = (data and data.name or ''):gsub('^%s+', ''):gsub('%s+$','')
    if name == '' then
        print('[lvx_skin] saveOutfit: ชื่อชุดว่าง')
        cb({})
        return
    end

    print(('[lvx_skin] saveOutfit "%s" (stub, Part 4)'):format(name))
    cb({})
end)

-- use outfit (stub)
RegisterNUICallback("useOutfit", function(data, cb)
    local outfitId = data and data.id
    print(('[lvx_skin] useOutfit id=%s (stub, Part 4)'):format(tostring(outfitId)))
    cb({})
end)

-- อัปเดต slider
RegisterNUICallback("updateSlider", function(data, cb)
    local field = data and data.field
    local value = data and data.value
    ApplySkinField(field, value)
    cb({})
end)

------------------------------------------------------------
-- Loop: เช็คโซน + คุมปุ่มตอนเมนูเปิด
------------------------------------------------------------

-- โซน free / shop
CreateThread(function()
    local sleep

    while true do
        sleep = 1000

        if ESX and not isMenuOpen then
            local playerPed = PlayerPedId()
            local coords = GetEntityCoords(playerPed)

            local inFreeZone = false
            local inShopZone = false

            for _, zone in ipairs(Config.FreeSkinZones) do
                if #(coords - zone.coords) <= (zone.radius or 3.0) then
                    inFreeZone = true
                    break
                end
            end

            if not inFreeZone then
                for _, shop in ipairs(Config.ClothesShops) do
                    if #(coords - shop.coords) <= Config.InteractRange then
                        inShopZone = true
                        break
                    end
                end
            end

            if inFreeZone or inShopZone then
                sleep = 0

                if inFreeZone then
                    ESX.ShowHelpNotification("กด ~INPUT_CONTEXT~ เพื่อปรับสกินฟรี")
                elseif inShopZone then
                    ESX.ShowHelpNotification("กด ~INPUT_CONTEXT~ เพื่อใช้ ~b~ร้านเสื้อผ้า")
                end

                if IsControlJustReleased(0, 38) then -- E
                    if inFreeZone then
                        OpenSkinMenuFree()
                    else
                        OpenSkinMenuShop()
                    end
                end
            end
        end

        Wait(sleep)
    end
end)

-- คุมปุ่ม / กัน idle cam ตอนเมนูเปิด
CreateThread(function()
    while true do
        if isMenuOpen then
            -- กันเดิน / กระโดด / ยิง ฯลฯ
            DisableControlAction(0, 30, true)  -- move left/right
            DisableControlAction(0, 31, true)  -- move forward/back
            DisableControlAction(0, 21, true)  -- sprint
            DisableControlAction(0, 22, true)  -- jump
            DisableControlAction(0, 24, true)  -- attack
            DisableControlAction(0, 25, true)  -- aim (เราจะใช้เป็นปุ่มหมุนกล้อง)
            
            -- ก่อนอื่นปิดการมองรอบตัวไว้ก่อน
            DisableControlAction(0, 1, true)   -- LOOK_LEFT_RIGHT
            DisableControlAction(0, 2, true)   -- LOOK_UP_DOWN

            -- ถ้าคลิกขวาค้าง = อนุญาตให้หมุนกล้อง
            if IsControlPressed(0, 25) then    -- RIGHT MOUSE BUTTON
                EnableControlAction(0, 1, true)
                EnableControlAction(0, 2, true)
            end

            -- BACKSPACE = ปิดเมนู
            if IsControlJustReleased(0, 177) then
                CloseSkinMenu()
            end

            -- กัน idle cam ตอนเมนูเปิด
            InvalidateIdleCam()
            InvalidateVehicleIdleCam()

            Wait(0)
        else
            Wait(500)
        end
    end
end)


-- debug
RegisterCommand("fixview", function()
    DoScreenFadeIn(500)
    ClearTimecycleModifier()
    ClearFocus()
    DestroySkinCam()
    local ped = PlayerPedId()
    SetEntityCoords(ped, -1037.0, -2737.0, 20.0)
end)
