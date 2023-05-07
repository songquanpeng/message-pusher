import React, { useEffect, useState } from 'react';
import { Button, Form, Header, Message, Segment } from 'semantic-ui-react';
import { useParams } from 'react-router-dom';
import { API, showError, showSuccess } from '../../helpers';
import { CHANNEL_OPTIONS } from '../../constants';
import axios from 'axios';

const EditChannel = () => {
  const params = useParams();
  const channelId = params.id;
  const isEditing = channelId !== undefined;
  const [loading, setLoading] = useState(isEditing);
  const originInputs = {
    type: 'none',
    name: '',
    description: '',
    secret: '',
    app_id: '',
    account_id: '',
    url: '',
    other: '',
    corp_id: '', // only for corp_app
    agent_id: '' // only for corp_app
  };

  const [inputs, setInputs] = useState(originInputs);
  const { type, name, description, secret, app_id, account_id, url, other } =
    inputs;

  const handleInputChange = (e, { name, value }) => {
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  };

  const loadChannel = async () => {
    let res = await API.get(`/api/channel/${channelId}`);
    const { success, message, data } = res.data;
    if (success) {
      if (data.type === 'corp_app') {
        const [corp_id, agent_id] = data.app_id.split('|');
        data.corp_id = corp_id;
        data.agent_id = agent_id;
      }
      setInputs(data);
    } else {
      showError(message);
    }
    setLoading(false);
  };
  useEffect(() => {
    if (isEditing) {
      loadChannel().then();
    }
  }, []);

  const submit = async () => {
    if (!name) return;
    let res = undefined;
    let localInputs = { ...inputs };
    switch (inputs.type) {
      case 'corp_app':
        localInputs.app_id = `${inputs.corp_id}|${inputs.agent_id}`;
        break;
      case 'bark':
        if (localInputs.url === '') {
          localInputs.url = 'https://api.day.app';
        }
        break;
      case 'one_bot':
        if (localInputs.url.endsWith('/')) {
          localInputs.url = localInputs.url.slice(0, -1);
        }
        break;
      case 'group':
        let channels = localInputs.app_id.split('|');
        let targets = localInputs.account_id.split('|');
        if (localInputs.account_id === '') {
          for (let i = 0; i < channels.length - 1; i++) {
            localInputs.account_id += '|';
          }
        } else if (channels.length !== targets.length) {
          showError('群组通道的子通道数量与目标数量不匹配，对于不需要指定的目标请直接留空');
          return;
        }
    }
    if (isEditing) {
      res = await API.put(`/api/channel/`, {
        ...localInputs,
        id: parseInt(channelId)
      });
    } else {
      res = await API.post(`/api/channel`, localInputs);
    }
    const { success, message } = res.data;
    if (success) {
      if (isEditing) {
        showSuccess('通道信息更新成功！');
      } else {
        showSuccess('通道创建成功！');
        setInputs(originInputs);
      }
    } else {
      showError(message);
    }
  };

  const getTelegramChatId = async () => {
    if (inputs.telegram_bot_token === '') {
      showError('请先输入 Telegram 机器人令牌！');
      return;
    }
    let res = await axios.get(
      `https://api.telegram.org/bot${inputs.secret}/getUpdates`
    );
    const { ok } = res.data;
    if (ok) {
      let result = res.data.result;
      if (result.length === 0) {
        showError(`请先向你的机器人发送一条任意消息！`);
      } else {
        let id = result[0]?.message?.chat?.id;
        id = id.toString();
        setInputs((inputs) => ({ ...inputs, account_id: id }));
        showSuccess('会话 ID 获取成功！');
      }
    } else {
      showError(`发生错误：${res.description}`);
    }
  };

  const renderChannelForm = () => {
    switch (type) {
      case 'email':
        return (
          <>
            <Message>
              邮件推送方式（email）需要设置邮箱，请前往个人设置页面绑定邮箱地址，之后系统将自动为你创建邮箱推送通道。
            </Message>
          </>
        );
      case 'test':
        return (
          <>
            <Message>
              通过微信测试号进行推送，点击前往配置：
              <a
                target='_blank'
                href='https://mp.weixin.qq.com/debug/cgi-bin/sandboxinfo?action=showinfo&t=sandbox/index'
              >
                微信公众平台接口测试帐号
              </a>
              。
              <br />
              <br />
              需要新增测试模板，模板标题推荐填写为「消息推送」，模板内容必须填写为
              {' {{'}text.DATA{'}}'}。
            </Message>
            <Form.Group widths={3}>
              <Form.Input
                label='测试号 ID'
                name='app_id'
                onChange={handleInputChange}
                autoComplete='new-password'
                value={inputs.app_id}
                placeholder='测试号信息 -> appID'
              />
              <Form.Input
                label='测试号密钥'
                name='secret'
                type='password'
                onChange={handleInputChange}
                autoComplete='new-password'
                value={inputs.secret}
                placeholder='测试号信息 -> appsecret'
              />
              <Form.Input
                label='测试模板 ID'
                name='other'
                onChange={handleInputChange}
                autoComplete='new-password'
                value={inputs.other}
                placeholder='模板消息接口 -> 模板 ID'
              />
            </Form.Group>
            <Form.Group widths={3}>
              <Form.Input
                label='用户 Open ID'
                name='account_id'
                onChange={handleInputChange}
                autoComplete='new-password'
                value={inputs.account_id}
                placeholder='扫描测试号二维码 -> 用户列表 -> 微信号'
              />
            </Form.Group>
          </>
        );
      case 'corp_app':
        return (
          <>
            <Message>
              通过企业微信应用号进行推送，点击前往配置：
              <a
                target='_blank'
                href='https://work.weixin.qq.com/wework_admin/frame#apps'
              >
                企业微信应用管理
              </a>
              。
              <br />
              <br />
              注意，企业微信要求配置可信 IP，步骤：应用管理 -> 自建 -> 创建应用
              -> 应用设置页面下拉中找到「企业可信 IP」，点击配置 -> 设置可信域名
              -> 在「可调用
              JS-SDK、跳转小程序的可信域名」下面填写一个域名，然后点击「申请校验域名」，根据提示完成校验
              -> 之后填写服务器 IP 地址（此 IP
              地址是消息推送服务所部署在的服务器的 IP
              地址，未必是上面校验域名中记录的 IP 地址）。
            </Message>
            <Form.Group widths={3}>
              <Form.Input
                label='企业 ID'
                name='corp_id'
                onChange={handleInputChange}
                autoComplete='new-password'
                value={inputs.corp_id}
                placeholder='我的企业 -> 企业信息 -> 企业 ID'
              />
              <Form.Input
                label='应用 AgentId'
                name='agent_id'
                onChange={handleInputChange}
                autoComplete='new-password'
                value={inputs.agent_id}
                placeholder='应用管理 -> 自建 -> 创建应用 -> AgentId'
              />
              <Form.Input
                label='应用 Secret'
                name='secret'
                type='password'
                onChange={handleInputChange}
                autoComplete='new-password'
                value={inputs.secret}
                placeholder='应用管理 -> 自建 -> 创建应用 -> Secret'
              />
            </Form.Group>
            <Form.Group widths={3}>
              <Form.Input
                label='用户账号'
                name='account_id'
                onChange={handleInputChange}
                autoComplete='new-password'
                value={inputs.account_id}
                placeholder='通讯录 -> 点击姓名 -> 账号'
              />
              <Form.Select
                label='微信企业号客户端类型'
                name='other'
                options={[
                  {
                    key: 'plugin',
                    text: '微信中的企业微信插件',
                    value: 'plugin'
                  },
                  { key: 'app', text: '企业微信 APP', value: 'app' }
                ]}
                value={inputs.other}
                onChange={handleInputChange}
              />
            </Form.Group>
          </>
        );
      case 'corp':
        return (
          <>
            <Message>
              通过企业微信群机器人进行推送，配置流程：选择一个群聊 -> 设置 ->
              群机器人 -> 添加 -> 新建 -> 输入名字，点击添加 -> 点击复制 Webhook
              地址
            </Message>
            <Form.Group widths={2}>
              <Form.Input
                label='Webhook 地址'
                name='url'
                onChange={handleInputChange}
                autoComplete='new-password'
                value={inputs.url}
                placeholder='在此填写企业微信提供的 Webhook 地址'
              />
            </Form.Group>
          </>
        );
      case 'lark':
        return (
          <>
            <Message>
              通过飞书群机器人进行推送，飞书桌面客户端的配置流程：选择一个群聊
              -> 设置 -> 群机器人 -> 添加机器人 -> 自定义机器人 -> 添加（
              <strong>注意选中「签名校验」</strong>）。具体参见：
              <a
                target='_blank'
                href='https://open.feishu.cn/document/ukTMukTMukTM/ucTM5YjL3ETO24yNxkjN'
              >
                飞书开放文档
              </a>
            </Message>
            <Form.Group widths={2}>
              <Form.Input
                label='Webhook 地址'
                name='url'
                onChange={handleInputChange}
                autoComplete='new-password'
                value={inputs.url}
                placeholder='在此填写飞书提供的 Webhook 地址'
              />
              <Form.Input
                label='签名校验密钥'
                name='secret'
                type='password'
                onChange={handleInputChange}
                autoComplete='new-password'
                value={inputs.secret}
                placeholder='在此填写飞书提供的签名校验密钥'
              />
            </Form.Group>
          </>
        );
      case 'ding':
        return (
          <>
            <Message>
              通过钉钉群机器人进行推送，钉钉桌面客户端的配置流程：选择一个群聊
              -> 群设置 -> 智能群助手 -> 添加机器人（点击右侧齿轮图标） ->
              自定义 -> 添加（
              <strong>注意选中「加密」</strong>）。具体参见：
              <a
                target='_blank'
                href='https://open.dingtalk.com/document/robots/custom-robot-access'
              >
                钉钉开放文档
              </a>
            </Message>
            <Form.Group widths={2}>
              <Form.Input
                label='Webhook 地址'
                name='url'
                onChange={handleInputChange}
                autoComplete='new-password'
                value={inputs.url}
                placeholder='在此填写钉钉提供的 Webhook 地址'
              />
              <Form.Input
                label='签名校验密钥'
                name='secret'
                type='password'
                onChange={handleInputChange}
                autoComplete='new-password'
                value={inputs.secret}
                placeholder='在此填写钉钉提供的签名校验密钥'
              />
            </Form.Group>
          </>
        );
      case 'bark':
        return (
          <>
            <Message>
              通过 Bark 进行推送，下载 Bark 后按提示注册设备，之后会看到一个
              URL，例如 <code>https://api.day.app/wrsVSDRANDOM/Body Text</code>
              ，其中 <code>wrsVSDRANDOM</code> 就是你的推送 key。
            </Message>
            <Form.Group widths={2}>
              <Form.Input
                label='服务器地址'
                name='url'
                onChange={handleInputChange}
                autoComplete='new-password'
                value={inputs.url}
                placeholder='在此填写 Bark 服务器地址，不填则使用默认值'
              />
              <Form.Input
                label='推送 key'
                name='secret'
                type='password'
                onChange={handleInputChange}
                autoComplete='new-password'
                value={inputs.secret}
                placeholder='在此填写 Bark 推送 key'
              />
            </Form.Group>
          </>
        );
      case 'client':
        return (
          <>
            <Message>
              通过 WebSocket
              客户端进行推送，可以使用官方客户端实现，或者根据协议自行实现。官方客户端
              <a
                target='_blank'
                href='https://github.com/songquanpeng/personal-assistant'
              >
                详见此处
              </a>
              。
            </Message>
            <Form.Group widths={2}>
              <Form.Input
                label='客户端连接密钥'
                name='secret'
                type='password'
                onChange={handleInputChange}
                autoComplete='new-password'
                value={inputs.secret}
                placeholder='在此设置客户端连接密钥'
              />
            </Form.Group>
          </>
        );
      case 'telegram':
        return (
          <>
            <Message>
              通过 Telegram 机器人进行消息推送。首先向
              <a href='https://t.me/botfather' target='_blank'>
                {' '}
                Bot Father{' '}
              </a>
              申请创建一个新的机器人，之后在下方输入获取到的令牌，然后点击你的机器人，随便发送一条消息，之后点击下方的「获取会话
              ID」按钮，系统将自动为你填写会话
              ID，最后点击保存按钮保存设置即可。
            </Message>
            <Form.Group widths={2}>
              <Form.Input
                label='Telegram 机器人令牌'
                name='secret'
                type='password'
                onChange={handleInputChange}
                autoComplete='new-password'
                value={inputs.secret}
                placeholder='在此设置 Telegram 机器人令牌'
              />
              <Form.Input
                label='Telegram 会话 ID'
                name='account_id'
                type='text'
                onChange={handleInputChange}
                autoComplete='new-password'
                value={inputs.account_id}
                placeholder='在此设置 Telegram 会话 ID'
              />
            </Form.Group>
            <Button onClick={getTelegramChatId} loading={loading}>
              获取会话 ID
            </Button>
          </>
        );
      case 'discord':
        return (
          <>
            <Message>
              通过 Discord 群机器人进行推送，配置流程：选择一个 channel -> 设置
              -> 整合 -> 创建 Webhook -> 点击复制 Webhook URL
            </Message>
            <Form.Group widths={2}>
              <Form.Input
                label='Webhook 地址'
                name='url'
                onChange={handleInputChange}
                autoComplete='new-password'
                value={inputs.url}
                placeholder='在此填写 Discord 提供的 Webhook 地址'
              />
            </Form.Group>
          </>
        );
      case 'one_bot':
        return (
          <>
            <Message>
              通过 OneBot 协议进行推送，可以使用 <a href='https://github.com/Mrs4s/go-cqhttp'
                                                   target='_blank'>cqhttp</a> 等实现。
              利用 OneBot 协议可以实现推送 QQ 消息。
            </Message>
            <Form.Group widths={3}>
              <Form.Input
                label='服务器地址'
                name='url'
                onChange={handleInputChange}
                autoComplete='new-password'
                value={inputs.url}
                placeholder='在此填写服务器地址'
              />
              <Form.Input
                label='推送 key'
                name='secret'
                type='password'
                onChange={handleInputChange}
                autoComplete='new-password'
                value={inputs.secret}
                placeholder='在此填写服务器的 access token'
              />
              <Form.Input
                label='默认推送目标'
                name='account_id'
                onChange={handleInputChange}
                autoComplete='new-password'
                value={inputs.account_id}
                placeholder='在此填写默认推送目标，例如 QQ 号，如果是群号则前面必须加上群号前缀，例如 group_123456789'
              />
            </Form.Group>
          </>
        );
      case 'group':
        return (
          <>
            <Message>
              对渠道进行分组，然后在推送时选择分组进行推送，可以实现一次性推送到多个渠道的功能。
              <br />
              <br />
              推送目标如若不填，则使用子渠道的默认推送目标。如果填写，请务必全部按顺序填写，对于不需要指定的直接留空即可，例如 <code>123456789||@wechat</code>，两个连续的分隔符表示跳过该渠道。
            </Message>
            <Form.Group widths={2}>
              <Form.Input
                label='渠道列表'
                name='app_id'
                onChange={handleInputChange}
                autoComplete='new-password'
                value={inputs.app_id}
                placeholder='在此填写渠道列表，使用 | 分割，例如 bark|telegram|wechat'
              />
              <Form.Input
                label='默认推送目标'
                name='account_id'
                onChange={handleInputChange}
                autoComplete='new-password'
                value={inputs.account_id}
                placeholder='在此填写默认推送目标，使用 | 分割，例如 123456789|@wechat|@wechat'
              />
            </Form.Group>
          </>
        );
      case 'none':
        return (
          <>
            <Message>
              仅保存消息，不做推送，可以在 Web
              端查看，需要用户具有消息持久化的权限。
            </Message>
          </>
        );
      default:
        return (
          <>
            <Message>未知通道类型！</Message>
          </>
        );
    }
  };

  return (
    <>
      <Segment loading={loading}>
        <Header as='h3'>{isEditing ? '更新通道配置' : '新建消息通道'}</Header>
        <Form autoComplete='new-password'>
          <Form.Field>
            <Form.Input
              label='名称'
              name='name'
              placeholder={
                '请输入通道名称，请仅使用英文字母和下划线，该名称必须唯一'
              }
              onChange={handleInputChange}
              value={name}
              autoComplete='new-password'
              required
            />
          </Form.Field>
          <Form.Field>
            <Form.Input
              label='备注'
              name='description'
              type={'text'}
              placeholder={'请输入备注信息'}
              onChange={handleInputChange}
              value={description}
              autoComplete='new-password'
            />
          </Form.Field>
          <Form.Select
            label='通道类型'
            name='type'
            options={CHANNEL_OPTIONS}
            value={type}
            onChange={handleInputChange}
          />
          {renderChannelForm()}
          <Button disabled={type === 'email'} onClick={submit}>
            提交
          </Button>
        </Form>
      </Segment>
    </>
  );
};

export default EditChannel;
