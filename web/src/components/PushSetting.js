import React, { useEffect, useState } from 'react';
import {
  Button,
  Divider,
  Form,
  Grid,
  Header,
  Message,
} from 'semantic-ui-react';
import { API, showError, showSuccess } from '../helpers';

const PushSetting = () => {
  let [inputs, setInputs] = useState({
    id: '',
    username: '',
    channel: '',
    token: '',
    wechat_test_account_id: '',
    wechat_test_account_secret: '',
    wechat_test_account_template_id: '',
    wechat_test_account_open_id: '',
    wechat_test_account_verification_token: '',
    wechat_corp_account_id: '',
    wechat_corp_account_agent_secret: '',
    wechat_corp_account_agent_id: '',
    wechat_corp_account_user_id: '',
    wechat_corp_account_client_type: '',
    lark_webhook_url: '',
    lark_webhook_secret: '',
    ding_webhook_url: '',
    ding_webhook_secret: '',
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
      if (data.wechat_corp_account_client_type === '') {
        data.wechat_corp_account_client_type = 'plugin';
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
      case 'test':
        data.wechat_test_account_id = inputs.wechat_test_account_id;
        data.wechat_test_account_secret = inputs.wechat_test_account_secret;
        data.wechat_test_account_template_id =
          inputs.wechat_test_account_template_id;
        data.wechat_test_account_open_id = inputs.wechat_test_account_open_id;
        data.wechat_test_account_verification_token =
          inputs.wechat_test_account_verification_token;
        break;
      case 'corp':
        data.wechat_corp_account_id = inputs.wechat_corp_account_id;
        data.wechat_corp_account_agent_secret =
          inputs.wechat_corp_account_agent_secret;
        data.wechat_corp_account_agent_id = inputs.wechat_corp_account_agent_id;
        data.wechat_corp_account_user_id = inputs.wechat_corp_account_user_id;
        data.wechat_corp_account_client_type =
          inputs.wechat_corp_account_client_type;
        break;
      case 'lark':
        data.lark_webhook_url = inputs.lark_webhook_url;
        data.lark_webhook_secret = inputs.lark_webhook_secret;
        break;
      case 'ding':
        data.ding_webhook_url = inputs.ding_webhook_url;
        data.ding_webhook_secret = inputs.ding_webhook_secret;
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

  const test = async (type) => {
    let res = await API.get(
      `/push/${inputs.username}?token=${inputs.token}&channel=${type}&title=消息推送服务&description=配置成功！`
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
          <Message>注意：密钥类配置信息不会发送到前端显示。</Message>
          <Form.Group widths={3}>
            <Form.Select
              label='默认推送方式'
              name='channel'
              options={[
                { key: 'email', text: '邮件', value: 'email' },
                { key: 'test', text: '微信测试号', value: 'test' },
                { key: 'corp', text: '企业微信', value: 'corp' },
                { key: 'lark', text: '飞书群机器人', value: 'lark' },
                { key: 'ding', text: '钉钉群机器人', value: 'ding' },
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
          <Divider />
          <Header as='h3'>
            邮箱设置（email）
            <Header.Subheader>通过邮件进行推送</Header.Subheader>
          </Header>
          <Message>
            邮件推送方式（email）需要设置邮箱，请前往个人设置页面绑定邮箱地址。
          </Message>
          <Button onClick={() => test('email')}>测试</Button>
          <Divider />
          <Header as='h3'>
            微信测试号设置（test）
            <Header.Subheader>
              通过微信测试号进行推送，点击前往配置：
              <a
                target='_blank'
                href='https://mp.weixin.qq.com/debug/cgi-bin/sandboxinfo?action=showinfo&t=sandbox/index'
              >
                微信公众平台接口测试帐号
              </a>
            </Header.Subheader>
          </Header>
          <Message>
            接口配置信息中的 URL 填写：
            <code>{`${window.location.origin}/api/wechat_test_account_verification/${inputs.username}`}</code>
            <br />
            Token 填一个随机字符串，然后填入下方的「接口配置验证 Token」中。
          </Message>
          <Form.Group widths={3}>
            <Form.Input
              label='测试号 ID'
              name='wechat_test_account_id'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.wechat_test_account_id}
              placeholder='测试号信息 -> appID'
            />
            <Form.Input
              label='测试号密钥'
              name='wechat_test_account_secret'
              type='password'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.wechat_test_account_secret}
              placeholder='测试号信息 -> appsecret'
            />
            <Form.Input
              label='测试模板 ID'
              name='wechat_test_account_template_id'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.wechat_test_account_template_id}
              placeholder='模板消息接口 -> 模板 ID'
            />
          </Form.Group>
          <Form.Group widths={3}>
            <Form.Input
              label='用户 Open ID'
              name='wechat_test_account_open_id'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.wechat_test_account_open_id}
              placeholder='测试号二维码 -> 用户列表 -> 微信号'
            />
            <Form.Input
              label='接口配置验证 Token'
              name='wechat_test_account_verification_token'
              onChange={handleInputChange}
              autoComplete='off'
              type='password'
              value={inputs.wechat_test_account_verification_token}
              placeholder='接口配置信息 -> Token'
            />
          </Form.Group>
          <Button onClick={() => submit('test')} loading={loading}>
            保存
          </Button>
          <Button onClick={() => test('test')}>测试</Button>
          <Divider />
          <Header as='h3'>
            企业微信设置（corp）
            <Header.Subheader>
              通过企业微信进行推送，点击前往配置：
              <a
                target='_blank'
                href='https://work.weixin.qq.com/wework_admin/frame#apps'
              >
                企业微信应用管理
              </a>
            </Header.Subheader>
          </Header>
          <Form.Group widths={3}>
            <Form.Input
              label='企业 ID'
              name='wechat_corp_account_id'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.wechat_corp_account_id}
              placeholder='我的企业 -> 企业信息 -> 企业 ID'
            />
            <Form.Input
              label='应用 AgentId'
              name='wechat_corp_account_agent_id'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.wechat_corp_account_agent_id}
              placeholder='应用管理 -> 自建 -> 创建应用 -> AgentId'
            />
            <Form.Input
              label='应用 Secret'
              name='wechat_corp_account_agent_secret'
              type='password'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.wechat_corp_account_agent_secret}
              placeholder='应用管理 -> 自建 -> 创建应用 -> Secret'
            />
          </Form.Group>
          <Form.Group widths={3}>
            <Form.Input
              label='用户账号'
              name='wechat_corp_account_user_id'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.wechat_corp_account_user_id}
              placeholder='通讯录 -> 点击姓名 -> 账号'
            />
            <Form.Select
              label='微信企业号客户端类型'
              name='wechat_corp_account_client_type'
              options={[
                {
                  key: 'plugin',
                  text: '微信中的企业微信插件',
                  value: 'plugin',
                },
                { key: 'app', text: '企业微信 APP', value: 'app' },
              ]}
              value={inputs.wechat_corp_account_client_type}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Button onClick={() => submit('corp')} loading={loading}>
            保存
          </Button>
          <Button onClick={() => test('corp')}>测试</Button>
          <Divider />
          <Header as='h3'>
            飞书设置（lark）
            <Header.Subheader>
              通过飞书群机器人进行推送，选择一个群聊 -> 设置 -> 群机器人 ->
              添加机器人 -> 自定义机器人 -> 添加（
              <strong>注意选中「签名校验」</strong>）。具体参见：
              <a
                target='_blank'
                href='https://open.feishu.cn/document/ukTMukTMukTM/ucTM5YjL3ETO24yNxkjN'
              >
                飞书开放文档
              </a>
            </Header.Subheader>
          </Header>
          <Form.Group widths={2}>
            <Form.Input
              label='Webhook 地址'
              name='lark_webhook_url'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.lark_webhook_url}
              placeholder='在此填写飞书提供的 Webhook 地址'
            />
            <Form.Input
              label='签名校验密钥'
              name='lark_webhook_secret'
              type='password'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.lark_webhook_secret}
              placeholder='在此填写飞书提供的签名校验密钥'
            />
          </Form.Group>
          <Button onClick={() => submit('lark')} loading={loading}>
            保存
          </Button>
          <Button onClick={() => test('lark')}>测试</Button>
          <Divider />
          <Header as='h3'>
            钉钉设置（ding）
            <Header.Subheader>
              通过钉钉机器人进行推送，选择一个群聊 -> 群设置 -> 智能群助手 ->
              添加机器人（点击右侧齿轮图标） -> 自定义 -> 添加（
              <strong>注意选中「加密」</strong>）。具体参见：
              <a
                target='_blank'
                href='https://open.dingtalk.com/document/robots/custom-robot-access'
              >
                钉钉开放文档
              </a>
            </Header.Subheader>
          </Header>
          <Form.Group widths={2}>
            <Form.Input
              label='Webhook 地址'
              name='ding_webhook_url'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.ding_webhook_url}
              placeholder='在此填写钉钉提供的 Webhook 地址'
            />
            <Form.Input
              label='签名校验密钥'
              name='ding_webhook_secret'
              type='password'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.ding_webhook_secret}
              placeholder='在此填写钉钉提供的签名校验密钥'
            />
          </Form.Group>
          <Button onClick={() => submit('ding')} loading={loading}>
            保存
          </Button>
          <Button onClick={() => test('ding')}>测试</Button>
        </Form>
      </Grid.Column>
    </Grid>
  );
};

export default PushSetting;
