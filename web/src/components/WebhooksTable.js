import React, { useEffect, useState } from 'react';
import { Button, Form, Label, Pagination, Table } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { API, copy, showError, showSuccess, showWarning } from '../helpers';

import { ITEMS_PER_PAGE } from '../constants';
import { renderTimestamp } from '../helpers/render';

const WebhooksTable = () => {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searching, setSearching] = useState(false);
  const [user, setUser] = useState({ username: '', token: '' });

  const loadWebhooks = async (startIdx) => {
    const res = await API.get(`/api/webhook/?p=${startIdx}`);
    const { success, message, data } = res.data;
    if (success) {
      if (startIdx === 0) {
        setWebhooks(data);
      } else {
        let newWebhooks = webhooks;
        newWebhooks.push(...data);
        setWebhooks(newWebhooks);
      }
    } else {
      showError(message);
    }
    setLoading(false);
  };

  const onPaginationChange = (e, { activePage }) => {
    (async () => {
      if (activePage === Math.ceil(webhooks.length / ITEMS_PER_PAGE) + 1) {
        // In this case we have to load more data and then append them.
        await loadWebhooks(activePage - 1);
      }
      setActivePage(activePage);
    })();
  };

  useEffect(() => {
    loadWebhooks(0)
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

  const manageWebhook = async (id, action, idx) => {
    let data = { id };
    let res;
    switch (action) {
      case 'delete':
        res = await API.delete(`/api/webhook/${id}/`);
        break;
      case 'enable':
        data.status = 1;
        res = await API.put('/api/webhook/?status_only=true', data);
        break;
      case 'disable':
        data.status = 2;
        res = await API.put('/api/webhook/?status_only=true', data);
        break;
    }
    const { success, message } = res.data;
    if (success) {
      showSuccess('操作成功完成！');
      let webhook = res.data.data;
      let newWebhooks = [...webhooks];
      let realIdx = (activePage - 1) * ITEMS_PER_PAGE + idx;
      if (action === 'delete') {
        newWebhooks[realIdx].deleted = true;
      } else {
        newWebhooks[realIdx].status = webhook.status;
      }
      setWebhooks(newWebhooks);
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

  const searchWebhooks = async () => {
    if (searchKeyword === '') {
      // if keyword is blank, load files instead.
      await loadWebhooks(0);
      setActivePage(1);
      return;
    }
    setSearching(true);
    const res = await API.get(`/api/webhook/search?keyword=${searchKeyword}`);
    const { success, message, data } = res.data;
    if (success) {
      setWebhooks(data);
      setActivePage(1);
    } else {
      showError(message);
    }
    setSearching(false);
  };

  const handleKeywordChange = async (e, { value }) => {
    setSearchKeyword(value.trim());
  };

  const sortWebhook = (key) => {
    if (webhooks.length === 0) return;
    setLoading(true);
    let sortedWebhooks = [...webhooks];
    sortedWebhooks.sort((a, b) => {
      return ('' + a[key]).localeCompare(b[key]);
    });
    if (sortedWebhooks[0].id === webhooks[0].id) {
      sortedWebhooks.reverse();
    }
    setWebhooks(sortedWebhooks);
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

  return (
    <>
      <Form onSubmit={searchWebhooks}>
        <Form.Input
          icon='search'
          fluid
          iconPosition='left'
          placeholder='搜索接口的 ID，链接或名称 ...'
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
                sortWebhook('id');
              }}
            >
              ID
            </Table.HeaderCell>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortWebhook('name');
              }}
            >
              名称
            </Table.HeaderCell>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortWebhook('status');
              }}
            >
              状态
            </Table.HeaderCell>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortWebhook('channel');
              }}
            >
              通道
            </Table.HeaderCell>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortWebhook('created_time');
              }}
            >
              创建时间
            </Table.HeaderCell>
            <Table.HeaderCell>操作</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {webhooks
            .slice(
              (activePage - 1) * ITEMS_PER_PAGE,
              activePage * ITEMS_PER_PAGE
            )
            .map((webhook, idx) => {
              if (webhook.deleted) return <></>;
              return (
                <Table.Row key={webhook.id}>
                  <Table.Cell>{webhook.id}</Table.Cell>
                  <Table.Cell>{webhook.name}</Table.Cell>
                  <Table.Cell>{renderStatus(webhook.status)}</Table.Cell>
                  <Table.Cell>
                    <Label>
                      {webhook.channel ? webhook.channel : '默认通道'}
                    </Label>
                  </Table.Cell>
                  <Table.Cell>
                    {renderTimestamp(webhook.created_time)}
                  </Table.Cell>
                  <Table.Cell>
                    <div>
                      <Button
                        size={'small'}
                        positive
                        onClick={async () => {
                          if (
                            await copy(
                              `${window.location.origin}/webhook/${webhook.link}`
                            )
                          ) {
                            showSuccess('已复制到剪贴板！');
                          } else {
                            showWarning('无法复制到剪贴板！');
                          }
                        }}
                      >
                        复制 Webhook 链接
                      </Button>
                      <Button
                        size={'small'}
                        negative
                        onClick={() => {
                          manageWebhook(webhook.id, 'delete', idx).then();
                        }}
                      >
                        删除
                      </Button>
                      <Button
                        size={'small'}
                        onClick={() => {
                          manageWebhook(
                            webhook.id,
                            webhook.status === 1 ? 'disable' : 'enable',
                            idx
                          ).then();
                        }}
                      >
                        {webhook.status === 1 ? '禁用' : '启用'}
                      </Button>
                      <Button
                        size={'small'}
                        as={Link}
                        to={'/webhook/edit/' + webhook.id}
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
                to='/webhook/add'
                loading={loading}
              >
                添加新的接口
              </Button>
              <Pagination
                floated='right'
                activePage={activePage}
                onPageChange={onPaginationChange}
                size='small'
                siblingRange={1}
                totalPages={
                  Math.ceil(webhooks.length / ITEMS_PER_PAGE) +
                  (webhooks.length % ITEMS_PER_PAGE === 0 ? 1 : 0)
                }
              />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    </>
  );
};

export default WebhooksTable;
