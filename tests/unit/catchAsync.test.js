import catchAsync from "../../src/utils/catchAsync";
describe("catchAsync", () => {
    let mockRequest;
    let mockResponse;
    let nextFunction;
    beforeEach(() => {
        mockRequest = {};
        mockResponse = {};
        nextFunction = jest.fn();
    });
    it("should catch async errors and pass them to next", async () => {
        const error = new Error("Async error");
        const asyncFn = jest.fn().mockRejectedValue(error);
        const wrappedFn = catchAsync(asyncFn);
        await wrappedFn(mockRequest, mockResponse, nextFunction);
        expect(asyncFn).toHaveBeenCalled();
        expect(nextFunction).toHaveBeenCalledWith(error);
    });
    it("should not call next if async function succeeds", async () => {
        const asyncFn = jest.fn().mockResolvedValue("success");
        const wrappedFn = catchAsync(asyncFn);
        await wrappedFn(mockRequest, mockResponse, nextFunction);
        expect(asyncFn).toHaveBeenCalled();
        expect(nextFunction).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=catchAsync.test.js.map