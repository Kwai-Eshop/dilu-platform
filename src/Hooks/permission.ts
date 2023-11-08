import { useState, useEffect } from 'react';
import { api_getMainAppPermission } from '../Apis';
import type { IGetMainAppPermissionResponse } from '@/Common/interface';

const permissionMap: Record<string, any> = {};

const INIT_PERMISSION = {
  isAdmin: false,
  isMember: false,
  isRoot: false,
};

export const usePermission = (id: string) => {
  const [permission, setPermission] = useState<IGetMainAppPermissionResponse>(INIT_PERMISSION);
  useEffect(() => {
    if (permissionMap[id]) {
      setPermission(permissionMap[id]);
    } else {
      (async () => {
        try {
          const res = await api_getMainAppPermission({ id });
          setPermission(res.data);
          permissionMap[id] = res.data;
        } catch (e) {
          setPermission(INIT_PERMISSION);
        }
      })();
    }
  }, [id]);
  return {
    ...permission,
    isDeveloper: permission?.isRoot || permission.isAdmin || permission?.isMember,
    isAdmin: permission?.isRoot || permission.isAdmin,
  };
};
