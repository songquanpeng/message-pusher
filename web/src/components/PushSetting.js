import React, { useEffect, useState } from 'react';
import { Button, Form, Grid, Header, Message } from 'semantic-ui-react';
import { API, showError, showSuccess } from '../helpers';

const PushSetting = () => {
  let [inputs, setInputs] = useState({
    id: '',
    username: '',
    channel: '',
    token: '',
  });
  let [loading, setLoading] = useState(false);

  const handleInputChange = (e, { name, value }) => {
    setInputs((inputs) => ({ ...inputs, [name]: value }));
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
      setInputs(data);
    } else {
      showError(message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUser().then();
  }, []);

  const submit = async (which) => {
    let data = {};
    switch (which) {
      case 'general':
        data.channel = inputs.channel;
        data.token = inputs.token;
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
      `/push/${inputs.username}?token=${inputs.token}&channel=${inputs.channel}&title=消息推送服务&description=配置成功！`
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
              options={[
                { key: 'email', text: '邮件', value: 'email' },
                { key: 'test', text: '微信测试号', value: 'test' },
                { key: 'corp_app', text: '企业微信应用号', value: 'corp_app' },
                { key: 'corp', text: '企业微信群机器人', value: 'corp' },
                { key: 'lark', text: '飞书群机器人', value: 'lark' },
                { key: 'ding', text: '钉钉群机器人', value: 'ding' },
                { key: 'bark', text: 'Bark App', value: 'bark' },
                { key: 'client', text: 'WebSocket 客户端', value: 'client' },
                { key: 'telegram', text: 'Telegram 机器人', value: 'telegram' },
                { key: 'discord', text: 'Discord 群机器人', value: 'discord' },
              ]}
              value={inputs.channel}
              onChange={handleInputChange}
            />
            <Form.Input
              label='推送 token'
              placeholder='未设置则不检查 token'
              value={inputs.token}
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
