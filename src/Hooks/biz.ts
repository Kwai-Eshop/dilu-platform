import type { IGetBizListResponse } from '@/Common/interface';
import { useState, useEffect } from 'react';
import { api_getBizList } from '../Apis';

let cacheBizList: IGetBizListResponse = [];
const emptyBizList: IGetBizListResponse = [];

export const useBiz = () => {
  const [biz, setBiz] = useState<IGetBizListResponse>(cacheBizList);

  const getBizList = async () => {
    try {
      const res = await api_getBizList();
      setBiz(res?.data || emptyBizList);
      cacheBizList = res?.data || emptyBizList;
    } catch (e) {
      setBiz(emptyBizList);
    }
  };

  useEffect(() => {
    if (!biz.length) {
      getBizList();
    }
  }, [biz]);
  return biz;
};
