import { AppError, globalErrorHandler } from "../../src/utils/errorHandler";
// Mock the configs to avoid environment variable issues
jest.mock("../../src/configs/configs", () => ({
    NODE_ENV: "test", // default value
}));
describe("Error Handler", () => {
    let mockRequest;
    let mockResponse;
    let nextFunction;
    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        nextFunction = jest.fn();
    });
    describe("AppError", () => {
        it("should create an AppError with correct properties", () => {
            const error = new AppError("Test error", 400);
            expect(error.message).toBe("Test error");
            expect(error.statusCode).toBe(400);
            expect(error.status).toBe("fail");
            expect(error.isOperational).toBe(true);
        });
        it("should have status 'error' for 5xx errors", () => {
            const error = new AppError("Server error", 500);
            expect(error.status).toBe("error");
        });
    });
    describe("globalErrorHandler", () => {
        it("should handle operational errors in production", () => {
            // Mock NODE_ENV for this test by overriding the mock
            jest.resetModules();
            jest.doMock("../../src/configs/configs", () => ({
                NODE_ENV: "production",
            }));
            // Re-import after mocking
            const { globalErrorHandler } = require("../../src/utils/errorHandler");
            const error = new AppError("Operational error", 400);
            globalErrorHandler(error, mockRequest, mockResponse, nextFunction);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: "fail",
                message: "Operational error",
            });
        });
        it("should handle non-operational errors in production", () => {
            jest.resetModules();
            jest.doMock("../../src/configs/configs", () => ({
                NODE_ENV: "production",
            }));
            const { globalErrorHandler } = require("../../src/utils/errorHandler");
            const error = new Error("Non-operational error");
            error.statusCode = 500;
            error.status = "error";
            error.isOperational = false;
            globalErrorHandler(error, mockRequest, mockResponse, nextFunction);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: "error",
                message: "Something went wrong",
            });
        });
        it("should handle errors in development with stack trace", () => {
            jest.resetModules();
            jest.doMock("../../src/configs/configs", () => ({
                NODE_ENV: "development",
            }));
            const { globalErrorHandler } = require("../../src/utils/errorHandler");
            const error = new AppError("Development error", 400);
            globalErrorHandler(error, mockRequest, mockResponse, nextFunction);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: "fail",
                error: error,
                message: "Development error",
                stack: error.stack,
            });
        });
    });
});
//# sourceMappingURL=errorHandler.test.js.map