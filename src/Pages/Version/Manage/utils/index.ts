import type { ITailNumberConfig } from '@/Common/interface';

export function tailNumber2FormData(tailNumber: string): ITailNumberConfig {
  if (!tailNumber) {
    return {};
  }
  const [scale, accessList = '', blockList = ''] = tailNumber.split(';');
  const realScale = scale ? scale.split('-') : [0, 0];

  if (tailNumber === '100;0-99') {
    return { needGray: false };
  }
  return {
    needGray: true,
    grayPersentage: Number(realScale?.[1]) - Number(realScale?.[0]) + 1,
    accessList: accessList.split(','),
    blockList,
  };
}

export function formData2TailNumber(formData: ITailNumberConfig): string {
  if (!formData.grayPersentage && !formData.accessList && !formData.blockList) {
    return '100;0-99;';
  }
  const result = '100;';
  return `${result}${formData.grayPersentage ? '0-' + String(formData.grayPersentage - 1) : ''};${
    formData.accessList?.join?.(',') || ''
  };${formData.blockList || ''}`;
}
