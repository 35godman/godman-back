import * as iconv from 'iconv-lite';

export function convertFilenameToUtf8(filename: string): string {
  // Extract the file extension
  const fileExtension = filename.split('.').pop();

  // Remove the extension from the filename
  const filenameWithoutExtension = filename.slice(
    0,
    -(fileExtension.length + 1),
  );

  // Convert the filename to UTF-8
  const utf8Filename = iconv.decode(
    Buffer.from(filenameWithoutExtension, 'binary'),
    'win1251',
  );

  // Add the file extension back to the UTF-8 filename
  return utf8Filename + '.' + fileExtension;
}
