import { sourcesStub } from '../../stubs/sources.stub';
import settingsStub from '../../stubs/settings.stub';
import { fileUploadStub } from '../../../FILES/fileUpload/stubs/fileUpload.stub';
import { ResponseResult } from '../../../../enum/response.enum';

export const SourcesService = jest.fn().mockReturnValue({
  createDefault: jest.fn().mockReturnValue(settingsStub()),
  addSourceFile: jest.fn().mockReturnValue(fileUploadStub()),
  findByChatbotId: jest.fn().mockReturnValue(sourcesStub()),
  deleteById: jest.fn().mockReturnValue(ResponseResult.SUCCESS),
  addQnA: jest.fn().mockReturnValue(200),
  resetWebCrawledFiles: jest.fn().mockReturnValue(ResponseResult.SUCCESS),
  resetUploadedFiles: jest.fn().mockReturnValue(ResponseResult.SUCCESS),
  resetQnA: jest.fn().mockReturnValue(ResponseResult.SUCCESS),
  resetTextSource: jest.fn().mockReturnValue(ResponseResult.SUCCESS),
  deleteAllSources: jest.fn().mockReturnValue(ResponseResult.SUCCESS),
});
