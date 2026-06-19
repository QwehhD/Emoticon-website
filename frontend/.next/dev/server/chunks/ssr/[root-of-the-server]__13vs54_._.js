module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/tty [external] (tty, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/dns [external] (dns, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("dns", () => require("dns"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[project]/src/hooks/useMqttValidator.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useMqttValidator",
    ()=>useMqttValidator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$mqtt$2f$build$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/mqtt/build/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-ssr] (ecmascript) <locals>");
'use client';
;
;
;
function useMqttValidator() {
    const [isConnected, setIsConnected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [lastMessage, setLastMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const clientRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const userCacheRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    const cacheExpiryRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    const supabaseRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const CACHE_DURATION_MS = 60000;
    const getUserByUID = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (uid)=>{
        const now = Date.now();
        if (userCacheRef.current.has(uid)) {
            const expiry = cacheExpiryRef.current.get(uid) || 0;
            if (now < expiry) {
                return userCacheRef.current.get(uid) || null;
            }
            userCacheRef.current.delete(uid);
            cacheExpiryRef.current.delete(uid);
        }
        try {
            if (!supabaseRef.current) return null;
            const { data, error } = await supabaseRef.current.from('allowed_users').select('*').eq('uid', uid).maybeSingle();
            if (error) throw error;
            userCacheRef.current.set(uid, data);
            cacheExpiryRef.current.set(uid, now + CACHE_DURATION_MS);
            return data;
        } catch (error) {
            console.error('Database Error:', error);
            return null;
        }
    }, []);
    const publishAuthStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((valid)=>{
        if (!clientRef.current?.connected) {
            console.error('[MQTT] Cannot publish: client not connected');
            return;
        }
        const payload = {
            valid
        };
        clientRef.current.publish('v1/emotion/auth_status', JSON.stringify(payload), {
            qos: 1
        }, (err)=>{
            if (err) {
                console.error('[MQTT] Failed to publish auth_status:', err);
            } else {
                console.log(`[MQTT] ✓ Published auth_status: ${JSON.stringify(payload)}`);
            }
        });
    }, []);
    const handleMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (topic, message)=>{
        const messageStr = message.toString();
        console.log(`\n[${new Date().toISOString()}] Message received on ${topic}`);
        console.log('Payload:', messageStr);
        setLastMessage({
            topic,
            message: messageStr
        });
        try {
            const payload = JSON.parse(messageStr);
            if (topic === 'v1/emotion/check_uid') {
                const uid = payload.uid?.trim().toUpperCase();
                if (!uid) {
                    console.error('[MQTT] UID is empty');
                    publishAuthStatus(false);
                    return;
                }
                const userData = await getUserByUID(uid);
                const isValid = !!userData;
                console.log(`[MQTT] UID Check: ${uid} | Status: ${isValid ? '✓ VALID' : '✗ INVALID'} | User: ${userData?.nama || 'Unknown'}`);
                publishAuthStatus(isValid);
            }
            if (topic === 'v1/emotion/logs') {
                const { card_uid, emotion, timestamp } = payload;
                if (!card_uid || !emotion || !timestamp) {
                    console.error('[MQTT] Invalid emotion log format. Missing required fields:', payload);
                    return;
                }
                console.log('[MQTT] Emotion log received:');
                console.log(`  UID: ${card_uid}`);
                console.log(`  Emotion: ${emotion}`);
                console.log(`  Timestamp: ${timestamp}`);
            }
        } catch (error) {
            console.error('[MQTT] JSON Parse Error:', error);
            if (topic === 'v1/emotion/check_uid') {
                publishAuthStatus(false);
            }
        }
    }, [
        getUserByUID,
        publishAuthStatus
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const brokerUrl = process.env.NEXT_PUBLIC_MQTT_BROKER_URL;
        const username = process.env.NEXT_PUBLIC_MQTT_USERNAME;
        const password = process.env.NEXT_PUBLIC_MQTT_PASSWORD;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!brokerUrl || !username || !password || !supabaseUrl || !supabaseKey) {
            setError('Missing MQTT or Supabase configuration');
            return;
        }
        supabaseRef.current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseKey);
        const extractHost = (url)=>{
            try {
                const urlWithProtocol = url.includes('://') ? url : `wss://${url}`;
                return new URL(urlWithProtocol).hostname;
            } catch  {
                return url.split(':')[0];
            }
        };
        const host = extractHost(brokerUrl);
        const wsUrl = `wss://${host}:8884/mqtt`;
        console.log(`[MQTT] Connecting to ${wsUrl}...`);
        const client = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$mqtt$2f$build$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].connect(wsUrl, {
            username,
            password,
            clientId: `nextjs-client-${Math.random().toString(16).substring(2, 10)}`,
            clean: true,
            reconnectPeriod: 5000,
            connectTimeout: 30000,
            keepalive: 60,
            protocol: 'wss'
        });
        clientRef.current = client;
        client.on('connect', ()=>{
            console.log('[MQTT] ✓ Connected to HiveMQ Cloud via WebSocket');
            setIsConnected(true);
            setError(null);
            client.subscribe('v1/emotion/check_uid', {
                qos: 1
            }, (err)=>{
                if (err) {
                    console.error('[MQTT] Failed to subscribe to v1/emotion/check_uid:', err);
                } else {
                    console.log('[MQTT] ✓ Subscribed to v1/emotion/check_uid');
                }
            });
            client.subscribe('v1/emotion/logs', {
                qos: 1
            }, (err)=>{
                if (err) {
                    console.error('[MQTT] Failed to subscribe to v1/emotion/logs:', err);
                } else {
                    console.log('[MQTT] ✓ Subscribed to v1/emotion/logs');
                }
            });
        });
        client.on('message', (topic, message)=>{
            handleMessage(topic, message).catch(console.error);
        });
        client.on('error', (err)=>{
            console.error('[MQTT] Connection Error:', err.message);
            setError(err.message);
            setIsConnected(false);
        });
        client.on('reconnect', ()=>{
            console.log('[MQTT] ⟳ Reconnecting...');
        });
        client.on('offline', ()=>{
            console.warn('[MQTT] ⚠ Client went offline');
            setIsConnected(false);
        });
        client.on('close', ()=>{
            console.log('[MQTT] Connection closed');
            setIsConnected(false);
        });
        return ()=>{
            if (clientRef.current) {
                clientRef.current.end();
                console.log('[MQTT] Disconnected');
            }
        };
    }, [
        handleMessage
    ]);
    return {
        isConnected,
        error,
        lastMessage
    };
}
}),
"[project]/src/components/MqttProvider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MqttProvider",
    ()=>MqttProvider,
    "useMqtt",
    ()=>useMqtt
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useMqttValidator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useMqttValidator.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
const MqttContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function MqttProvider({ children }) {
    const mqtt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useMqttValidator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMqttValidator"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MqttContext.Provider, {
        value: mqtt,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/MqttProvider.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
function useMqtt() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(MqttContext);
    if (context === undefined) {
        throw new Error('useMqtt must be used within MqttProvider');
    }
    return context;
}
}),
"[project]/src/components/MqttStatusIndicator.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MqttStatusIndicator",
    ()=>MqttStatusIndicator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$MqttProvider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/MqttProvider.tsx [app-ssr] (ecmascript)");
'use client';
;
;
function MqttStatusIndicator() {
    const { isConnected, error } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$MqttProvider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMqtt"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed bottom-4 right-4 z-50",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${isConnected ? 'bg-green-500 text-white' : error ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'}`,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `w-2 h-2 rounded-full ${isConnected ? 'bg-white animate-pulse' : 'bg-white/50'}`
                }, void 0, false, {
                    fileName: "[project]/src/components/MqttStatusIndicator.tsx",
                    lineNumber: 17,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-sm font-medium",
                    children: isConnected ? 'MQTT Connected' : error ? `MQTT Error: ${error}` : 'MQTT Connecting...'
                }, void 0, false, {
                    fileName: "[project]/src/components/MqttStatusIndicator.tsx",
                    lineNumber: 20,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/MqttStatusIndicator.tsx",
            lineNumber: 10,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/MqttStatusIndicator.tsx",
        lineNumber: 9,
        columnNumber: 5
    }, this);
}
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__13vs54_._.js.map