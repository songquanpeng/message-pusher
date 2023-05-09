import React, { useEffect, useState } from 'react';
import { Button, Form, Grid, Header, Message } from 'semantic-ui-react';
import { API, showError, showSuccess, testChannel } from '../helpers';
import { loadUser, loadUserChannels } from '../helpers/loader';

const PushSetting = () => {
  let [user, setUser] = useState({
    id: '',
    username: '',
    channel: '',
    token: '',
  });
  let [channels, setChannels] = useState([]);
  let [loading, setLoading] = useState(false);

  const handleInputChange = (e, { name, value }) => {
    setUser((inputs) => ({ ...inputs, [name]: value }));
  };

  useEffect(() => {
    const loader = async () => {
      let user = await loadUser();
      if (user) {
        setUser(user);
      }
      let channels = await loadUserChannels();
      if (channels) {
        setChannels(channels);
      }
      setLoading(false);
    };
    loader().then();
  }, []);

  const submit = async (which) => {
    let data = {};
    switch (which) {
      case 'general':
        data.channel = user.channel;
        data.token = user.token;
        if (data.token === '') {
          data.token = ' ';
        }
        break;
      default:
        showError(`无效的参数：${which}`);
        return;
    }
    let res = await API.put(`/api/user/self`, data);
    const { success, message } = res.data;
    if (success) {
      showSuccess('设置已更新！');
    } else {
      showError(message);
    }
  };

  return (
    <Grid columns={1}>
      <Grid.Column>
        <Form loading={loading}>
          <Header as='h3'>通用设置</Header>
          <Message>
            注意：敏感配置信息不会发送到前端显示。另外浏览器可能会错误填充账户和密钥信息，请留意。
          </Message>
          <Form.Group widths={3}>
            <Form.Select
              label='默认推送方式'
              name='channel'
              options={channels}
              value={user.channel}
              onChange={handleInputChange}
            />
            <Form.Input
              label='推送 token'
              placeholder='未设置则不检查 token'
              value={user.token}
              name='token'
              onChange={handleInputChange}
            />
          </Form.Group>
          <Button onClick={() => submit('general')} loading={loading}>
            保存
          </Button>
          <Button onClick={() => testChannel(user.username, user.token, '')}>
            测试
          </Button>
        </Form>
      </Grid.Column>
    </Grid>
  );
};

export default PushSetting;
