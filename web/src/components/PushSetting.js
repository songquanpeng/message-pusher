import React, { useEffect, useState } from 'react';
import { Button, Form, Grid, Header, Message } from 'semantic-ui-react';
import { API, showError, showSuccess } from '../helpers';

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

  const loadUser = async () => {
    let res = await API.get(`/api/user/self`);
    const { success, message, data } = res.data;
    if (success) {
      if (data.channel === '') {
        data.channel = 'email';
      }
      if (data.token === ' ') {
        data.token = '';
      }
      setUser(data);
    } else {
      showError(message);
    }
    setLoading(false);
  };

  const loadUserChannels = async () => {
    let res = await API.get(`/api/channel?brief=true`);
    const { success, message, data } = res.data;
    if (success) {
      data.forEach((channel) => {
        channel.key = channel.name;
        channel.text = channel.name;
        channel.value = channel.name;
        if (channel.description === '') {
          channel.description = '无备注信息';
        }
      });
      setChannels(data);
    } else {
      showError(message);
    }
  };

  useEffect(() => {
    loadUser().then();
    loadUserChannels().then();
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

  const test = async () => {
    let res = await API.get(
      `/push/${user.username}?token=${user.token}&channel=${user.channel}&title=消息推送服务&description=配置成功！`
    );
    const { success, message } = res.data;
    if (success) {
      showSuccess('测试消息已发送');
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
          <Button onClick={() => test('')}>测试</Button>
        </Form>
      </Grid.Column>
    </Grid>
  );
};

export default PushSetting;
