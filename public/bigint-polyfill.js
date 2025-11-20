(function() {
    'use strict';
    
    if (typeof BigInt !== 'undefined') {
        return; // Already supported
    }
    
    var BigIntPolyfill = function(value) {
        var n = Number(value);
        
        var obj = {
            valueOf: function() { return n; },
            toString: function(radix) { 
                return n.toString(radix || 10); 
            },
            toLocaleString: function() { 
                return n.toLocaleString(); 
            }
        };
        
        return obj;
    };
    
    // Attach to window and globalThis
    if (typeof window !== 'undefined') {
        window.BigInt = BigIntPolyfill;
    }
    if (typeof globalThis !== 'undefined') {
        globalThis.BigInt = BigIntPolyfill;
    }
    if (typeof global !== 'undefined') {
        global.BigInt = BigIntPolyfill;
    }
    
    console.warn('Safari 13 detected: BigInt polyfill loaded');
})();