import { Types } from "mongoose";
export const createMockRequest = (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    cookies: {},
    user: undefined,
    ...overrides
});
export const createMockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn();
    return res;
};
export const mockNextFunction = jest.fn();
export const mockUser = {
    userId: new Types.ObjectId().toString(),
    team: "test-team",
    role: "user"
};
//# sourceMappingURL=test-utils.js.map