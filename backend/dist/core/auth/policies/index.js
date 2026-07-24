"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NOTIFICATION_PERMISSIONS_POLICY = exports.SETTING_PERMISSIONS_POLICY = exports.MEDIA_PERMISSIONS_POLICY = exports.DEPARTMENT_PERMISSIONS_POLICY = exports.ROLE_PERMISSIONS_POLICY = exports.USER_PERMISSIONS_POLICY = exports.ALL_SYSTEM_POLICIES = void 0;
const user_policy_1 = require("./user.policy");
Object.defineProperty(exports, "USER_PERMISSIONS_POLICY", { enumerable: true, get: function () { return user_policy_1.USER_PERMISSIONS_POLICY; } });
const role_policy_1 = require("./role.policy");
Object.defineProperty(exports, "ROLE_PERMISSIONS_POLICY", { enumerable: true, get: function () { return role_policy_1.ROLE_PERMISSIONS_POLICY; } });
const department_policy_1 = require("./department.policy");
Object.defineProperty(exports, "DEPARTMENT_PERMISSIONS_POLICY", { enumerable: true, get: function () { return department_policy_1.DEPARTMENT_PERMISSIONS_POLICY; } });
const media_policy_1 = require("./media.policy");
Object.defineProperty(exports, "MEDIA_PERMISSIONS_POLICY", { enumerable: true, get: function () { return media_policy_1.MEDIA_PERMISSIONS_POLICY; } });
const setting_policy_1 = require("./setting.policy");
Object.defineProperty(exports, "SETTING_PERMISSIONS_POLICY", { enumerable: true, get: function () { return setting_policy_1.SETTING_PERMISSIONS_POLICY; } });
const notification_policy_1 = require("./notification.policy");
Object.defineProperty(exports, "NOTIFICATION_PERMISSIONS_POLICY", { enumerable: true, get: function () { return notification_policy_1.NOTIFICATION_PERMISSIONS_POLICY; } });
exports.ALL_SYSTEM_POLICIES = [
    ...user_policy_1.USER_PERMISSIONS_POLICY,
    ...role_policy_1.ROLE_PERMISSIONS_POLICY,
    ...department_policy_1.DEPARTMENT_PERMISSIONS_POLICY,
    ...media_policy_1.MEDIA_PERMISSIONS_POLICY,
    ...setting_policy_1.SETTING_PERMISSIONS_POLICY,
    ...notification_policy_1.NOTIFICATION_PERMISSIONS_POLICY,
];
//# sourceMappingURL=index.js.map