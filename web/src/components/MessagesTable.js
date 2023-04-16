import React, { useEffect, useState } from 'react';
import { Button, Form, Label, Pagination, Table } from 'semantic-ui-react';
import { API, showError } from '../helpers';

import { ITEMS_PER_PAGE } from '../constants';

function renderChannel(channel) {
  switch (channel) {
    case 'email':
      return <Label color='green'>邮件</Label>;
    case 'test':
      return (
        <Label style={{ backgroundColor: '#2cbb00', color: 'white' }}>
          微信测试号
        </Label>
      );
    case 'corp_app':
      return (
        <Label style={{ backgroundColor: '#5fc9ec', color: 'white' }}>
          企业微信应用号
        </Label>
      );
    case 'corp':
      return (
        <Label style={{ backgroundColor: '#019d82', color: 'white' }}>
          企业微信群机器人
        </Label>
      );
    case 'lark':
      return (
        <Label style={{ backgroundColor: '#00d6b9', color: 'white' }}>
          飞书群机器人
        </Label>
      );
    case 'ding':
      return (
        <Label style={{ backgroundColor: '#007fff', color: 'white' }}>
          钉钉群机器人
        </Label>
      );
    case 'bark':
      return (
        <Label style={{ backgroundColor: '#ff3b30', color: 'white' }}>
          Bark App
        </Label>
      );
    case 'client':
      return (
        <Label style={{ backgroundColor: '#121212', color: 'white' }}>
          WebSocket 客户端
        </Label>
      );
    case 'telegram':
      return (
        <Label style={{ backgroundColor: '#29a9ea', color: 'white' }}>
          Telegram 机器人
        </Label>
      );
    case 'discord':
      return (
        <Label style={{ backgroundColor: '#404eed', color: 'white' }}>
          Discord 群机器人
        </Label>
      );
    case 'none':
      return <Label>无</Label>;
    default:
      return <Label color='grey'>未知通道</Label>;
  }
}

function renderTimestamp(timestamp) {
  const date = new Date(timestamp * 1000);
  return (
    <>
      {date.getFullYear()}-{date.getMonth() + 1}-{date.getDate()}{' '}
      {date.getHours()}:{date.getMinutes()}:{date.getSeconds()}
    </>
  );
}

function renderStatus(status) {
  switch (status) {
    case 1:
      return (
        <Label basic color='olive'>
          投递中...
        </Label>
      );
    case 2:
      return (
        <Label basic color='green'>
          发送成功
        </Label>
      );
    case 3:
      return (
        <Label basic color='red'>
          发送失败
        </Label>
      );
    default:
      return (
        <Label basic color='grey'>
          未知状态
        </Label>
      );
  }
}

const MessagesTable = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searching, setSearching] = useState(false);

  const loadMessages = async (startIdx) => {
    const res = await API.get(`/api/message/?p=${startIdx}`);
    const { success, message, data } = res.data;
    if (success) {
      if (startIdx === 0) {
        setMessages(data);
      } else {
        let newMessages = messages;
        newMessages.push(...data);
        setMessages(newMessages);
      }
    } else {
      showError(message);
    }
    setLoading(false);
  };

  const onPaginationChange = (e, { activePage }) => {
    (async () => {
      if (activePage === Math.ceil(messages.length / ITEMS_PER_PAGE) + 1) {
        // In this case we have to load more data and then append them.
        await loadMessages(activePage - 1);
      }
      setActivePage(activePage);
    })();
  };

  useEffect(() => {
    // TODO: Prompt the user if message persistence is disabled
    // TODO: Allow set persistence permission for each user
    loadMessages(0)
      .then()
      .catch((reason) => {
        showError(reason);
      });
  }, []);

  const viewMessage = (id) => {
    // TODO: Implement viewMessage
    console.log('viewMessage', id);
  };

  const resendMessage = (id) => {
    // TODO: Implement resendMessage
    console.log('resendMessage', id);
  };

  const deleteMessage = (id) => {
    // TODO: Implement deleteMessage
    console.log('deleteMessage', id);
  };

  const searchMessages = async () => {
    if (searchKeyword === '') {
      // if keyword is blank, load files instead.
      await loadMessages(0);
      setActivePage(1);
      return;
    }
    setSearching(true);
    const res = await API.get(`/api/message/search?keyword=${searchKeyword}`);
    const { success, message, data } = res.data;
    if (success) {
      setMessages(data);
      setActivePage(1);
    } else {
      showError(message);
    }
    setSearching(false);
  };

  const handleKeywordChange = async (e, { value }) => {
    setSearchKeyword(value.trim());
  };

  const sortMessage = (key) => {
    if (messages.length === 0) return;
    setLoading(true);
    let sortedMessages = [...messages];
    sortedMessages.sort((a, b) => {
      return ('' + a[key]).localeCompare(b[key]);
    });
    if (sortedMessages[0].id === messages[0].id) {
      sortedMessages.reverse();
    }
    setMessages(sortedMessages);
    setLoading(false);
  };

  return (
    <>
      <Form onSubmit={searchMessages}>
        <Form.Input
          icon='search'
          fluid
          iconPosition='left'
          placeholder='搜索消息的 ID，标题，通道，以及发送状态 ...'
          value={searchKeyword}
          loading={searching}
          onChange={handleKeywordChange}
        />
      </Form>
      <Table basic loading={loading}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortMessage('id');
              }}
            >
              消息 ID
            </Table.HeaderCell>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortMessage('title');
              }}
            >
              标题
            </Table.HeaderCell>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortMessage('channel');
              }}
            >
              通道
            </Table.HeaderCell>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortMessage('timestamp');
              }}
            >
              发送时间
            </Table.HeaderCell>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortMessage('status');
              }}
            >
              状态
            </Table.HeaderCell>
            <Table.HeaderCell>操作</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {messages
            .slice(
              (activePage - 1) * ITEMS_PER_PAGE,
              activePage * ITEMS_PER_PAGE
            )
            .map((message, idx) => {
              if (message.deleted) return <></>;
              return (
                <Table.Row key={message.id}>
                  <Table.Cell>{'#' + message.id}</Table.Cell>
                  <Table.Cell>
                    {message.title ? message.title : '无标题'}
                  </Table.Cell>
                  <Table.Cell>{renderChannel(message.channel)}</Table.Cell>
                  <Table.Cell>{renderTimestamp(message.timestamp)}</Table.Cell>
                  <Table.Cell>{renderStatus(message.status)}</Table.Cell>
                  <Table.Cell>
                    <div>
                      <Button
                        size={'small'}
                        positive
                        onClick={() => {
                          viewMessage(message.id);
                        }}
                      >
                        查看
                      </Button>
                      <Button
                        size={'small'}
                        color={'yellow'}
                        onClick={() => {
                          resendMessage(message.id);
                        }}
                      >
                        重发
                      </Button>
                      <Button
                        size={'small'}
                        negative
                        onClick={() => {
                          deleteMessage(message.id);
                        }}
                      >
                        删除
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              );
            })}
        </Table.Body>

        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan='6'>
              <Pagination
                floated='right'
                activePage={activePage}
                onPageChange={onPaginationChange}
                size='small'
                siblingRange={1}
                totalPages={
                  Math.ceil(messages.length / ITEMS_PER_PAGE) +
                  (messages.length % ITEMS_PER_PAGE === 0 ? 1 : 0)
                }
              />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    </>
  );
};

export default MessagesTable;
