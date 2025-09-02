import type { Request } from "express";
export declare const createMockRequest: (overrides?: Partial<Request>) => Partial<Request>;
export declare const createMockResponse: () => any;
export declare const mockNextFunction: jest.Mock<any, any, any>;
export declare const mockUser: {
    userId: string;
    team: string;
    role: string;
};
//# sourceMappingURL=test-utils.d.ts.map