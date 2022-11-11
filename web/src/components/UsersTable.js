import React, { useEffect, useState } from 'react';
import { Button, Form, Label, Pagination, Table } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { API, showError, showSuccess } from '../helpers';

const itemsPerPage = 10;

function renderRole(role) {
  switch (role) {
    case 1:
      return <Label>普通用户</Label>;
    case 10:
      return <Label color="yellow">管理员</Label>;
    case 100:
      return <Label color="orange">超级管理员</Label>;
    default:
      return <Label color="red">未知身份</Label>;
  }
}

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searching, setSearching] = useState(false);

  const loadUsers = async () => {
    const res = await API.get('/api/user');
    const { success, message, data } = res.data;
    if (success) {
      setUsers(data);
    } else {
      showError(message);
    }
    setLoading(false);
  };

  const onPaginationChange = (e, { activePage }) => {
    setActivePage(activePage);
  };

  useEffect(() => {
    loadUsers()
      .then()
      .catch((reason) => {
        showError(reason);
      });
  }, []);

  const manageUser = (username, action) => {
    (async () => {
      const res = await API.post('/api/user/manage', {
        username,
        action,
      });
      const { success, message } = res.data;
      if (success) {
        showSuccess('操作成功完成！');
        await loadUsers();
      } else {
        showError(message);
      }
    })();
  };

  const renderStatus = (status, id) => {
    switch (status) {
      case 1:
        return '已激活';
      case 2:
        return '已封禁';
      default:
        return '未知状态';
    }
  };

  const searchUsers = async () => {
    setSearching(true);
    const res = await API.get(`/api/user/search?keyword=${searchKeyword}`);
    const { success, message, data } = res.data;
    if (success) {
      setUsers(data);
    } else {
      showError(message);
    }
    setSearching(false);
  };

  const handleKeywordChange = async (e, { name, value }) => {
    setSearchKeyword(value);
  };

  const sortUser = (key) => {
    if (users.length === 0) return;
    setLoading(true);
    let sortedUsers = [...users];
    sortedUsers.sort((a, b) => {
      return ('' + a[key]).localeCompare(b[key]);
    });
    if (sortedUsers[0].id === users[0].id) {
      sortedUsers.reverse();
    }
    setUsers(sortedUsers);
    setLoading(false);
  };

  return (
    <>
      <Form onSubmit={searchUsers}>
        <Form.Input
          icon="search"
          fluid
          iconPosition="left"
          placeholder="搜索用户的 ID，用户名，显示名称，以及邮箱地址 ..."
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
                sortUser('username');
              }}
            >
              用户名
            </Table.HeaderCell>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortUser('display_name');
              }}
            >
              显示名称
            </Table.HeaderCell>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortUser('email');
              }}
            >
              邮箱地址
            </Table.HeaderCell>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortUser('role');
              }}
            >
              用户角色
            </Table.HeaderCell>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortUser('status');
              }}
            >
              状态
            </Table.HeaderCell>
            <Table.HeaderCell>操作</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {users
            .slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage)
            .map((user, idx) => {
              return (
                <Table.Row key={user.id}>
                  <Table.Cell>{user.username}</Table.Cell>
                  <Table.Cell>{user.display_name}</Table.Cell>
                  <Table.Cell>{user.email ? user.email : '无'}</Table.Cell>
                  <Table.Cell>{renderRole(user.role)}</Table.Cell>
                  <Table.Cell>{renderStatus(user.status, user.id)}</Table.Cell>
                  <Table.Cell>
                    <div>
                      <Button
                        size={'small'}
                        positive
                        onClick={() => {
                          manageUser(user.username, 'promote');
                        }}
                      >
                        提升
                      </Button>
                      <Button
                        size={'small'}
                        color={'yellow'}
                        onClick={() => {
                          manageUser(user.username, 'demote');
                        }}
                      >
                        降级
                      </Button>
                      <Button
                        size={'small'}
                        negative
                        onClick={() => {
                          manageUser(user.username, 'delete');
                        }}
                      >
                        删除
                      </Button>
                      <Button
                        size={'small'}
                        onClick={() => {
                          manageUser(
                            user.username,
                            user.status === 1 ? 'disable' : 'enable'
                          );
                        }}
                      >
                        {user.status === 1 ? '禁用' : '启用'}
                      </Button>
                      <Button
                        size={'small'}
                        as={Link}
                        to={'/user/edit/' + user.id}
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
            <Table.HeaderCell colSpan="6">
              <Button size="small" as={Link} to="/user/add" loading={loading}>
                添加新的用户
              </Button>
              <Pagination
                floated="right"
                activePage={activePage}
                onPageChange={onPaginationChange}
                size="small"
                siblingRange={1}
                totalPages={Math.ceil(users.length / itemsPerPage)}
              />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    </>
  );
};

export default UsersTable;
