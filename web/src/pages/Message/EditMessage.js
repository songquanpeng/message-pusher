import React, { useEffect, useState } from 'react';
import { Button, Form, Header, Segment } from 'semantic-ui-react';
import { useParams } from 'react-router-dom';
import { API, showError, showSuccess } from '../../helpers';
import { loadUser, loadUserChannels } from '../../helpers/loader';

const EditMessage = () => {
  const params = useParams();
  const messageId = params.id;
  const isEditing = messageId !== undefined;
  let [user, setUser] = useState({
    id: '',
    username: '',
    channel: '',
    token: '',
  });
  let [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const originInputs = {
    title: '',
    description: '',
    content: '',
    url: '',
    channel: localStorage.getItem('editor_channel') || '',
    to: '',
    async: false,
  };

  const [inputs, setInputs] = useState(originInputs);
  const { title, description, content, url, channel, to, async } = inputs;

  const handleInputChange = (e, { name, value }) => {
    setInputs((inputs) => ({ ...inputs, [name]: value }));
    if (name === "channel") {
      localStorage.setItem('editor_channel', value);
    }
  };

  const loadMessage = async () => {
    let res = await API.get(`/api/message/${messageId}`);
    const { success, message, data } = res.data;
    if (success) {
      data.id = 0;
      setInputs(data);
    } else {
      showError(message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isEditing) {
      loadMessage().then();
    }
    const loader = async () => {
      let user = await loadUser();
      if (user) {
        setUser(user);
      }
      let channels = await loadUserChannels();
      if (channels) {
        setChannels(channels);
      }
    };
    loader().then();
  }, []);

  const send = async () => {
    if (!description && !content) return;
    let res = await API.post(`/push/${user.username}/`, {
      ...inputs,
      token: user.token,
    });
    const { success, message } = res.data;
    if (success) {
      if (isEditing) {
        showSuccess('消息重发成功！');
      } else {
        showSuccess('消息发送成功！');
        setInputs(originInputs);
      }
    } else {
      showError(message);
    }
  };

  return (
    <>
      <Segment loading={loading} className={'clearing'}>
        <Header as='h3'>消息编辑</Header>
        <Form>
          <Form.Group widths='equal'>
            <Form.Input
              label='标题'
              placeholder='请输入消息标题'
              value={inputs.title}
              name='title'
              onChange={handleInputChange}
            />
            <Form.Input
              label='接收者'
              placeholder='请输入接收者，不填使用默认接收者'
              value={inputs.to}
              name='to'
              onChange={handleInputChange}
            />
            <Form.Select
              label='推送方式'
              placeholder='请选择推送方式，否则使用默认方式'
              name='channel'
              options={channels}
              value={inputs.channel}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Input
              label='描述'
              placeholder='请输入消息描述'
              value={inputs.description}
              name='description'
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.TextArea
              label='内容'
              placeholder='请输入消息内容'
              value={inputs.content}
              name='content'
              onChange={handleInputChange}
              style={{ minHeight: 200, fontFamily: 'JetBrains Mono, Consolas' }}
            />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Input
              label='链接'
              placeholder='请输入消息链接'
              value={inputs.url}
              type={'url'}
              name='url'
              onChange={handleInputChange}
            />
          </Form.Group>
          <Button type='submit' floated='right' onClick={send}>
            发送
          </Button>
          <Button
            floated='right'
            onClick={() => {
              handleInputChange(null, { name: 'async', value: !async });
            }}
          >
            {async ? '异步' : '同步'}
          </Button>
        </Form>
      </Segment>
    </>
  );
};

export default EditMessage;
