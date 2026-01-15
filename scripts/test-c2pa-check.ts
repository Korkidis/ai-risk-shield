

(async () => {
    try {
        const { createC2pa } = require('c2pa-node');
        const c2pa = await createC2pa();
        console.log('C2PA Instance Keys:', Object.keys(c2pa));
        console.log('C2PA Instance Prototype:', Object.getPrototypeOf(c2pa));
    } catch (e) {
        console.error("Error:", e);
    }
})();

