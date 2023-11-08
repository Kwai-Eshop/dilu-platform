import type { ICheckLoginResponse } from '@/Common/interface';
import React from 'react';
const UserContext = React.createContext<ICheckLoginResponse>({
  name: '',
  avatar: '',
  displayname: '',
  mail: '',
});
export default UserContext;
