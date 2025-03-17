export function indexNormalizeString(value: string | undefined | null) {
  value = toAscii(value);

  if (value == null) return value;

  return value.toLowerCase();
}

export function urlFriendlyNormalizeString(value: string | undefined | null) {
  value = toAscii(value);

  if (value == null) return value;

  value = value
    .replace(/[^a-z0-9_]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

  while (value.includes('--')) {
    value = value.replace(/--/g, '-');
  }

  return value;
}

export function toAscii(value: string | undefined | null) {
  if (value == null) return value;

  const unicode =
    'áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴđĐ';
  const ascii =
    'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyAAAAAAAAAAAAAAAAAEEEEEEEEEEEIIIIIOOOOOOOOOOOOOOOOOUUUUUUUUUUUYYYYYdD';

  for (let i = 0; i < unicode.length; i++) {
    value = value.replace(new RegExp(unicode[i]!, 'g'), ascii[i]!);
  }

  return value;
}
