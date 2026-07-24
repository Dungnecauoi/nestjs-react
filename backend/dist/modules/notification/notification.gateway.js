"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let NotificationGateway = NotificationGateway_1 = class NotificationGateway {
    server;
    logger = new common_1.Logger(NotificationGateway_1.name);
    handleConnection(client) {
        const userId = client.handshake.query.userId;
        if (userId) {
            client.join(`user_${userId}`);
            this.logger.log(`Client connected & joined room user_${userId}: ${client.id}`);
        }
        else {
            this.logger.log(`Client connected anonymously: ${client.id}`);
        }
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    handleJoinRoom(client, payload) {
        if (payload?.userId) {
            client.join(`user_${payload.userId}`);
            this.logger.log(`Client ${client.id} explicitly joined user_${payload.userId}`);
        }
    }
    sendNotificationToUser(userId, notification) {
        if (userId) {
            this.server.to(`user_${userId}`).emit('notification', notification);
        }
        else {
            this.server.emit('notification', notification);
        }
    }
};
exports.NotificationGateway = NotificationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinUserRoom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], NotificationGateway.prototype, "handleJoinRoom", null);
exports.NotificationGateway = NotificationGateway = NotificationGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/notifications',
        cors: {
            origin: '*',
        },
    })
], NotificationGateway);
//# sourceMappingURL=notification.gateway.js.map