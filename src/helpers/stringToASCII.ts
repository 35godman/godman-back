export const stringToASCII = (str: string): string => {
  const asciiArray = [];
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    asciiArray.push(charCode);
  }
  return asciiArray.join('');
};
