import React, { useContext, useEffect } from 'react';
import { Card, Grid, Header, Segment } from 'semantic-ui-react';
import { API, showError, showNotice, timestamp2string } from '../../helpers';
import { StatusContext } from '../../context/Status';

const Home = () => {
  const [statusState, statusDispatch] = useContext(StatusContext);
  const homePageLink = localStorage.getItem('home_page_link') || '';

  const displayNotice = async () => {
    const res = await API.get('/api/notice');
    const { success, message, data } = res.data;
    if (success) {
      let oldNotice = localStorage.getItem('notice');
      if (data !== oldNotice && data !== '') {
        showNotice(data);
        localStorage.setItem('notice', data);
      }
    } else {
      showError(message);
    }
  };

  const getStartTimeString = () => {
    const timestamp = statusState?.status?.start_time;
    return timestamp2string(timestamp);
  };

  useEffect(() => {
    displayNotice().then();
  }, []);
  return (
    <>
      {homePageLink !== '' ? (
        <>
          <iframe
            src={homePageLink}
            style={{ width: '100%', height: '100vh', border: 'none' }}
          />
        </>
      ) : (
        <>
          <Segment>
            <Header as='h3'>系统状况</Header>
            <Grid columns={2} stackable>
              <Grid.Column>
                <Card fluid>
                  <Card.Content>
                    <Card.Header>系统信息</Card.Header>
                    <Card.Meta>系统信息总览</Card.Meta>
                    <Card.Description>
                      <p>名称：{statusState?.status?.system_name}</p>
                      <p>版本：{statusState?.status?.version}</p>
                      <p>
                        源码：
                        <a
                          href='https://github.com/songquanpeng/message-pusher'
                          target='_blank'
                        >
                          https://github.com/songquanpeng/message-pusher
                        </a>
                      </p>
                      <p>启动时间：{getStartTimeString()}</p>
                      <p>自从上次启动已发送消息数目：{statusState?.status?.message_count}</p>
                      <p>自从上次启动新注册用户数目：{statusState?.status?.user_count}</p>
                    </Card.Description>
                  </Card.Content>
                </Card>
              </Grid.Column>
              <Grid.Column>
                <Card fluid>
                  <Card.Content>
                    <Card.Header>系统配置</Card.Header>
                    <Card.Meta>系统配置总览</Card.Meta>
                    <Card.Description>
                      <p>
                        邮箱验证：
                        {statusState?.status?.email_verification === true
                          ? '已启用'
                          : '未启用'}
                      </p>
                      <p>
                        GitHub 身份验证：
                        {statusState?.status?.github_oauth === true
                          ? '已启用'
                          : '未启用'}
                      </p>
                      <p>
                        微信身份验证：
                        {statusState?.status?.wechat_login === true
                          ? '已启用'
                          : '未启用'}
                      </p>
                      <p>
                        Turnstile 用户校验：
                        {statusState?.status?.turnstile_check === true
                          ? '已启用'
                          : '未启用'}
                      </p>
                      <p>
                        全局消息持久化：
                        {statusState?.status?.message_persistence === true
                          ? '已启用'
                          : '未启用'}
                      </p>
                      <p>
                        全局消息渲染：
                        {statusState?.status?.message_render === true
                          ? '已启用'
                          : '未启用'}
                      </p>
                    </Card.Description>
                  </Card.Content>
                </Card>
              </Grid.Column>
            </Grid>
          </Segment>
        </>
      )}
    </>
  );
};

export default Home;
