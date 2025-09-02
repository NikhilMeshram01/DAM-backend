import { Types } from "mongoose";
export declare const mockAsset: {
    _id: Types.ObjectId;
    originalName: string;
    fileName: string;
    mimeType: string;
    size: string;
    key: string;
    bucket: string;
    path: string;
    versions: {
        original: string;
    };
    tags: string[];
    category: "image";
    status: "pending";
    uploader: Types.ObjectId;
    downloadCount: number;
    metadata: {};
    team: string;
    save: jest.Mock<any, any, any>;
};
declare const _default: {
    findById: jest.Mock<any, any, any>;
    create: jest.Mock<any, any, any>;
    find: jest.Mock<any, any, any>;
    findOne: jest.Mock<any, any, any>;
    findByIdAndUpdate: jest.Mock<any, any, any>;
    findByIdAndDelete: jest.Mock<any, any, any>;
};
export default _default;
//# sourceMappingURL=asset.model.mock.d.ts.map