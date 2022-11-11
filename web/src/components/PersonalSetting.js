import React, { useEffect, useState } from 'react';
import { Button, Form, Image, Modal } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { API, showError, showSuccess } from '../helpers';

const PersonalSetting = () => {
  const [inputs, setInputs] = useState({
    wechat_verification_code: '',
    email_verification_code: '',
    email: '',
  });
  const [status, setStatus] = useState({});
  const [showWeChatBindModal, setShowWeChatBindModal] = useState(false);
  const [showEmailBindModal, setShowEmailBindModal] = useState(false);

  useEffect(() => {
    let status = localStorage.getItem('status');
    if (status) {
      status = JSON.parse(status);
      setStatus(status);
    }
  }, []);

  const handleInputChange = (e, { name, value }) => {
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  };

  const bindWeChat = async () => {
    if (inputs.wechat_verification_code === '') return;
    const res = await API.get(
      `/api/oauth/wechat/bind?code=${inputs.wechat_verification_code}`
    );
    const { success, message } = res.data;
    if (success) {
      showSuccess('微信账户绑定成功！');
      setShowWeChatBindModal(false);
    } else {
      showError(message);
    }
  };

  const openGitHubOAuth = () => {
    window.open(
      `https://github.com/login/oauth/authorize?client_id=${status.github_client_id}&scope=user:email`
    );
  };

  const sendVerificationCode = async () => {
    if (inputs.email === '') return;
    const res = await API.get(`/api/verification?email=${inputs.email}`);
    const { success, message } = res.data;
    if (success) {
      showSuccess('验证码发送成功，请检查你的邮箱！');
    } else {
      showError(message);
    }
  };

  const bindEmail = async () => {
    if (inputs.email_verification_code === '') return;
    const res = await API.get(
      `/api/oauth/email/bind?email=${inputs.email}&code=${inputs.email_verification_code}`
    );
    const { success, message } = res.data;
    if (success) {
      showSuccess('邮箱账户绑定成功！');
      setShowEmailBindModal(false);
    } else {
      showError(message);
    }
  };

  return (
    <div style={{ lineHeight: '40px' }}>
      <Button as={Link} to={`/user/edit/`}>
        更新个人信息
      </Button>
      <Button
        onClick={() => {
          setShowWeChatBindModal(true);
        }}
      >
        绑定微信账号
      </Button>
      <Modal
        onClose={() => setShowWeChatBindModal(false)}
        onOpen={() => setShowWeChatBindModal(true)}
        open={showWeChatBindModal}
        size={'mini'}
      >
        <Modal.Content>
          <Modal.Description>
            <Image src={status.wechat_qrcode} fluid />
            <div style={{ textAlign: 'center' }}>
              <p>
                微信扫码关注公众号，输入「验证码」获取验证码（三分钟内有效）
              </p>
            </div>
            <Form size='large'>
              <Form.Input
                fluid
                placeholder='验证码'
                name='wechat_verification_code'
                value={inputs.wechat_verification_code}
                onChange={handleInputChange}
              />
              <Button color='teal' fluid size='large' onClick={bindWeChat}>
                绑定
              </Button>
            </Form>
          </Modal.Description>
        </Modal.Content>
      </Modal>
      <Button onClick={openGitHubOAuth}>绑定 GitHub 账号</Button>
      <Button
        onClick={() => {
          setShowEmailBindModal(true);
        }}
      >
        绑定邮箱地址
      </Button>
      <Modal
        onClose={() => setShowEmailBindModal(false)}
        onOpen={() => setShowEmailBindModal(true)}
        open={showEmailBindModal}
        size={'mini'}
      >
        <Modal.Header>绑定邮箱地址</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <Form size='large'>
              <Form.Input
                fluid
                placeholder='输入邮箱地址'
                onChange={handleInputChange}
                name='email'
                type='email'
                action={
                  <Button onClick={sendVerificationCode}>获取验证码</Button>
                }
              />
              <Form.Input
                fluid
                placeholder='验证码'
                name='email_verification_code'
                value={inputs.email_verification_code}
                onChange={handleInputChange}
              />
              <Button color='teal' fluid size='large' onClick={bindEmail}>
                绑定
              </Button>
            </Form>
          </Modal.Description>
        </Modal.Content>
      </Modal>
    </div>
  );
};

export default PersonalSetting;
