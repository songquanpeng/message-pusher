import React, { useEffect, useState } from 'react';
import { Button, Form, Label, Pagination, Table } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { API, showError, showSuccess } from '../helpers';

import { ITEMS_PER_PAGE } from '../constants';
import { renderChannel, renderTimestamp } from '../helpers/render';

const ChannelsTable = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searching, setSearching] = useState(false);
  const [user, setUser] = useState({ username: '', token: '' });

  const loadChannels = async (startIdx) => {
    const res = await API.get(`/api/channel/?p=${startIdx}`);
    const { success, message, data } = res.data;
    if (success) {
      if (startIdx === 0) {
        setChannels(data);
      } else {
        let newChannels = channels;
        newChannels.push(...data);
        setChannels(newChannels);
      }
    } else {
      showError(message);
    }
    setLoading(false);
  };

  const onPaginationChange = (e, { activePage }) => {
    (async () => {
      if (activePage === Math.ceil(channels.length / ITEMS_PER_PAGE) + 1) {
        // In this case we have to load more data and then append them.
        await loadChannels(activePage - 1);
      }
      setActivePage(activePage);
    })();
  };

  useEffect(() => {
    loadChannels(0)
      .then()
      .catch((reason) => {
        showError(reason);
      });
    loadUser()
      .then()
      .catch((reason) => {
        showError(reason);
      });
  }, []);

  const manageChannel = async (id, action, idx) => {
    let data = { id };
    let res;
    switch (action) {
      case 'delete':
        res = await API.delete(`/api/channel/${id}/`);
        break;
      case 'enable':
        data.status = 1;
        res = await API.put('/api/channel/?status_only=true', data);
        break;
      case 'disable':
        data.status = 2;
        res = await API.put('/api/channel/?status_only=true', data);
        break;
    }
    const { success, message } = res.data;
    if (success) {
      showSuccess('操作成功完成！');
      let channel = res.data.data;
      let newChannels = [...channels];
      let realIdx = (activePage - 1) * ITEMS_PER_PAGE + idx;
      if (action === 'delete') {
        newChannels[realIdx].deleted = true;
      } else {
        newChannels[realIdx].status = channel.status;
      }
      setChannels(newChannels);
    } else {
      showError(message);
    }
  };

  const renderStatus = (status) => {
    switch (status) {
      case 1:
        return <Label basic>已启用</Label>;
      case 2:
        return (
          <Label basic color='red'>
            已禁用
          </Label>
        );
      default:
        return (
          <Label basic color='grey'>
            未知状态
          </Label>
        );
    }
  };

  const searchChannels = async () => {
    if (searchKeyword === '') {
      // if keyword is blank, load files instead.
      await loadChannels(0);
      setActivePage(1);
      return;
    }
    setSearching(true);
    const res = await API.get(`/api/channel/search?keyword=${searchKeyword}`);
    const { success, message, data } = res.data;
    if (success) {
      setChannels(data);
      setActivePage(1);
    } else {
      showError(message);
    }
    setSearching(false);
  };

  const handleKeywordChange = async (e, { value }) => {
    setSearchKeyword(value.trim());
  };

  const sortChannel = (key) => {
    if (channels.length === 0) return;
    setLoading(true);
    let sortedChannels = [...channels];
    sortedChannels.sort((a, b) => {
      return ('' + a[key]).localeCompare(b[key]);
    });
    if (sortedChannels[0].id === channels[0].id) {
      sortedChannels.reverse();
    }
    setChannels(sortedChannels);
    setLoading(false);
  };

  const loadUser = async () => {
    let res = await API.get(`/api/user/self`);
    const { success, message, data } = res.data;
    if (success) {
      setUser(data);
    } else {
      showError(message);
    }
    setLoading(false);
  };

  const test = async (channel) => {
    let res = await API.get(
      `/push/${user.username}?token=${user.token}&channel=${channel}&title=消息推送服务&description=配置成功！`
    );
    const { success, message } = res.data;
    if (success) {
      showSuccess('测试消息已发送');
    } else {
      showError(message);
    }
  };

  return (
    <>
      <Form onSubmit={searchChannels}>
        <Form.Input
          icon='search'
          fluid
          iconPosition='left'
          placeholder='搜索通道的 ID 或名称 ...'
          value={searchKeyword}
          loading={searching}
          onChange={handleKeywordChange}
        />
      </Form>

      <Table basic>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortChannel('id');
              }}
            >
              ID
            </Table.HeaderCell>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortChannel('name');
              }}
            >
              名称
            </Table.HeaderCell>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortChannel('description');
              }}
            >
              备注
            </Table.HeaderCell>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortChannel('type');
              }}
            >
              类型
            </Table.HeaderCell>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortChannel('status');
              }}
            >
              状态
            </Table.HeaderCell>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortChannel('created_time');
              }}
            >
              创建时间
            </Table.HeaderCell>
            <Table.HeaderCell>操作</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {channels
            .slice(
              (activePage - 1) * ITEMS_PER_PAGE,
              activePage * ITEMS_PER_PAGE
            )
            .map((channel, idx) => {
              if (channel.deleted) return <></>;
              return (
                <Table.Row key={channel.id}>
                  <Table.Cell>{channel.id}</Table.Cell>
                  <Table.Cell>{channel.name}</Table.Cell>
                  <Table.Cell>
                    {channel.description ? channel.description : '无备注信息'}
                  </Table.Cell>
                  <Table.Cell>{renderChannel(channel.type)}</Table.Cell>
                  <Table.Cell>{renderStatus(channel.status)}</Table.Cell>
                  <Table.Cell>
                    {renderTimestamp(channel.created_time)}
                  </Table.Cell>
                  <Table.Cell>
                    <div>
                      <Button
                        size={'small'}
                        negative
                        onClick={() => {
                          manageChannel(channel.id, 'delete', idx).then();
                        }}
                      >
                        删除
                      </Button>
                      <Button
                        size={'small'}
                        onClick={() => {
                          test(channel.name).then();
                        }}
                      >
                        测试
                      </Button>
                      <Button
                        size={'small'}
                        onClick={() => {
                          manageChannel(
                            channel.id,
                            channel.status === 1 ? 'disable' : 'enable',
                            idx
                          ).then();
                        }}
                      >
                        {channel.status === 1 ? '禁用' : '启用'}
                      </Button>
                      <Button
                        size={'small'}
                        as={Link}
                        to={'/channel/edit/' + channel.id}
                      >
                        编辑
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              );
            })}
        </Table.Body>

        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan='7'>
              <Button
                size='small'
                as={Link}
                to='/channel/add'
                loading={loading}
              >
                添加新的通道
              </Button>
              <Pagination
                floated='right'
                activePage={activePage}
                onPageChange={onPaginationChange}
                size='small'
                siblingRange={1}
                totalPages={
                  Math.ceil(channels.length / ITEMS_PER_PAGE) +
                  (channels.length % ITEMS_PER_PAGE === 0 ? 1 : 0)
                }
              />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    </>
  );
};

export default ChannelsTable;
