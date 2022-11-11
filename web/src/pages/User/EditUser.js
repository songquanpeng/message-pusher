import React, { useEffect, useState } from 'react';
import { Button, Form, Header, Segment } from 'semantic-ui-react';
import { useParams } from 'react-router-dom';
import { API, showError, showSuccess } from '../../helpers';

const EditUser = () => {
  const params = useParams();
  const userId = params.id;
  const [loading, setLoading] = useState(true);
  const [inputs, setInputs] = useState({
    username: '',
    display_name: '',
    password: '',
    github_id: '',
    wechat_id: '',
    email: '',
    token: '',
  });
  const {
    username,
    display_name,
    password,
    github_id,
    wechat_id,
    email,
    token,
  } = inputs;
  const handleInputChange = (e, { name, value }) => {
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  };

  const loadUser = async () => {
    let res = undefined;
    if (userId) {
      res = await API.get(`/api/user/${userId}`);
    } else {
      res = await API.get(`/api/user/self`);
    }
    const { success, message, data } = res.data;
    if (success) {
      data.password = '';
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

  const submit = async () => {
    let res = undefined;
    if (userId) {
      res = await API.put(`/api/user/`, { ...inputs, id: parseInt(userId) });
    } else {
      res = await API.put(`/api/user/self`, inputs);
    }
    const { success, message } = res.data;
    if (success) {
      showSuccess('用户信息更新成功！');
    } else {
      showError(message);
    }
  };

  return (
    <>
      <Segment loading={loading}>
        <Header as='h3'>更新用户信息</Header>
        <Form autoComplete='off'>
          <Form.Field>
            <Form.Input
              label='用户名'
              name='username'
              placeholder={'请输入新的用户名'}
              onChange={handleInputChange}
              value={username}
              autoComplete='off'
            />
          </Form.Field>
          <Form.Field>
            <Form.Input
              label='密码'
              name='password'
              type={'password'}
              placeholder={'请输入新的密码'}
              onChange={handleInputChange}
              value={password}
              autoComplete='off'
            />
          </Form.Field>
          <Form.Field>
            <Form.Input
              label='显示名称'
              name='display_name'
              placeholder={'请输入新的显示名称'}
              onChange={handleInputChange}
              value={display_name}
              autoComplete='off'
            />
          </Form.Field>
          <Form.Field>
            <Form.Input
              label='推送鉴权 Token'
              name='token'
              placeholder={'请输入新的 Token，留空则将 Token 置空'}
              onChange={handleInputChange}
              value={token}
              autoComplete='off'
            />
          </Form.Field>
          <Form.Field>
            <Form.Input
              label='已绑定的 GitHub 账户'
              name='github_id'
              value={github_id}
              autoComplete='off'
              readOnly
              placeholder={'如需绑定请到个人设置页面进行绑定'}
            />
          </Form.Field>
          <Form.Field>
            <Form.Input
              label='已绑定的微信账户'
              name='wechat_id'
              value={wechat_id}
              autoComplete='off'
              readOnly
              placeholder={'如需绑定请到个人设置页面进行绑定'}
            />
          </Form.Field>
          <Form.Field>
            <Form.Input
              label='已绑定的邮箱账户'
              name='email'
              value={email}
              autoComplete='off'
              readOnly
              placeholder={'如需绑定请到个人设置页面进行绑定'}
            />
          </Form.Field>
          <Button onClick={submit}>提交</Button>
        </Form>
      </Segment>
    </>
  );
};

export default EditUser;
