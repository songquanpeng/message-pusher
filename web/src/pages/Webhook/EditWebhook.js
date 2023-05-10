import React, { useEffect, useState } from 'react';
import { Button, Form, Header, Message, Segment } from 'semantic-ui-react';
import { useParams } from 'react-router-dom';
import { API, showError, showSuccess, verifyJSON } from '../../helpers';
import { loadUserChannels } from '../../helpers/loader';

const EditWebhook = () => {
  const params = useParams();
  const webhookId = params.id;
  const isEditing = webhookId !== undefined;
  const [loading, setLoading] = useState(isEditing);
  const originInputs = {
    name: '',
    extract_rule: `{
  "title": "attr1",
  "description": "attr2.sub_attr",
  "content": "attr3",
  "url": "attr4"
}`,
    construct_rule:
      '{\n' +
      '  "title": "$title",\n' +
      '  "description": "描述信息：$description",\n' +
      '  "content": "内容：$content",\n' +
      '  "url": "https://example.com/$title"\n' +
      '}',
    channel: 'default',
  };

  const [inputs, setInputs] = useState(originInputs);
  const { name, extract_rule, construct_rule, channel } = inputs;
  let [channels, setChannels] = useState([]);

  const handleInputChange = (e, { name, value }) => {
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  };

  const loadWebhook = async () => {
    let res = await API.get(`/api/webhook/${webhookId}`);
    const { success, message, data } = res.data;
    if (success) {
      if (data.channel === '') {
        data.channel = 'default';
      }
      setInputs(data);
    } else {
      showError(message);
    }
    setLoading(false);
  };

  useEffect(() => {
    const loader = async () => {
      if (isEditing) {
        loadWebhook().then();
      }
      let channels = await loadUserChannels();
      if (channels) {
        channels.unshift({
          key: 'default',
          text: '默认通道',
          value: 'default',
          description: '使用默认通道',
        });
        setChannels(channels);
      }
    };
    loader().then();
  }, []);

  const submit = async () => {
    if (!name) return;
    if (!verifyJSON(extract_rule)) {
      showError('提取规则不是合法的 JSON 格式！');
      return;
    }
    if (!verifyJSON(construct_rule)) {
      showError('构造规则不是合法的 JSON 格式！');
      return;
    }
    let res = undefined;
    let localInputs = { ...inputs };
    if (localInputs.channel === 'default') {
      localInputs.channel = '';
    }
    if (isEditing) {
      res = await API.put(`/api/webhook/`, {
        ...localInputs,
        id: parseInt(webhookId),
      });
    } else {
      res = await API.post(`/api/webhook`, localInputs);
    }
    const { success, message } = res.data;
    if (success) {
      if (isEditing) {
        showSuccess('接口信息更新成功！');
      } else {
        showSuccess('接口创建成功！');
        setInputs(originInputs);
      }
    } else {
      showError(message);
    }
  };

  return (
    <>
      <Segment loading={loading}>
        <Header as='h3'>{isEditing ? '更新接口配置' : '新建消息接口'}</Header>
        <Form autoComplete='new-password'>
          <Form.Field>
            <Form.Input
              label='名称'
              name='name'
              placeholder={'请输入接口名称'}
              onChange={handleInputChange}
              value={name}
              autoComplete='new-password'
            />
          </Form.Field>
          <Form.Field>
            <Form.Select
              label='通道'
              name='channel'
              type={'text'}
              options={channels}
              placeholder={'请选择消息通道'}
              onChange={handleInputChange}
              value={channel}
              autoComplete='new-password'
              required
            />
          </Form.Field>
          <Message>
            如果你不知道如何写提取规则和构建规则，请看
            <a
              href='https://iamazing.cn/page/message-pusher-webhook'
              target='_blank'
            >
              此教程
            </a>
            。
          </Message>
          <Form.Group widths='equal'>
            <Form.TextArea
              label='提取规则'
              placeholder='在此输入提取规则，为一个 JSON，键为模板变量，值为 JSONPath 表达式'
              value={inputs.extract_rule}
              name='extract_rule'
              onChange={handleInputChange}
              style={{ minHeight: 200, fontFamily: 'JetBrains Mono, Consolas' }}
            />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.TextArea
              label='构建规则'
              placeholder='在此输入构建规则，不要改动 JSON 的键，只能改动值，值的部分可以引用模板变量，格式为 $VAR'
              value={inputs.construct_rule}
              name='construct_rule'
              onChange={handleInputChange}
              style={{ minHeight: 200, fontFamily: 'JetBrains Mono, Consolas' }}
            />
          </Form.Group>
          <Button onClick={submit}>提交</Button>
        </Form>
      </Segment>
    </>
  );
};

export default EditWebhook;
