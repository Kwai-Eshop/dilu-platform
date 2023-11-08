import React, { useCallback, useEffect, useState } from 'react';
import { Drawer, Tabs, List, Avatar, message, Button, Modal, Tooltip, Input } from 'antd';
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import AddUser from './AddUser';
import { uniqBy } from 'lodash-es';
import { api_getMainAppUsers, api_addUserGroup, api_updatePersionGroup } from '@/Apis';

const { Search } = Input;
const { TabPane } = Tabs;
function randomColor() {
  const ColorList = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae'];
  const index = Math.floor(Math.random() * 4);
  return ColorList[index];
}

const mainAdmin = 'mainAdmin';
const mainUser = 'mainUser';

function AccessManagement(props) {
  const { visible = false, onClose, appInfo } = props;
  const [role, setRole] = useState('admin');
  const [mainUsers, setMainUsers] = useState(null);
  const [addUserVisible, setAddUserVisible] = useState(false);
  const [addMemberVisible, setAddMemberVisible] = useState(false);
  const [renderAdmins, setRenderAdmins] = useState([]);
  const [renderMembers, setRenderMembers] = useState([]);

  useEffect(() => {
    if (appInfo.id) {
      (async () => {
        try {
          const res = await api_getMainAppUsers({ id: appInfo.id });
          if (res.code === 0) {
            setMainUsers(res.data);
            setRenderAdmins(res.data?.admins);
            setRenderMembers(res.data?.members);
          } else {
            message.error(res.message);
          }
        } catch (error) {
          message.error(error.message);
        }
      })();
    }
  }, [appInfo.id]);

  /** 根据角色，添加相应用户 */
  const handleAddPersion = async (items, role) => {
    try {
      const res = await api_addUserGroup({
        id: appInfo.id,
        users: items,
        roleType: role,
      });
      if (res.code === 0) {
        message.success('添加用户成功');
        if (role === mainAdmin) {
          const admins = uniqBy(
            [...mainUsers.admins, ...(res.data?.users || [])],
            (item) => item.username,
          );
          setMainUsers({
            members: mainUsers.members,
            admins,
          });
          setRenderAdmins(admins);
        }
        if (role === mainUser) {
          const members = uniqBy(
            [...mainUsers.members, ...(res.data?.users || [])],
            (item) => item.username,
          );
          setMainUsers({
            members,
            admins: mainUsers.admins,
          });
          setRenderMembers(members);
        }
      } else {
        message.error(res.message);
      }
    } catch (error) {
      message.error(error?.message || '添加失败请重试');
      console.log(error);
    }
  };

  const isAdminRole = role === 'admin';

  /** 根据角色，删除相应用户 */
  const handleRemovePersion = (item, role) => {
    Modal.confirm({
      width: 500,
      title: '确认要删除吗？',
      content: `确定要删除主应用：${appInfo.name}${role === mainAdmin ? '管理员' : '成员'}:${
        item.displayname
      }吗`,
      onOk: async () => {
        try {
          const res = await api_updatePersionGroup({
            id: appInfo.id,
            userid: item.username,
            type: 'remove',
            roleType: role,
          });
          if (res.code === 0) {
            message.success(`成功删除用户${item.displayname}`);
            if (role === mainAdmin) {
              const leftAdmins = mainUsers.admins?.filter?.((u) => u.username !== item.username);
              setMainUsers({
                members: mainUsers.members,
                admins: leftAdmins,
              });
              setRenderAdmins(leftAdmins);
            }
            if (role === mainUser) {
              const leftMembers = mainUsers.members?.filter?.((u) => u.username !== item.username);
              setMainUsers({
                members: leftMembers,
                admins: mainUsers.admins,
              });
              setRenderMembers(leftMembers);
            }
          } else {
            message.error(res.message);
          }
        } catch (error) {
          message.error(error.message);
        }
      },
    });
  };

  const renderItem = (item, role) => (
    <List.Item
      key={item.username}
      actions={[
        <Button type="text" key="remove" onClick={() => handleRemovePersion(item, role)} danger>
          移除
        </Button>,
      ]}
    >
      <List.Item.Meta
        avatar={
          item.avatar ? (
            <Avatar src={item.avatar} />
          ) : (
            <Avatar
              style={{
                color: '#fff',
                backgroundColor: randomColor(),
              }}
            >
              {item.displayname?.slice?.(0, 1)}
            </Avatar>
          )
        }
        description={`${item.displayname}(${item.username})`}
        style={{ alignItems: 'center' }}
      />
    </List.Item>
  );

  const RenderSearch = useCallback(
    (props) => {
      const handleSearch = (e) => {
        const res = (isAdminRole ? mainUsers.admins : mainUsers.members).filter((admin) => {
          const reg = new RegExp(e);
          return reg.test(admin.username) || reg.test(admin.displayname);
        });
        if (isAdminRole) {
          setRenderAdmins(e ? res : mainUsers.admins);
        } else {
          setRenderMembers(e ? res : mainUsers.members);
        }
      };
      return (
        <Search
          placeholder="请输入"
          allowClear
          onSearch={handleSearch}
          style={{ width: 200 }}
          {...props}
        />
      );
    },
    [mainUsers, isAdminRole],
  );

  return (
    <Drawer
      title={`主应用 ${appInfo.name} 权限角色管理`}
      width={600}
      placement="left"
      onClose={onClose}
      visible={visible}
    >
      <Tabs
        accessKey={role}
        onChange={(e) => {
          setRole(e);
          setRenderAdmins(mainUsers.admins);
          setRenderMembers(mainUsers.members);
        }}
        tabBarExtraContent={{
          right: (
            <Button
              onClick={() => {
                isAdminRole ? setAddUserVisible(true) : setAddMemberVisible(true);
              }}
              icon={<PlusOutlined />}
              type="primary"
            >
              {isAdminRole ? '添加管理员' : '添加成员'}
            </Button>
          ),
        }}
      >
        <TabPane
          tab={
            <span style={{ paddingLeft: '8px' }}>
              管理员管理
              <Tooltip title={'有权限管理成员和其他管理员，修改主应用审批人、负责人等'}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          }
          key="admin"
        >
          <div style={{ textAlign: 'right' }}>
            <RenderSearch />
          </div>
          {mainUsers && mainUsers.admins && (
            <List
              split={false}
              itemLayout="horizontal"
              dataSource={renderAdmins}
              renderItem={(item) => renderItem(item, mainAdmin)}
            />
          )}
        </TabPane>
        <TabPane
          tab={
            <span style={{ paddingLeft: '8px' }}>
              成员管理
              <Tooltip
                title={
                  '有权限关联子应用到主应用上，解除关联、修改参数配置、发起上线审批、生效、修改泳道等操作'
                }
              >
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          }
          key="member"
        >
          <div style={{ textAlign: 'right' }}>
            <RenderSearch />
          </div>
          {mainUsers && mainUsers.members && (
            <List
              split={false}
              itemLayout="horizontal"
              dataSource={renderMembers}
              renderItem={(item) => renderItem(item, mainUser)}
            />
          )}
        </TabPane>
      </Tabs>
      <AddUser
        key="admin"
        visible={addUserVisible}
        onOk={async (users) => {
          await handleAddPersion(users, mainAdmin);
          setAddUserVisible(false);
        }}
        onCancel={() => {
          setAddUserVisible(false);
        }}
      />
      <AddUser
        key="member"
        visible={addMemberVisible}
        onOk={async (users) => {
          await handleAddPersion(users, mainUser);
          setAddMemberVisible(false);
        }}
        onCancel={() => {
          setAddMemberVisible(false);
        }}
      />
    </Drawer>
  );
}

export default AccessManagement;
