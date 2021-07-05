const _debug = Object.assign({}, {
    showColliders: false,
    showProfiler: false
}, loadDebug())

function loadDebug(): any {
    const stored = localStorage.getItem("debug_state")
    if (stored) {
        console.log("loaded debug state from local storage")
        return JSON.parse(stored)
    }
    return {}
}

export const debug = new Proxy(_debug, {
    set(target, property, value, receiver) {
        let success = Reflect.set(target, property, value, receiver);
        if (success) {
            localStorage.setItem("debug_state", JSON.stringify(_debug))
        }
        return success;
    }
});

window['debug'] = debug

// from https://stackoverflow.com/questions/4391575/how-to-find-the-size-of-localstorage
window["localStorageUsage"] = () => {
    var _lsTotal = 0, _xLen, _x;
    for (_x in localStorage) {
        if (!localStorage.hasOwnProperty(_x)) {
            continue;
        }
        _xLen = ((localStorage[_x].length + _x.length) * 2);
        _lsTotal += _xLen;
        console.log(_x.substr(0, 50) + " = " + (_xLen / 1024).toFixed(2) + " KB")
    };
    console.log("Total = " + (_lsTotal / 1024).toFixed(2) + " KB");
}