const _debug = Object.assign(
    {},
    {
        showColliders: false,
        showProfiler: false,
        showRenderStats: false,
    },
    loadDebug()
)

function loadDebug(): any {
    if (typeof localStorage === "undefined") {
        console.log("[debug] cannot access localStorage, debug disabled")
        return {}
    }
    const stored = localStorage.getItem("debug_state")
    if (stored) {
        console.log("[debug] loaded state from localStorage")
        return JSON.parse(stored)
    }
    return {}
}

export const debug = new Proxy(_debug, {
    set(target, property, value, receiver) {
        let success = Reflect.set(target, property, value, receiver)
        if (success && typeof localStorage !== "undefined") {
            localStorage.setItem("debug_state", JSON.stringify(_debug))
        }
        return success
    },
})

const localStorageUsage = () => {
    var _lsTotal = 0,
        _xLen,
        _x
    for (_x in localStorage) {
        if (!localStorage.hasOwnProperty(_x)) {
            continue
        }
        _xLen = (localStorage[_x].length + _x.length) * 2
        _lsTotal += _xLen
        console.log(_x.substr(0, 50) + " = " + (_xLen / 1024).toFixed(2) + " KB")
    }
    console.log("Total = " + (_lsTotal / 1024).toFixed(2) + " KB")
}

/**
 * Safely expose stuff on the window
 * @param stuff key/value pairs to expose
 */
export const expose = (stuff: object) => {
    if (typeof window !== "undefined") {
        Object.entries(stuff).forEach(([key, val]) => {
            window[key] = val
        })
    }
}

expose({ debug, localStorageUsage })
