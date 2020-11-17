"use strict";
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const {rand, uuid, md5} = require("./common");

function getMac() {
    const o = os.networkInterfaces();
    for (let k in o) {
        for (let v of o[k]) {
            if (!v.internal)
                return v.mac.toUpperCase();
        }
    }
    return `00:50:A${rand(1)}:${rand(1)}D:${rand(1)}B:C${rand(1)}`;
}

function genDevice(filepath) {
    const device = `{
    "--begin--":    "修改后可能需要重新验证设备。",
    "product":      "iarim",
    "device":       "sagit",
    "board":        "eomam",
    "brand":        "Xiaomi",
    "model":        "MI ${rand(1)}",
    "wifi_ssid":    "TP-LINK-${rand(10).toString(16)}",
    "bootloader":   "U-boot",
    "--end--":      "下面的请勿随意修改，除非你知道你在做什么。",
    "android_id":   "BRAND.${rand(6)}.${rand(3)}",
    "boot_id":      "${uuid()}",
    "proc_version": "Linux version 4.19.71-${rand(5)} (example@xxx.java.sun.com)",
    "mac_address":  "${getMac()}",
    "ip_address":   "10.0.${rand(2)}.${rand(2)}",
    "imei":         "${rand(15)}",
    "incremental":  "${rand(7)}"
}`;
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, {recursive: true, mode: 0o755});
    fs.writeFileSync(filepath, device);
    return JSON.parse(device);
}

module.exports = function(filepath) {
    var d;
    if (fs.existsSync(filepath)) {
        d = JSON.parse(fs.readFileSync(filepath));
    } else {
        d = genDevice(filepath);
    }
    const device = {
        display:      d.android_id,
        product:      d.product,
        device:       d.device,
        board:        d.board,
        brand:        d.brand,
        model:        d.model,
        bootloader:   d.bootloader,
        fingerprint:  `${d.brand}/${d.product}/${d.device}:10/${d.android_id}/${d.incremental}:user/release-keys`,
        boot_id:      d.boot_id,
        proc_version: d.proc_version,
        baseband:     "",
        sim_info:     "T-Mobile",
        os_type:      "android",
        mac_address:  d.mac_address,
        ip_address:   d.ip_address,
        wifi_bssid:   d.mac_address,
        wifi_ssid:    d.wifi_ssid,
        imei:         d.imei,
        android_id:   d.android_id,
        apn:          "wifi",
        version: {
            incremental: d.incremental,
            release:     "10",
            codename:    "REL",
            sdk:         29
        }
    };
    device.imsi_md5 = crypto.randomBytes(16);
    device.tgtgt_key = crypto.randomBytes(16);
    device.guid = md5(Buffer.concat([Buffer.from(device.android_id), Buffer.from(device.mac_address)]));
    return device;
};
