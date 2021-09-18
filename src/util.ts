export const getCode = (s: String) => {
  return `
const decodeBase64 =
typeof atob === "function"? atob: function (input) {
    const keyStr =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    let output = "";
    let chr1, chr2, chr3;
    let enc1, enc2, enc3, enc4;
    let i = 0;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    do {
        enc1 = keyStr.indexOf(input.charAt(i++));
        enc2 = keyStr.indexOf(input.charAt(i++));
        enc3 = keyStr.indexOf(input.charAt(i++));
        enc4 = keyStr.indexOf(input.charAt(i++));
        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;
        output = output + String.fromCharCode(chr1);
        if (enc3 !== 64) {
        output = output + String.fromCharCode(chr2);
        }
        if (enc4 !== 64) {
        output = output + String.fromCharCode(chr3);
        }
    } while (i < input.length);
    return output;
};  
    
  function intArrayFromBase64(s) {
    try {
      const decoded = decodeBase64(s);
      const bytes = new Uint8Array(decoded.length);
      for (let i = 0; i < decoded.length; ++i) {
        bytes[i] = decoded.charCodeAt(i);
      }
      return bytes;
    } catch (_) {
      throw new Error("Converting base64 string to bytes failed.");
    }
  }
const wasmBase64 = "${s}";
async function load(imports={}) {
    const bytes = intArrayFromBase64(wasmBase64);
    return await WebAssembly.instantiate(bytes, imports);
}

async function init() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    const { instance, module } = await load(imports);
    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;
    return wasm;
}

export default init;
`;
};
