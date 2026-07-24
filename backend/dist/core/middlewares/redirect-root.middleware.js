"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedirectRootMiddleware = void 0;
const common_1 = require("@nestjs/common");
let RedirectRootMiddleware = class RedirectRootMiddleware {
    use(req, res, next) {
        const apiPrefix = process.env.API_PREFIX || 'api';
        if (req.url === '/' || req.url === '') {
            return res.redirect(`/${apiPrefix}`);
        }
        next();
    }
};
exports.RedirectRootMiddleware = RedirectRootMiddleware;
exports.RedirectRootMiddleware = RedirectRootMiddleware = __decorate([
    (0, common_1.Injectable)()
], RedirectRootMiddleware);
//# sourceMappingURL=redirect-root.middleware.js.map