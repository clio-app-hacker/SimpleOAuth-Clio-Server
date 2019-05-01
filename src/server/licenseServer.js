const Store = require("data-store");
const uuid = require('uuidv4');

let LicenseType = {
  Individual: "Individual",
};

const createLicense = () => {
  return uuid();
};

const findLicense = (userId) => {
  let license = null;
  if (LicenseServer.store.has(userId)) {
    license = LicenseServer.store.get(userId);
  }
  return license;
};

const storeLicense = (userId, license) => {
  LicenseServer.store.set(userId, license);
}; ``

const LicenseServer = {
  store: new Store({ path: "license.json" }),
  getLicense: function (userId) {
    console.log("User:", userId);
    let license = findLicense(userId);
    if (!license) {
      license = {
        license: {
          uuid: createLicense(),
          type: LicenseType.Individual,
          discountPercent: 0,
          licenseSince: Date.now(),
        },
        user: {
          id: userId,
        },
      };
      console.log("License created:", license);
      storeLicense(userId, license);
    }
    console.log("License returned:", license);
    return license;
  },
};

module.exports = LicenseServer;
