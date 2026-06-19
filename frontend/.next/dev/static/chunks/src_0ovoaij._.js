(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/hooks/useMqttValidator.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useMqttValidator",
    ()=>useMqttValidator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$mqtt$2f$dist$2f$mqtt$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/mqtt/dist/mqtt.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-client] (ecmascript) <locals>");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function useMqttValidator() {
    _s();
    const [isConnected, setIsConnected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [lastMessage, setLastMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const clientRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const userCacheRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    const cacheExpiryRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    const supabaseRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const CACHE_DURATION_MS = 60000;
    const getUserByUID = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useMqttValidator.useCallback[getUserByUID]": async (uid)=>{
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
        }
    }["useMqttValidator.useCallback[getUserByUID]"], []);
    const publishAuthStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useMqttValidator.useCallback[publishAuthStatus]": (valid)=>{
            if (!clientRef.current?.connected) {
                console.error('[MQTT] Cannot publish: client not connected');
                return;
            }
            const payload = {
                valid
            };
            clientRef.current.publish('v1/emotion/auth_status', JSON.stringify(payload), {
                qos: 1
            }, {
                "useMqttValidator.useCallback[publishAuthStatus]": (err)=>{
                    if (err) {
                        console.error('[MQTT] Failed to publish auth_status:', err);
                    } else {
                        console.log(`[MQTT] ✓ Published auth_status: ${JSON.stringify(payload)}`);
                    }
                }
            }["useMqttValidator.useCallback[publishAuthStatus]"]);
        }
    }["useMqttValidator.useCallback[publishAuthStatus]"], []);
    const handleMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useMqttValidator.useCallback[handleMessage]": async (topic, message)=>{
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
        }
    }["useMqttValidator.useCallback[handleMessage]"], [
        getUserByUID,
        publishAuthStatus
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useMqttValidator.useEffect": ()=>{
            const brokerUrl = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_MQTT_BROKER_URL;
            const username = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_MQTT_USERNAME;
            const password = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_MQTT_PASSWORD;
            const supabaseUrl = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_SUPABASE_URL;
            const supabaseKey = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            if (!brokerUrl || !username || !password || !supabaseUrl || !supabaseKey) {
                setError('Missing MQTT or Supabase configuration');
                return;
            }
            supabaseRef.current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseKey);
            const extractHost = {
                "useMqttValidator.useEffect.extractHost": (url)=>{
                    try {
                        const urlWithProtocol = url.includes('://') ? url : `wss://${url}`;
                        return new URL(urlWithProtocol).hostname;
                    } catch  {
                        return url.split(':')[0];
                    }
                }
            }["useMqttValidator.useEffect.extractHost"];
            const host = extractHost(brokerUrl);
            const wsUrl = `wss://${host}:8884/mqtt`;
            console.log(`[MQTT] Connecting to ${wsUrl}...`);
            const client = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$mqtt$2f$dist$2f$mqtt$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].connect(wsUrl, {
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
            client.on('connect', {
                "useMqttValidator.useEffect": ()=>{
                    console.log('[MQTT] ✓ Connected to HiveMQ Cloud via WebSocket');
                    setIsConnected(true);
                    setError(null);
                    client.subscribe('v1/emotion/check_uid', {
                        qos: 1
                    }, {
                        "useMqttValidator.useEffect": (err)=>{
                            if (err) {
                                console.error('[MQTT] Failed to subscribe to v1/emotion/check_uid:', err);
                            } else {
                                console.log('[MQTT] ✓ Subscribed to v1/emotion/check_uid');
                            }
                        }
                    }["useMqttValidator.useEffect"]);
                    client.subscribe('v1/emotion/logs', {
                        qos: 1
                    }, {
                        "useMqttValidator.useEffect": (err)=>{
                            if (err) {
                                console.error('[MQTT] Failed to subscribe to v1/emotion/logs:', err);
                            } else {
                                console.log('[MQTT] ✓ Subscribed to v1/emotion/logs');
                            }
                        }
                    }["useMqttValidator.useEffect"]);
                }
            }["useMqttValidator.useEffect"]);
            client.on('message', {
                "useMqttValidator.useEffect": (topic, message)=>{
                    handleMessage(topic, message).catch(console.error);
                }
            }["useMqttValidator.useEffect"]);
            client.on('error', {
                "useMqttValidator.useEffect": (err)=>{
                    console.error('[MQTT] Connection Error:', err.message);
                    setError(err.message);
                    setIsConnected(false);
                }
            }["useMqttValidator.useEffect"]);
            client.on('reconnect', {
                "useMqttValidator.useEffect": ()=>{
                    console.log('[MQTT] ⟳ Reconnecting...');
                }
            }["useMqttValidator.useEffect"]);
            client.on('offline', {
                "useMqttValidator.useEffect": ()=>{
                    console.warn('[MQTT] ⚠ Client went offline');
                    setIsConnected(false);
                }
            }["useMqttValidator.useEffect"]);
            client.on('close', {
                "useMqttValidator.useEffect": ()=>{
                    console.log('[MQTT] Connection closed');
                    setIsConnected(false);
                }
            }["useMqttValidator.useEffect"]);
            return ({
                "useMqttValidator.useEffect": ()=>{
                    if (clientRef.current) {
                        clientRef.current.end();
                        console.log('[MQTT] Disconnected');
                    }
                }
            })["useMqttValidator.useEffect"];
        }
    }["useMqttValidator.useEffect"], [
        handleMessage
    ]);
    return {
        isConnected,
        error,
        lastMessage
    };
}
_s(useMqttValidator, "iWLso+wlClpsqQJgdX7/zjt+DA4=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/MqttProvider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MqttProvider",
    ()=>MqttProvider,
    "useMqtt",
    ()=>useMqtt
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useMqttValidator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useMqttValidator.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
const MqttContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function MqttProvider({ children }) {
    _s();
    const mqtt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useMqttValidator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMqttValidator"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MqttContext.Provider, {
        value: mqtt,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/MqttProvider.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
_s(MqttProvider, "RDgNNVbGL57EM5MiZM1WEk2cNok=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useMqttValidator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMqttValidator"]
    ];
});
_c = MqttProvider;
function useMqtt() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(MqttContext);
    if (context === undefined) {
        throw new Error('useMqtt must be used within MqttProvider');
    }
    return context;
}
_s1(useMqtt, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "MqttProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/MqttStatusIndicator.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MqttStatusIndicator",
    ()=>MqttStatusIndicator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$MqttProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/MqttProvider.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
function MqttStatusIndicator() {
    _s();
    const { isConnected, error } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$MqttProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMqtt"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed bottom-4 right-4 z-50",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${isConnected ? 'bg-green-500 text-white' : error ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'}`,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `w-2 h-2 rounded-full ${isConnected ? 'bg-white animate-pulse' : 'bg-white/50'}`
                }, void 0, false, {
                    fileName: "[project]/src/components/MqttStatusIndicator.tsx",
                    lineNumber: 17,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
_s(MqttStatusIndicator, "d9abY844rL2FI1o6WycyV3omaI0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$MqttProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMqtt"]
    ];
});
_c = MqttStatusIndicator;
var _c;
__turbopack_context__.k.register(_c, "MqttStatusIndicator");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_0ovoaij._.js.map