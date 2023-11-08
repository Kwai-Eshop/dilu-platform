import React, { useMemo, useCallback, useEffect, useState } from 'react';
import type { TableProps } from 'antd';
import { Table, message, Form, Input, Button, Descriptions, Tag, Modal, Tooltip } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { useLocation, useHistory } from 'react-router-dom';
import DebounceSelect from '@/Components/DebounceSelect';
import qs from 'query-string';
import {
  api_getConnectInfo,
  api_getSubAppVersions,
  api_queryStaffInfoByStr,
  api_getChituAppDetail,
  api_updateVersionLane,
} from '@/Apis';
import styles from './index.module.less';
import { BASE_ENV } from '@/Constants';
import dayjs from 'dayjs';
import { debounce } from 'lodash';
import { usePermission } from '@/Hooks/permission';
import type { IEnvInfo, IMainAppInfo, ISubApp, ISubAppVersionModel } from '@/Common/interface';
import type { ColumnsType } from 'antd/es/table';

const pageSize = 10;

function VersionManage() {
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const { search } = useLocation();
  const [searchForm] = Form.useForm();
  const [mainAppInfo, setMainAppInfo] = useState<IMainAppInfo>(Object.create(null));
  const [subAppInfo, setSubAppInfo] = useState<ISubApp>(Object.create(null));
  const [envInfo, setEnvInfo] = useState<IEnvInfo>(Object.create(null));
  const subId = useMemo(() => {
    return qs?.parse(search)?.subId;
  }, [search]) as string;
  const mainId = useMemo(() => {
    return qs?.parse(search)?.mainId;
  }, [search]) as string;
  const envKey = useMemo(() => {
    return qs?.parse(search)?.envKey;
  }, [search]) as string;

  // useEffect(() => {
  //   const getChituMicroDetail = async () => {
  //     await api_getChituAppDetail({
  //       name: subAppInfo.subName,
  //     });
  //   };
  //   if (subAppInfo?.subName) {
  //     getChituMicroDetail();
  //   }
  // }, [subAppInfo]);

  const [versionList, setVersionList] = useState<ISubAppVersionModel[]>([]);
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  const pagination = useMemo(() => {
    return {
      current: pageNo,
      total,
      pageSize,
      showTotal: (num: number) => {
        return `共 ${num} 条`;
      },
    };
  }, [pageNo, total]);

  const { isDeveloper } = usePermission(mainId);
  const [buildOwner, setBuildOwner] = useState(); // 构建人
  const goBack = () => {
    // history.go(-1);
    history.push('/app/sub/list');
  };
  const getConnectInfo = async () => {
    try {
      const res = await api_getConnectInfo({
        mainAppId: mainId,
        subAppId: subId,
        envKey,
      });
      const { env, mainApp, subApp } = res?.data || {};
      setMainAppInfo(mainApp);
      setSubAppInfo(subApp);
      setEnvInfo(env);
    } catch (err) {
      console.error(err);
      message.error(err?.message || '请求失败，请稍后再试~');
    }
  };

  // 搜索构建人
  const handleBuildOwnerSearch = async (nameStr: string) => {
    try {
      const res = await api_queryStaffInfoByStr({ nameStr });
      const list =
        res.data?.map?.((item) => ({
          label: `${item.name}(${item.username})`,
          value: item.username,
          photo: item.photo,
        })) || [];
      return list;
    } catch (e) {
      console.error(e);
      return [];
    }
  };
  const getConnectVersions = useCallback(
    async (pageNum = 1) => {
      try {
        const { lane, buildOwner } = searchForm.getFieldsValue();
        const res = await api_getSubAppVersions({
          pageNo: pageNum,
          pageSize,
          envKey,
          laneId: lane ? lane.trim() : undefined,
          buildOwner: buildOwner ? buildOwner.trim() : undefined,
        });
        const { list, total: totalCount } = res?.data || {};
        setVersionList(list);
        setTotal(totalCount);
        setPageNo(pageNum);
      } catch (err) {
        console.error(err);
        message.error(err?.message || '请求失败，请稍后再试~');
      }
    },
    [searchForm],
  );
  const handleReset = useCallback(() => {
    searchForm.resetFields();
    getConnectVersions(1);
  }, [searchForm]);

  const handleSearch = useCallback(() => {
    getConnectVersions(1);
  }, [getConnectVersions]);
  useEffect(() => {
    getConnectInfo();
    getConnectVersions(1);
  }, []);

  const handleTableChange: TableProps<ISubAppVersionModel>['onChange'] = (pagination) => {
    const { current } = pagination;
    getConnectVersions(current);
  };

  const [laneForm] = Form.useForm();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [laneInfo, setLaneInfo] = useState(Object.create(null));
  const handleCloseModal = useCallback(() => {
    setEditModalVisible(false);
  }, []);
  const handleEdit = useCallback(
    (data: ISubAppVersionModel) => {
      laneForm.setFieldsValue({
        laneId: data.replenish?.laneId,
        versionId: data.id,
      });
      setEditModalVisible(true);
    },
    [laneForm],
  );
  const handleConfirmEdit = async () => {
    try {
      const { objectId } = laneInfo;
      const { laneId, versionId } = laneForm.getFieldsValue();
      setLoading(true);
      await api_updateVersionLane({
        laneId,
        versionId,
      });
      message.success('修改成功');
      getConnectVersions(pageNo);
    } catch (err) {
      console.error(err);
      message.error(err?.message || '请求失败，请稍后再试~');
    } finally {
      setLoading(false);
      setEditModalVisible(false);
    }
  };

  // 表格列
  const columns: ColumnsType<ISubAppVersionModel> = [
    {
      title: '版本ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      align: 'center',
      fixed: 'left',
    },
    {
      title: 'Commit ID（8位）',
      dataIndex: 'commitId',
      key: 'commitId',
      width: 120,
      align: 'center',
      ellipsis: true,
      render: (_, record) => record.buildRecord?.commitId,
    },
    {
      title: '构建分支',
      key: 'buildBranch',
      width: 120,
      align: 'center',
      render: (_, record) => record.buildRecord?.buildBranch,
    },
    {
      title: '构建人',
      key: 'buildOwner',
      width: 120,
      align: 'center',
      render: (_, record) => record.buildRecord?.builder,
    },
    {
      title: 'entry地址',
      dataIndex: 'entry',
      key: 'entry',
      width: 240,
      align: 'center',
      render: (entry) => {
        return (
          <Tooltip title={entry}>
            <a
              href={entry}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-block',
                width: 200,
                wordBreak: 'break-all',
              }}
            >
              {entry.slice(0, 5) + '...' + entry.slice(-20)}
            </a>
          </Tooltip>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      ellipsis: true,
      render: () => '覆盖式生效',
    },
    {
      title: '泳道',
      key: 'laneId',
      width: 180,
      align: 'center',
      render: (_, record) => record.replenish?.laneId,
    },
    {
      title: '构建时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      align: 'center',
      ellipsis: true,
      render: (updatedAt) => {
        return <span>{dayjs(updatedAt)?.format?.('YYYY-MM-DD HH:mm:ss')}</span>;
      },
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      align: 'center',
      render: (_, record) => {
        return (
          <Button type="link" disabled={!isDeveloper} onClick={() => handleEdit(record)}>
            修改泳道
          </Button>
        );
      },
    },
  ];

  return (
    <div className={styles.container}>
      <PageHeader className={styles.header} title="子应用版本管理" onBack={goBack}>
        <Descriptions column={3} className={styles.headerInfo}>
          <Descriptions.Item label="主应用">
            <Tag color="processing">{mainAppInfo?.name || ''}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="主应用环境">
            <Tag color="success">{BASE_ENV[envInfo?.key]?.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="子应用">
            <Tag color="processing">{subAppInfo?.subName || ''}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </PageHeader>
      <div className={styles.body}>
        <Form
          className={styles.searchForm}
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
        >
          <div style={{ display: 'flex', flex: 1 }}>
            <Form.Item name="lane" label="泳道名称">
              <Input placeholder="请输入泳道" allowClear autoComplete="off" />
            </Form.Item>
            <Form.Item name="buildOwner" label="构建人">
              <DebounceSelect
                value={buildOwner}
                showSearch
                allowClear
                placeholder="请选择构建人"
                fetchOptions={handleBuildOwnerSearch}
                style={{ width: '200px' }}
                onChange={(value) => {
                  setBuildOwner(value);
                }}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginRight: '10px' }}>
                查询
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Form.Item>
          </div>
        </Form>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={versionList}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: true }}
        />
      </div>
      <Modal
        title="修改泳道"
        open={editModalVisible}
        cancelText="取消"
        okText="确定"
        onCancel={handleCloseModal}
        footer={[
          <Button key="link" type="primary" onClick={handleCloseModal}>
            取消
          </Button>,
          <Button key="submit" type="primary" loading={loading} onClick={handleConfirmEdit}>
            确定
          </Button>,
        ]}
        onOk={debounce(handleConfirmEdit, 500)}
      >
        <Form form={laneForm}>
          <Form.Item name="versionId" label="版本ID">
            <Input readOnly disabled />
          </Form.Item>
          <Form.Item name="laneId" label="泳道ID">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default React.memo(VersionManage);
