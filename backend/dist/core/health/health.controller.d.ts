import { HealthCheckService, HttpHealthIndicator, MemoryHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';
export declare class HealthController {
    private health;
    private http;
    private memory;
    private disk;
    constructor(health: HealthCheckService, http: HttpHealthIndicator, memory: MemoryHealthIndicator, disk: DiskHealthIndicator);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult<import("@nestjs/terminus").HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>> & import("@nestjs/terminus").HealthIndicatorResult<"storage"> & import("@nestjs/terminus").HealthIndicatorResult<"memory_heap">, Partial<import("@nestjs/terminus").HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>> & import("@nestjs/terminus").HealthIndicatorResult<"storage"> & import("@nestjs/terminus").HealthIndicatorResult<"memory_heap">> | undefined, Partial<import("@nestjs/terminus").HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>> & import("@nestjs/terminus").HealthIndicatorResult<"storage"> & import("@nestjs/terminus").HealthIndicatorResult<"memory_heap">> | undefined>>;
}
